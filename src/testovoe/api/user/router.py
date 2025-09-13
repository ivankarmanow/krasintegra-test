import datetime as dt
from typing import Annotated, Sequence

from fastapi import APIRouter, Depends
from src.testovoe.api.user.response import APIResponse
from src.testovoe.exception.not_enough_rights_exception import NotEnoughRightsException
from src.testovoe.main.dependencies import check_auth
from src.testovoe.model import User, UserIn
from src.testovoe.service import UserService

user = APIRouter(prefix="/user", tags=["user"])

user_service = Annotated[UserService, Depends()]


@user.get("/")
def list_users(service: user_service, user: check_auth) -> Sequence[User]:
    return service.all()


@user.post("/create")
def create_user(service: user_service, user_in: UserIn, user: check_auth) -> APIResponse:
    if not user.is_admin:
        raise NotEnoughRightsException()
    service.create(user_in, created_by=user.id)
    return APIResponse()


@user.delete("/delete")
def delete_user(service: user_service, user_id: int, user: check_auth) -> APIResponse:
    if not user.is_admin:
        raise NotEnoughRightsException()
    service.delete(user_id)
    return APIResponse()


@user.patch("/update")
def update_user(service: user_service, user_id: int, user_in: UserIn, user: check_auth) -> APIResponse:
    if not user.is_admin:
        raise NotEnoughRightsException()
    service.put(user_id, user_in)
    return APIResponse()


@user.get("/group_by_minutes")
def group_by_minutes(service: user_service, day: dt.date, hour: int, user: check_auth) -> dict[str, int]:
    return service.group_by_minutes(day, hour)


@user.get("/group_by_hours")
def group_by_minutes(service: user_service, day: dt.date, user: check_auth) -> dict[str, int]:
    return service.group_by_hours(day)
