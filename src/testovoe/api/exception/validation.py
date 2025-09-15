from fastapi.responses import JSONResponse
from starlette.requests import Request
from pydantic import ValidationError

from .response import ErrorResponse


def validation_error_handler(request: Request, exc: ValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content=ErrorResponse(
            error="ValidationError",
            extra_data={
                "errors": exc.errors()
            }
        ).model_dump()
    )
