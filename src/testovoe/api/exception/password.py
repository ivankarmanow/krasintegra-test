from fastapi.responses import JSONResponse
from starlette.requests import Request

from src.testovoe.exception import UsernameOrPasswordIncorrectException
from .response import ErrorResponse


def incorrect_password_handler(request: Request, exc: UsernameOrPasswordIncorrectException):
    return JSONResponse(
        status_code=403,
        content=ErrorResponse(
            error=str(exc),
            extra_data={
                "username": exc.username,
                "password": exc.password,
            }
        ).model_dump()
    )
