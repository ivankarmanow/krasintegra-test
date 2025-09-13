import datetime as dt
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_serializer, Field

from src.testovoe.db.user import GenderEnum

class UserBase(BaseModel):
    name: str
    birth_year: int
    gender: GenderEnum
    is_admin: bool = False

class UserIn(UserBase):
    avatar_base64: Optional[str]
    password: str

class User(UserBase):
    id: int
    created_at: dt.datetime
    created_by: Optional[str] = None
    avatar_path: Optional[str]

    @field_serializer("created_at")
    def format_created_at(self, v: dt.datetime, _info):
        return v.strftime("%d-%m-%Y %H:%M")

    model_config = ConfigDict(from_attributes=True)


class UserPatch(BaseModel):
    name: Optional[str] = None
    birth_year: Optional[int] = None
    gender: Optional[GenderEnum] = None
    avatar_base64: Optional[str] = None
    is_admin: Optional[bool] = None
    password: Optional[str] = None
