from datetime import datetime
from enum import StrEnum
from typing import Optional, TYPE_CHECKING

from sqlalchemy import ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .base import Base

if TYPE_CHECKING:
    from .token import Token


class GenderEnum(StrEnum):
    male = "male"
    female = "female"


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(unique=True)
    birth_year: Mapped[int] = mapped_column(CheckConstraint("year BETWEEN 1900 AND 2025"))
    gender: Mapped[GenderEnum]
    avatar_path: Mapped[Optional[str]]
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
    created_by_id: Mapped[Optional[int]] = mapped_column(ForeignKey("user.id"), nullable=True)
    is_admin: Mapped[bool] = mapped_column(default=False)
    password: Mapped[str]

    tokens: Mapped[list["Token"]] = relationship(back_populates="user")
    created_by: Mapped["User"] = relationship(remote_side=[id])
