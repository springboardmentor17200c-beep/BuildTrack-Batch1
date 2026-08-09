from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    TIMESTAMP,
    func
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)

    company_id = Column(
        Integer,
        ForeignKey("companies.company_id"),
        nullable=True
    )

    role_id = Column(
        Integer,
        ForeignKey("roles.role_id"),
        nullable=True
    )

    full_name = Column(String(100), nullable=False)

    email = Column(String(255), unique=True, nullable=False)

    password_hash = Column(String, nullable=False)

    phone_number = Column(String(20), nullable=False)

    profile_image = Column(String)

    is_active = Column(Boolean, default=True)

    last_login = Column(TIMESTAMP)

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now()
    )

    company = relationship("Company", back_populates="users")

    role = relationship("Role", back_populates="users")

    managed_projects = relationship(
    "Project",
    foreign_keys="Project.manager_id",
    back_populates="manager",
)

    client_projects = relationship(
    "Project",
    foreign_keys="Project.client_id",
    back_populates="client",
)