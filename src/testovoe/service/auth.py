import datetime as dt

from passlib.context import CryptContext
from sqlalchemy import select

from src.testovoe.db import User, Token
from src.testovoe.exception.invalid_token import InvalidTokenException
from src.testovoe.exception.token_expired import TokenExpiredException
from src.testovoe.exception.username_or_password_incorrect import UsernameOrPasswordIncorrectException
from src.testovoe.main.dependencies import DbSession


class AuthService:
    def __init__(self, session: DbSession):
        self.session = session
        self.pwd_context = CryptContext(schemes=["bcrypt"])

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return self.pwd_context.hash(password)

    def authenticate(self, name: str, password: str) -> str:
        user = self.session.scalars(select(User).where(User.name == name)).one_or_none()
        if user is None:
            raise UsernameOrPasswordIncorrectException(name, password)
        if not self.verify_password(password, user.password):
            raise UsernameOrPasswordIncorrectException(name, password)
        token = Token(user_id=user.id)
        self.session.add(token)
        self.session.commit()
        return str(token.token)

    def logout(self, token: str) -> None:
        token = self.session.scalars(select(Token).where(Token.token == token)).one_or_none()
        if token is not None:
            self.session.delete(token)
            self.session.commit()

    def get_user_by_token(self, token: str) -> User:
        token = self.session.scalars(select(Token).where(Token.token == token)).one_or_none()
        if not token:
            raise InvalidTokenException(token)
        if token.expires_at < dt.datetime.now():
            raise TokenExpiredException(token)
        return self.session.get(User, token.user_id)
