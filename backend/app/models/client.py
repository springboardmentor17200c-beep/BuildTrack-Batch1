from sqlalchemy import (
    Column,
    Integer,
    String,
    TIMESTAMP,
    func,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class Client(Base):
    __tablename__ = "clients"

    client_id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    client_code = Column(
        String(20),
        unique=True,
        nullable=False,
    )

    full_name = Column(
        String(100),
        nullable=False,
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False,
    )

    password_hash = Column(
        String,
        nullable=False,
    )

    phone_number = Column(
        String(20),
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
    )

    project = relationship(
        "Project",
        back_populates="client",
        uselist=False,
    )