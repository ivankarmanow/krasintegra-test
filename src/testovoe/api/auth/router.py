from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.params import Header

from .response import UsernamePassword, TokenCreated, APIResponse
from src.testovoe.main.dependencies import check_auth
from src.testovoe.model import User
from src.testovoe.service import AuthService
from src.testovoe.exception.token_not_provided import TokenNotProvidedException

auth = APIRouter(prefix="/auth", tags=["auth"])
auth_service = Annotated[AuthService, Depends()]

@auth.get("/me")
def get_me(user: check_auth) -> User:
    if user.created_by:
        name = user.created_by.name
    else:
        name = None
    user.created_by = None
    user_app = User.model_validate(user)
    user_app.created_by = name
    return user_app

@auth.post("/login")
def login(service: auth_service, form: UsernamePassword) -> TokenCreated:
    token = service.authenticate(form.username, form.password)
    return TokenCreated(token=token)

@auth.post("/logout")
def logout(service: auth_service, x_token: Annotated[str | None, Header()]) -> APIResponse:
    if x_token is None:
        raise TokenNotProvidedException()
    service.logout(x_token)
    return APIResponse()
