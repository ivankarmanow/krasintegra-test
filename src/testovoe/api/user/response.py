from pydantic import BaseModel, Field


class APIResponse(BaseModel):
    status: bool = Field(default=True)


class UserCreated(APIResponse):
    user_id: int
