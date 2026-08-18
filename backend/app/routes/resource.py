from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.resource import ResourceCategory, Resource, ResourceAllocation, MaintenanceRecord
from app.schemas.resource import (
    ResourceCategoryCreate,
    ResourceCategoryResponse,
    ResourceCreate,
    ResourceResponse,
    ResourceAllocationCreate,
    ResourceAllocationUpdate,
    ResourceAllocationResponse,
    MaintenanceRecordCreate,
    MaintenanceRecordUpdate,
    MaintenanceRecordResponse
)

router = APIRouter(
    prefix="/resources",
    tags=["Resources"],
)

# --- Resource Categories ---

@router.get("/categories", response_model=list[dict])
def get_resource_categories(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    categories = db.query(ResourceCategory).all()
    result = []
    for cat in categories:
        count = db.query(Resource).filter(Resource.resource_category_id == cat.resource_category_id).count()
        result.append({
            "resource_category_id": cat.resource_category_id,
            "category_name": cat.category_name,
            "description": cat.description,
            "resources": count,
            "status": "Active"
        })
    return result

@router.post("/categories", response_model=ResourceCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_resource_category(payload: ResourceCategoryCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    duplicate = db.query(ResourceCategory).filter(ResourceCategory.category_name == payload.category_name).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="Resource category already exists.")
    category = ResourceCategory(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource_category(category_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    category = db.query(ResourceCategory).filter(ResourceCategory.resource_category_id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")
    count = db.query(Resource).filter(Resource.resource_category_id == category_id).count()
    if count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete category with associated resources.")
    db.delete(category)
    db.commit()

# --- Resources ---

@router.get("", response_model=list[dict])
def get_resources(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    resources = db.query(Resource).all()
    result = []
    for r in resources:
        item = {
            "resource_id": r.resource_id,
            "company_id": r.company_id,
            "resource_category_id": r.resource_category_id,
            "resource_name": r.resource_name,
            "manufacturer": r.manufacturer,
            "model_number": r.model_number,
            "serial_number": r.serial_number,
            "purchase_date": r.purchase_date,
            "current_status": r.current_status,
            "category_name": r.category.category_name if r.category else None
        }
        result.append(item)
    return result

# --- Resource Allocations ---

@router.get("/allocations", response_model=list[dict])
def get_resource_allocations(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    allocations = db.query(ResourceAllocation).all()
    result = []
    for a in allocations:
        result.append({
            "allocation_id": a.allocation_id,
            "resource_id": a.resource_id,
            "project_id": a.project_id,
            "allocated_by_id": a.allocated_by_id,
            "allocation_date": a.allocation_date,
            "expected_return_date": a.expected_return_date,
            "actual_return_date": a.actual_return_date,
            "allocation_status": a.allocation_status,
            "remarks": a.remarks,
            "resource_name": a.resource.resource_name if a.resource else None,
            "category_name": a.resource.category.category_name if a.resource and a.resource.category else None,
            "project_name": a.project.project_name if a.project else None,
            "allocated_by_name": a.allocated_by.full_name if a.allocated_by else None,
        })
    return result


@router.post("/allocations", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_resource_allocation(payload: ResourceAllocationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    allocation = ResourceAllocation(
        resource_id=payload.resource_id,
        project_id=payload.project_id,
        allocated_by_id=current_user.user_id,
        allocation_date=payload.allocation_date,
        expected_return_date=payload.expected_return_date,
        allocation_status="Allocated",
        remarks=payload.remarks
    )
    db.add(allocation)
    db.commit()
    db.refresh(allocation)
    return {"allocation_id": allocation.allocation_id}

@router.put("/allocations/{allocation_id}", response_model=dict)
def update_resource_allocation(allocation_id: int, payload: ResourceAllocationUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    allocation = db.query(ResourceAllocation).filter(ResourceAllocation.allocation_id == allocation_id).first()
    if not allocation:
        raise HTTPException(status_code=404, detail="Allocation not found.")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(allocation, key, value)
        
    db.commit()
    return {"allocation_id": allocation.allocation_id}

# --- Maintenance Records ---

@router.post("/maintenance", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_maintenance_record(payload: MaintenanceRecordCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    maintenance = MaintenanceRecord(
        resource_id=payload.resource_id,
        maintenance_type=payload.maintenance_type,
        maintenance_date=payload.maintenance_date,
        next_maintenance_date=payload.next_maintenance_date,
        maintenance_cost=payload.maintenance_cost,
        serviced_by=payload.serviced_by,
        remarks=payload.remarks
    )
    db.add(maintenance)
    
    # Optionally update resource status to "Under Maintenance"
    if payload.maintenance_type == 'Corrective':
        resource = db.query(Resource).filter(Resource.resource_id == payload.resource_id).first()
        if resource:
            resource.current_status = 'Under Maintenance'
            
    db.commit()
    db.refresh(maintenance)
    return {"maintenance_id": maintenance.maintenance_id}



@router.get("/maintenance", response_model=list[dict])
def get_maintenance_records(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    records = db.query(MaintenanceRecord).all()
    result = []
    for m in records:
        result.append({
            "maintenance_id": m.maintenance_id,
            "resource_id": m.resource_id,
            "maintenance_type": m.maintenance_type,
            "maintenance_date": m.maintenance_date,
            "next_maintenance_date": m.next_maintenance_date,
            "maintenance_cost": m.maintenance_cost,
            "serviced_by": m.serviced_by,
            "remarks": m.remarks,
            "resource_name": m.resource.resource_name if m.resource else None,
            "category_name": m.resource.category.category_name if m.resource and m.resource.category else None,
        })
    return result
