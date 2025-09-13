from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from src.testovoe.api import auth, user
from src.testovoe.api.exception.auth import auth_error_handler
from src.testovoe.api.exception.password import incorrect_password_handler
from src.testovoe.api.exception.user_not_found import user_not_found_handler
from src.testovoe.exception import UserNotFoundException, UsernameOrPasswordIncorrectException
from src.testovoe.exception.invalid_token import InvalidTokenException
from src.testovoe.exception.not_enough_rights_exception import NotEnoughRightsException
from src.testovoe.exception.token_expired import TokenExpiredException
from src.testovoe.exception.token_not_provided import TokenNotProvidedException
from src.testovoe.main.dependencies import get_config
from starlette.middleware.cors import CORSMiddleware


def init_routers(app: FastAPI):
    cfg = get_config()
    if cfg.static_files == "internal":
        upload_dir = get_config().upload_dir
        static = StaticFiles(directory=upload_dir)
        app.mount(f"/{upload_dir}", static)
    app.include_router(user)
    app.include_router(auth)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_exception_handler(UserNotFoundException, user_not_found_handler)
    app.add_exception_handler(UsernameOrPasswordIncorrectException, incorrect_password_handler)
    app.add_exception_handler(InvalidTokenException, auth_error_handler)
    app.add_exception_handler(TokenExpiredException, auth_error_handler)
    app.add_exception_handler(TokenNotProvidedException, auth_error_handler)
    app.add_exception_handler(NotEnoughRightsException, auth_error_handler)
