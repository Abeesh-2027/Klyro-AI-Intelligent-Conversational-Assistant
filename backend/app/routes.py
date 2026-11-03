import time
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from . import llm
from .auth import User, current_user, require_admin
from .config import get_settings
from .db import get_db
from .documents import MAX_FILE_BYTES, best_chunks, extract_text, split_chunks
from .ratelimit import RateLimit
from .schemas import ChatId, ChatPatch, MessageIn, ProfileIn
from .text import clean_filename, clean_text, clean_title

router = APIRouter(prefix="/api")

MAX_CHATS_PER_USER = 200
MAX_MESSAGES_PER_CHAT = 400
MAX_FILES_PER_CHAT = 5
HISTORY_MESSAGES = 20
HISTORY_CHARS = 24_000
DEFAULT_TITLE = "New chat"

chat_limit = RateLimit(calls=20, seconds=60)
upload_limit = RateLimit(calls=10, seconds=60)


def now_ms() -> int:
    return int(time.time() * 1000)


def summary(chat: dict) -> dict:
    return {
        "id": chat["_id"],
        "title": chat["title"],
        "pinned": chat["pinned"],
        "created_at": chat["created_at"],
        "updated_at": chat["updated_at"],
    }


async def get_own_chat(db, chat_id: str, user: User) -> dict:
    chat = await db.chats.find_one({"_id": chat_id, "user_id": user.id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found.")
    return chat


def recent_history(messages: list[dict]) -> list[dict]:
    history = [{"role": m["role"], "content": m["content"]} for m in messages[-HISTORY_MESSAGES:]]
    while len(history) > 1 and sum(len(m["content"]) for m in history) > HISTORY_CHARS:
        history.pop(0)
    return history


@router.get("/me")
async def me(user: User = Depends(current_user)):
    return {**user.public(), "model": get_settings().groq_model}


@router.get("/me/profile")
async def get_profile(user: User = Depends(current_user), db=Depends(get_db)):
    profile = await db.profiles.find_one({"_id": user.id})
    return {"instructions": profile["instructions"] if profile else ""}


@router.put("/me/profile")
async def save_profile(body: ProfileIn, user: User = Depends(current_user), db=Depends(get_db)):
    instructions = clean_text(body.instructions)
    await db.profiles.update_one(
        {"_id": user.id},
        {"$set": {"instructions": instructions, "updated_at": now_ms()}},
        upsert=True,
    )
    return {"instructions": instructions}


@router.get("/chats")
async def list_chats(user: User = Depends(current_user), db=Depends(get_db)):
    cursor = db.chats.find({"user_id": user.id}, {"messages": 0}).sort("updated_at", -1).limit(MAX_CHATS_PER_USER)
    return [summary(chat) async for chat in cursor]


@router.post("/chats", status_code=201)
async def create_chat(user: User = Depends(current_user), db=Depends(get_db)):
    if await db.chats.count_documents({"user_id": user.id}) >= MAX_CHATS_PER_USER:
        raise HTTPException(status_code=400, detail="You have too many chats. Delete some first.")

    now = now_ms()
    chat = {
        "_id": uuid.uuid4().hex,
        "user_id": user.id,
        "title": DEFAULT_TITLE,
        "pinned": False,
        "messages": [],
        "created_at": now,
        "updated_at": now,
    }
    await db.chats.insert_one(chat)
    return summary(chat)


@router.get("/chats/{chat_id}")
async def get_chat(chat_id: ChatId, user: User = Depends(current_user), db=Depends(get_db)):
    chat = await get_own_chat(db, chat_id, user)
    files = [f["name"] async for f in db.files.find({"chat_id": chat_id, "user_id": user.id}, {"name": 1})]
    return {**summary(chat), "messages": chat["messages"], "files": files}


@router.patch("/chats/{chat_id}")
async def update_chat(chat_id: ChatId, body: ChatPatch, user: User = Depends(current_user), db=Depends(get_db)):
    changes = {}
    if body.title is not None:
        title = clean_title(body.title)
        if not title:
            raise HTTPException(status_code=422, detail="Title cannot be empty.")
        changes["title"] = title
    if body.pinned is not None:
        changes["pinned"] = body.pinned
    if not changes:
        raise HTTPException(status_code=422, detail="Nothing to update.")

    result = await db.chats.update_one({"_id": chat_id, "user_id": user.id}, {"$set": changes})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found.")
    return summary(await get_own_chat(db, chat_id, user))


@router.delete("/chats/{chat_id}", status_code=204)
async def delete_chat(chat_id: ChatId, user: User = Depends(current_user), db=Depends(get_db)):
    result = await db.chats.delete_one({"_id": chat_id, "user_id": user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found.")
    await db.files.delete_many({"chat_id": chat_id, "user_id": user.id})


@router.post("/chats/{chat_id}/messages", dependencies=[Depends(chat_limit)])
async def send_message(chat_id: ChatId, body: MessageIn, user: User = Depends(current_user), db=Depends(get_db)):
    chat = await get_own_chat(db, chat_id, user)
    if len(chat["messages"]) >= MAX_MESSAGES_PER_CHAT:
        raise HTTPException(status_code=400, detail="This chat is full. Please start a new chat.")

    text = clean_text(body.content)
    if not text:
        raise HTTPException(status_code=422, detail="Message cannot be empty.")

    user_message = {"id": uuid.uuid4().hex, "role": "user", "content": text, "created_at": now_ms()}
    if body.file_name:
        user_message["file_name"] = clean_filename(body.file_name)
    history = recent_history(chat["messages"] + [user_message])

    stored = db.files.find({"chat_id": chat_id, "user_id": user.id})
    chunks = [{"name": f["name"], "text": piece} async for f in stored for piece in f["chunks"]]
    excerpts = best_chunks(text, chunks)

    profile = await db.profiles.find_one({"_id": user.id})
    instructions = profile["instructions"] if profile else ""

    try:
        reply = await llm.ask_groq(history, user.name, instructions, excerpts)
    except llm.AIUnavailable:
        raise HTTPException(status_code=502, detail="The AI service is unavailable right now. Please try again.") from None

    assistant_message = {"id": uuid.uuid4().hex, "role": "assistant", "content": reply, "created_at": now_ms()}

    changes = {"updated_at": now_ms()}
    if chat["title"] == DEFAULT_TITLE and not chat["messages"]:
        changes["title"] = clean_title(text)[:36] or DEFAULT_TITLE

    await db.chats.update_one(
        {"_id": chat_id, "user_id": user.id},
        {"$push": {"messages": {"$each": [user_message, assistant_message]}}, "$set": changes},
    )
    return {
        "user_message": user_message,
        "assistant_message": assistant_message,
        "title": changes.get("title", chat["title"]),
    }


@router.post("/chats/{chat_id}/files", status_code=201, dependencies=[Depends(upload_limit)])
async def upload_file(chat_id: ChatId, file: UploadFile, user: User = Depends(current_user), db=Depends(get_db)):
    await get_own_chat(db, chat_id, user)

    if await db.files.count_documents({"chat_id": chat_id, "user_id": user.id}) >= MAX_FILES_PER_CHAT:
        raise HTTPException(status_code=400, detail=f"A chat can hold {MAX_FILES_PER_CHAT} files at most.")

    name = clean_filename(file.filename or "file")
    data = await file.read(MAX_FILE_BYTES + 1)
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="File is too large. The limit is 2 MB.")

    try:
        text = extract_text(name, data)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from None

    chunks = split_chunks(text)
    await db.files.insert_one(
        {
            "_id": uuid.uuid4().hex,
            "chat_id": chat_id,
            "user_id": user.id,
            "name": name,
            "chunks": chunks,
            "created_at": now_ms(),
        }
    )
    return {"name": name, "chunks": len(chunks)}


@router.get("/admin/stats")
async def admin_stats(_: User = Depends(require_admin), db=Depends(get_db)):
    totals = await (await db.chats.aggregate([{"$group": {"_id": None, "n": {"$sum": {"$size": "$messages"}}}}])).to_list(1)
    return {
        "users": len(await db.chats.distinct("user_id")),
        "chats": await db.chats.count_documents({}),
        "messages": totals[0]["n"] if totals else 0,
        "files": await db.files.count_documents({}),
    }
