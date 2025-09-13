from fastapi.responses import JSONResponse
from starlette.requests import Request

from .response import ErrorResponse


def auth_error_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=403,
        content=ErrorResponse(
            error=str(exc),
            extra_data={
                "token": exc.token or None,
            }
        ).model_dump()
    )
