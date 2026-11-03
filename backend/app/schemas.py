from typing import Annotated, Optional

from fastapi import Path
from pydantic import BaseModel, ConfigDict, Field

ChatId = Annotated[str, Path(pattern=r"^[a-f0-9]{32}$")]


class Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


class MessageIn(Strict):
    content: str = Field(min_length=1, max_length=4000)
    file_name: Optional[str] = Field(default=None, max_length=100)


class ChatPatch(Strict):
    title: Optional[str] = Field(default=None, min_length=1, max_length=80)
    pinned: Optional[bool] = None


class ProfileIn(Strict):
    instructions: str = Field(default="", max_length=500)
