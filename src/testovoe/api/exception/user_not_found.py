from fastapi.responses import JSONResponse
from src.testovoe.exception import UserNotFoundException
from starlette.requests import Request

from .response import ErrorResponse


def user_not_found_handler(request: Request, exc: UserNotFoundException):
    return JSONResponse(
        status_code=404,
        content=ErrorResponse(
            error=str(exc),
            extra_data={
                "user_id": exc.user_id,
            }
        ).model_dump()
    )
