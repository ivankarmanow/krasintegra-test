from pydantic import BaseModel


class ErrorResponse(BaseModel):
    status: bool = False
    error: str
    extra_data: dict
