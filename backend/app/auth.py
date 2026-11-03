import hashlib
import time
from dataclasses import dataclass

import httpx
from fastapi import Depends, HTTPException, Request

from .config import get_settings
from .text import clean_title

CACHE_SECONDS = 60
CACHE_LIMIT = 1000
_cache: dict[str, tuple[float, "User"]] = {}


@dataclass(frozen=True)
class User:
    id: str
    email: str
    name: str
    is_admin: bool

    def public(self) -> dict:
        return {"id": self.id, "email": self.email, "name": self.name, "is_admin": self.is_admin}


def read_token(request: Request) -> str:
    scheme, _, token = request.headers.get("authorization", "").partition(" ")
    if scheme.lower() != "bearer" or not token or len(token) > 4096:
        raise HTTPException(status_code=401, detail="Please sign in.")
    return token


async def current_user(request: Request) -> User:
    token = read_token(request)
    key = hashlib.sha256(token.encode()).hexdigest()
    now = time.monotonic()

    cached = _cache.get(key)
    if cached and cached[0] > now:
        return cached[1]

    settings = get_settings()
    try:
        response = await request.app.state.http.get(
            f"{settings.supabase_url}/auth/v1/user",
            headers={"Authorization": f"Bearer {token}", "apikey": settings.supabase_anon_key},
        )
    except httpx.HTTPError:
        raise HTTPException(status_code=503, detail="Sign-in service is unavailable. Try again soon.") from None

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Your session has expired. Please sign in again.")

    data = response.json()
    meta = data.get("user_metadata") or {}
    email = str(data.get("email") or "")
    name = clean_title(str(meta.get("full_name") or meta.get("name") or email.split("@")[0] or "User"))[:60]
    verified = bool(data.get("email_confirmed_at"))

    user = User(
        id=str(data["id"]),
        email=email,
        name=name or "User",
        is_admin=verified and email.lower() in settings.admin_list,
    )

    if len(_cache) >= CACHE_LIMIT:
        _cache.clear()
    _cache[key] = (now + CACHE_SECONDS, user)
    return user


async def require_admin(user: User = Depends(current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admins only.")
    return user
