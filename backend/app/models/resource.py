from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class ResourceCategory(Base):
    __tablename__ = "resource_categories"

    resource_category_id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(50), unique=True, nullable=False)
    description = Column(String)

class Resource(Base):
    __tablename__ = "resources"

    resource_id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)
    resource_category_id = Column(Integer, ForeignKey("resource_categories.resource_category_id"), nullable=False)
    resource_name = Column(String(100), nullable=False)
    manufacturer = Column(String(100))
    model_number = Column(String(100))
    serial_number = Column(String(100), unique=True)
    purchase_date = Column(Date)
    current_status = Column(String(30), default="Available", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    category = relationship("ResourceCategory")

class ResourceAllocation(Base):
    __tablename__ = "resource_allocations"

    allocation_id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.resource_id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    allocated_by_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    allocation_date = Column(Date, nullable=False)
    expected_return_date = Column(Date, nullable=False)
    actual_return_date = Column(Date, nullable=True)
    allocation_status = Column(String(30), default="Allocated", nullable=False)
    remarks = Column(String)
    
    resource = relationship("Resource")
    project = relationship("Project")
    allocated_by = relationship("User")

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    maintenance_id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.resource_id"), nullable=False)
    maintenance_type = Column(String(50), nullable=False)
    maintenance_date = Column(Date, nullable=False)
    next_maintenance_date = Column(Date, nullable=True)
    maintenance_cost = Column(Numeric(10, 2), nullable=False)
    serviced_by = Column(String(100), nullable=False)
    remarks = Column(String)

    resource = relationship("Resource")
