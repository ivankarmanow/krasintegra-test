from passlib.context import CryptContext
from sqlalchemy import select

from src.testovoe.db.user import GenderEnum
from src.testovoe.main.dependencies import get_config
from src.testovoe.main.dependencies.session import new_session
from src.testovoe.db import User

session = next(new_session())
config = get_config()
ctx = CryptContext(schemes=["bcrypt"])
exists = session.scalars(select(User).where(User.name == config.root_username)).one_or_none()
if not exists:
    session.add(User(
        name=config.root_username,
        gender=GenderEnum.male,
        birth_year=2006,
        is_admin=True,
        password=ctx.hash(config.root_password),
    ))
    session.commit()
