import datetime as dt
from typing import Annotated

from fastapi import Depends
from sqlalchemy import select, func, cast, Date, extract
from sqlalchemy.orm import joinedload
from src.testovoe.db import User as UserDB
from src.testovoe.exception import UserNotFoundException
from src.testovoe.main.dependencies import DbSession
from src.testovoe.model import UserPatch, User, UserIn
from src.testovoe.service.auth import AuthService
from src.testovoe.service.file import FileService


class UserService:
    def __init__(
        self, session: DbSession, auth: Annotated[AuthService, Depends()], file: Annotated[FileService, Depends()]
        ):
        self.session = session
        self.auth = auth
        self.file = file

    def all(self) -> list[User]:
        users = self.session.scalars(select(UserDB).options(joinedload(UserDB.created_by)))
        result = []
        for user in users:
            if user.created_by is not None:
                name = user.created_by.name
            else:
                name = None
            user.created_by = None
            user_app = User.model_validate(user)
            user_app.created_by = name
            result.append(user_app)
        return result

    def get(self, user_id: int) -> User:
        user = self.session.get(UserDB, user_id)
        if user:
            return User.model_validate(user)
        else:
            raise UserNotFoundException(user_id)

    def create(self, user_: UserIn, created_by: int) -> int:
        if user_.avatar_base64 is not None:
            avatar_path = self.file.save_base64(user_.avatar_base64)
        else:
            avatar_path = None
        delattr(user_, 'avatar_base64')
        user_ = UserDB(**user_.model_dump())
        user_.password = self.auth.get_password_hash(user_.password)
        user_.created_by_id = created_by
        user_.avatar_path = avatar_path
        self.session.add(user_)
        self.session.commit()
        return user_.id

    def delete(self, user_id: int) -> None:
        user = self.session.get(UserDB, user_id)
        if not user:
            raise UserNotFoundException(user_id)
        else:
            if user.avatar_path is not None:
                self.file.delete_file(user.avatar_path)
            self.session.delete(user)
            self.session.commit()

    def patch(self, user_id: int, new_user_data: UserPatch) -> None:
        old_user = self.session.get(UserDB, user_id)
        for key, value in new_user_data.model_dump().items():
            if value is not None:
                if key == "password":
                    value = self.auth.get_password_hash(value)
                if key == "avatar_base64":
                    key = "avatar_path"
                    if old_user.avatar_path is not None:
                        self.file.delete_file(old_user.avatar_path)
                    value = self.file.save_base64(value)
                setattr(old_user, key, value)
        self.session.add(old_user)
        self.session.commit()

    def put(self, user_id: int, new_user_data: UserIn) -> None:
        old_user = self.session.get(UserDB, user_id)
        change_pass = new_user_data.password is not None and new_user_data.password != ""
        for key, value in new_user_data.model_dump().items():
            if value is not None:
                if key == "password":
                    if not change_pass:
                        continue
                    value = self.auth.get_password_hash(value)
                if key == "avatar_base64":
                    key = "avatar_path"
                    if old_user.avatar_path is not None:
                        self.file.delete_file(old_user.avatar_path)
                    value = self.file.save_base64(value)
                setattr(old_user, key, value)
            elif key != "password":
                setattr(old_user, key, None)
        self.session.add(old_user)
        self.session.commit()

    def group_by_minutes(self, day: dt.date, hour: int) -> dict[str, int]:
        stmt = (
            select(
                func.date_trunc("minute", UserDB.created_at).label("minute"),
                func.count(UserDB.id).label("users_created"),
            )
            .where(
                cast(UserDB.created_at, Date) == day,
                extract("hour", UserDB.created_at) == hour
            )
            .group_by("minute")
            .order_by("minute")
        )
        res = self.session.execute(stmt)
        result = dict()
        d: dt.datetime
        for d, c in res:
            result[d.strftime("%H:%M")] = c
        return result

    def group_by_hours(self, day: dt.date) -> dict[str, int]:
        stmt = (
            select(
                func.date_trunc("hour", UserDB.created_at).label("hour"),
                func.count(UserDB.id).label("users_created"),
            )
            .where(
                cast(UserDB.created_at, Date) == day
            )
            .group_by("hour")
            .order_by("hour")
        )
        res = self.session.execute(stmt)
        result = dict()
        d: dt.datetime
        for d, c in res:
            result[d.strftime("%H")] = c
        return result
