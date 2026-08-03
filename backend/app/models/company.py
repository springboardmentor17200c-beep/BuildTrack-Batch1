from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Text,
    DateTime
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Company(Base):
    __tablename__ = "companies"

    company_id = Column(Integer, primary_key=True, index=True)

    company_name = Column(String(150), nullable=False)

    company_code = Column(String(20), unique=True, nullable=False, index=True)

    company_email = Column(String(255), unique=True, nullable=False)

    company_phone = Column(String(20), nullable=False)

    address = Column(Text, nullable=False)

    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationships
    users = relationship("User", back_populates="company")

    projects = relationship(
        "Project",
        back_populates="company",
        cascade="all, delete-orphan"
    )

    resources = relationship(
        "Resource",
        back_populates="company",
        cascade="all, delete-orphan"
    )

    inventory_items = relationship(
        "Inventory",
        back_populates="company",
        cascade="all, delete-orphan"
    )
