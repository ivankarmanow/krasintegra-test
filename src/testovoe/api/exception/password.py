from fastapi.responses import JSONResponse
from src.testovoe.exception import UsernameOrPasswordIncorrectException
from starlette.requests import Request

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
