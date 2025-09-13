from typing import Iterable, Annotated

from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from .config import get_config


def create_session_maker():
    db_uri = get_config().db_uri
    if not db_uri:
        raise ValueError("DB_URI env variable is not set")

    engine = create_engine(db_uri)
    return sessionmaker(engine, autoflush=False, expire_on_commit=False)


session_maker = create_session_maker()


def new_session() -> Iterable[Session]:
    with session_maker() as session:
        yield session


DbSession = Annotated[Session, Depends(new_session)]
