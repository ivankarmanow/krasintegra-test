from pydantic import BaseModel, Field


class APIResponse(BaseModel):
    status: bool = Field(default=True)


class TokenCreated(BaseModel):
    token: str


class UsernamePassword(BaseModel):
    username: str
    password: str
