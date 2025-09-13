from typing import Annotated

from fastapi import Depends, Header
from src.testovoe.db import User
from src.testovoe.exception.token_not_provided import TokenNotProvidedException
from src.testovoe.service import AuthService


def check_auth_(service: Annotated[AuthService, Depends()], x_token: Annotated[str | None, Header()] = None) -> User:
    if x_token is None:
        raise TokenNotProvidedException(x_token)
    return service.get_user_by_token(x_token)


check_auth = Annotated[User, Depends(check_auth_)]
