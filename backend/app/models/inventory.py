from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    TIMESTAMP,
    func,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class Inventory(Base):
    __tablename__ = "inventory"

    inventory_id = Column(Integer, primary_key=True, index=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.project_id"),
        nullable=False,
    )

    material_id = Column(
        Integer,
        ForeignKey("materials.material_id"),
        nullable=False,
    )

    quantity_available = Column(
        Numeric(10, 2),
        nullable=False,
        default=0,
    )

    minimum_quantity = Column(
        Numeric(10, 2),
        nullable=False,
        default=0,
    )

    location_note = Column(Text)

    created_at = Column(
        TIMESTAMP,
        server_default=func.now(),
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now(),
    )

    project = relationship(
        "Project",
        back_populates="inventory_items",
    )

    material = relationship(
        "Material",
        back_populates="inventory_items",
    )
