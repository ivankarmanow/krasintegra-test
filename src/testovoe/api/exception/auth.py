from fastapi.responses import JSONResponse
from starlette.requests import Request

from .response import ErrorResponse


def auth_error_handler(request: Request, exc: Exception):
    extra = {}
    if hasattr(exc, "token"):
        extra = {
            "token": exc.token
        }
    return JSONResponse(
        status_code=403,
        content=ErrorResponse(
            error=str(exc),
            extra_data={}
        ).model_dump()
    )
