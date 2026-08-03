from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    TIMESTAMP,
    Text,
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
        nullable=False
    )

    full_name = Column(String(100), nullable=False)

    email = Column(String(255), unique=True, nullable=False)

    password_hash = Column(String, nullable=False)

    phone_number = Column(String(20), nullable=False)

    profile_image = Column(String)

    is_active = Column(Boolean, default=True)

    # Registration Approval Workflow
    registration_status = Column(
        String(20),
        nullable=False,
        default="Pending"
    )

    approved_by = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=True
    )

    approved_at = Column(TIMESTAMP)

    rejected_reason = Column(Text)

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

    # Relationships

    company = relationship(
        "Company",
        back_populates="users"
    )

    role = relationship(
        "Role",
        back_populates="users"
    )

    approved_by_user = relationship(
        "User",
        remote_side=[user_id],
        foreign_keys=[approved_by]
    )

    employee_profile = relationship(
        "EmployeeProfile",
        back_populates="user",
        uselist=False,
    )

    managed_projects = relationship(
        "Project",
        foreign_keys="Project.manager_id",
        back_populates="manager",
    )

    resource_allocations = relationship(
        "ResourceAllocation",
        back_populates="allocator",
    )

    inventory_transactions = relationship(
        "InventoryTransaction",
        back_populates="creator",
    )

    material_requests = relationship(
        "MaterialRequest",
        back_populates="requester",
    )