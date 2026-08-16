from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Boolean, Text, TIMESTAMP, func
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class MaterialCategory(Base):
    __tablename__ = "material_categories"

    material_category_id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(50), unique=True, nullable=False)
    description = Column(String)

class Material(Base):
    __tablename__ = "materials"

    material_id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=True)
    material_category_id = Column(Integer, ForeignKey("material_categories.material_category_id"), nullable=True)
    material_name = Column(String(150), nullable=False)
    unit = Column(String(50), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    category = relationship("MaterialCategory")
    company = relationship("Company", back_populates="materials")
    inventory_items = relationship("Inventory", back_populates="material", cascade="all, delete-orphan")

class Inventory(Base):
    __tablename__ = "inventory"

    inventory_id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)
    material_id = Column(Integer, ForeignKey("materials.material_id"), nullable=False)
    available_quantity = Column(Numeric(12, 2), default=0, nullable=False)
    minimum_stock_level = Column(Numeric(12, 2))
    storage_location = Column(String(150))
    last_updated = Column(DateTime, default=datetime.utcnow, nullable=False)

    material = relationship("Material", back_populates="inventory_items")
