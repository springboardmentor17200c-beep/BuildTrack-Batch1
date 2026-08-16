from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    Text,
    TIMESTAMP,
    func,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class Material(Base):
    __tablename__ = "materials"

    material_id = Column(Integer, primary_key=True, index=True)

    company_id = Column(
        Integer,
        ForeignKey("companies.company_id"),
        nullable=False,
    )

    material_name = Column(
        String(150),
        nullable=False,
    )

    description = Column(Text)

    unit = Column(
        String(50),
        nullable=False,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now(),
    )

    company = relationship(
        "Company",
        back_populates="materials",
    )

    inventory_items = relationship(
        "Inventory",
        back_populates="material",
        cascade="all, delete-orphan",
    )
