from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class ResourceCategory(Base):
    __tablename__ = "resource_categories"

    resource_category_id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)

    resources = relationship("Resource", back_populates="category")


class Resource(Base):
    __tablename__ = "resources"

    resource_id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)
    resource_category_id = Column(
        Integer,
        ForeignKey("resource_categories.resource_category_id"),
        nullable=False,
    )
    resource_name = Column(String(100), nullable=False)
    manufacturer = Column(String(100))
    model_number = Column(String(100))
    serial_number = Column(String(100), unique=True)
    purchase_date = Column(Date)
    current_status = Column(String(30), nullable=False, default="Available")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    company = relationship("Company", back_populates="resources")
    category = relationship("ResourceCategory", back_populates="resources")
    allocations = relationship("ResourceAllocation", back_populates="resource")
    maintenance_records = relationship("MaintenanceRecord", back_populates="resource")


class ResourceAllocation(Base):
    __tablename__ = "resource_allocations"

    allocation_id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.resource_id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    allocated_by = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    allocation_date = Column(Date, nullable=False)
    expected_return_date = Column(Date)
    actual_return_date = Column(Date)
    allocation_status = Column(String(30), nullable=False, default="Allocated")
    remarks = Column(Text)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    resource = relationship("Resource", back_populates="allocations")
    project = relationship("Project", back_populates="resource_allocations")
    allocator = relationship("User", back_populates="resource_allocations")


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    maintenance_id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.resource_id"), nullable=False)
    maintenance_type = Column(String(100), nullable=False)
    maintenance_date = Column(Date, nullable=False)
    next_maintenance_date = Column(Date)
    maintenance_cost = Column(Numeric(12, 2))
    serviced_by = Column(String(150))
    remarks = Column(Text)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    resource = relationship("Resource", back_populates="maintenance_records")
