from fastapi.responses import JSONResponse
from starlette.requests import Request

from .response import ErrorResponse


def base_error_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content=ErrorResponse(
            error=str(exc),
            extra_data={
                "type": exc.__class__.__name__,
                "path": request.url.path
            }
        ).model_dump()
    )
