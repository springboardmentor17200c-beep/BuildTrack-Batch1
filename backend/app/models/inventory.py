from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class MaterialCategory(Base):
    __tablename__ = "material_categories"

    material_category_id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)

    materials = relationship("Material", back_populates="category")


class Material(Base):
    __tablename__ = "materials"
    __table_args__ = (
        UniqueConstraint("material_name", name="uq_material_name"),
    )

    material_id = Column(Integer, primary_key=True, index=True)
    material_category_id = Column(
        Integer,
        ForeignKey("material_categories.material_category_id"),
        nullable=False,
    )
    material_name = Column(String(150), nullable=False)
    unit_of_measure = Column(String(20), nullable=False)
    description = Column(Text)

    category = relationship("MaterialCategory", back_populates="materials")
    inventory_items = relationship("Inventory", back_populates="material")
    requests = relationship("MaterialRequest", back_populates="material")


class Inventory(Base):
    __tablename__ = "inventory"
    __table_args__ = (
        UniqueConstraint("company_id", "material_id", name="uq_company_material"),
    )

    inventory_id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)
    material_id = Column(Integer, ForeignKey("materials.material_id"), nullable=False)
    available_quantity = Column(Numeric(12, 2), nullable=False, default=0)
    minimum_stock_level = Column(Numeric(12, 2))
    storage_location = Column(String(150))
    last_updated = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    company = relationship("Company", back_populates="inventory_items")
    material = relationship("Material", back_populates="inventory_items")
    transactions = relationship("InventoryTransaction", back_populates="inventory")


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    transaction_id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.inventory_id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.project_id"))
    transaction_type = Column(String(30), nullable=False)
    quantity = Column(Numeric(12, 2), nullable=False)
    transaction_date = Column(DateTime, server_default=func.now(), nullable=False)
    remarks = Column(Text)
    created_by = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    inventory = relationship("Inventory", back_populates="transactions")
    project = relationship("Project", back_populates="inventory_transactions")
    creator = relationship("User", back_populates="inventory_transactions")


class MaterialRequest(Base):
    __tablename__ = "material_requests"

    request_id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    requested_by = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    material_id = Column(Integer, ForeignKey("materials.material_id"), nullable=False)
    requested_quantity = Column(Numeric(12, 2), nullable=False)
    request_date = Column(DateTime, server_default=func.now(), nullable=False)
    request_status = Column(String(30), nullable=False, default="Pending")
    remarks = Column(Text)

    project = relationship("Project", back_populates="material_requests")
    requester = relationship("User", back_populates="material_requests")
    material = relationship("Material", back_populates="requests")
