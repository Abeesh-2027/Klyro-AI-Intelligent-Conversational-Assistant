from fastapi import Request


def get_db(request: Request):
    return request.app.state.db


async def create_indexes(db) -> None:
    await db.chats.create_index([("user_id", 1), ("updated_at", -1)])
    await db.files.create_index([("chat_id", 1), ("user_id", 1)])
