from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.database import get_db
from app.models.company import Company
from app.models.project import Project
from app.models.resource import MaintenanceRecord, Resource, ResourceAllocation, ResourceCategory
from app.models.user import User
from app.schemas.resource import (
    MaintenanceRecordCreate,
    MaintenanceRecordResponse,
    MaintenanceRecordUpdate,
    ResourceAllocationCreate,
    ResourceAllocationResponse,
    ResourceAllocationUpdate,
    ResourceCreate,
    ResourceResponse,
    ResourceUpdate,
)

router = APIRouter(
    prefix="/resources",
    tags=["Resources"],
)

RESOURCE_STATUSES = {"Available", "Allocated", "Maintenance", "Retired"}
ALLOCATION_STATUSES = {"Allocated", "Returned", "Cancelled"}


def _resource_or_404(resource_id: int, db: Session) -> Resource:
    resource = db.query(Resource).filter(Resource.resource_id == resource_id).first()

    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found.")

    return resource


def _validate_resource_payload(payload: ResourceCreate | ResourceUpdate, db: Session) -> None:
    status_value = getattr(payload, "current_status", None)

    if status_value is not None and status_value not in RESOURCE_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Resource status must be one of: {', '.join(sorted(RESOURCE_STATUSES))}.",
        )

    category_id = getattr(payload, "resource_category_id", None)

    if category_id is not None:
        category = (
            db.query(ResourceCategory)
            .filter(ResourceCategory.resource_category_id == category_id)
            .first()
        )

        if not category:
            raise HTTPException(status_code=404, detail="Resource category not found.")


@router.get("", response_model=list[ResourceResponse])
def get_resources(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    query = db.query(Resource)

    if current_user.role.role_name != "Administrator":
        query = query.filter(Resource.company_id == current_user.company_id)

    return query.order_by(Resource.resource_name).all()


@router.post("", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
def create_resource(
    payload: ResourceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager")),
):
    company = db.query(Company).filter(Company.company_id == payload.company_id).first()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found.")

    _validate_resource_payload(payload, db)

    if payload.serial_number:
        duplicate = (
            db.query(Resource)
            .filter(Resource.serial_number == payload.serial_number)
            .first()
        )

        if duplicate:
            raise HTTPException(status_code=409, detail="Resource serial number already exists.")

    resource = Resource(**payload.model_dump())
    db.add(resource)
    db.commit()
    db.refresh(resource)

    return resource


@router.put("/{resource_id}", response_model=ResourceResponse)
def update_resource(
    resource_id: int,
    payload: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager")),
):
    resource = _resource_or_404(resource_id, db)
    _validate_resource_payload(payload, db)

    if payload.serial_number:
        duplicate = (
            db.query(Resource)
            .filter(
                Resource.serial_number == payload.serial_number,
                Resource.resource_id != resource_id,
            )
            .first()
        )

        if duplicate:
            raise HTTPException(status_code=409, detail="Resource serial number already exists.")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(resource, key, value)

    db.commit()
    db.refresh(resource)

    return resource


@router.delete("/{resource_id}")
def retire_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator")),
):
    resource = _resource_or_404(resource_id, db)
    resource.current_status = "Retired"
    db.commit()

    return {"message": "Resource retired successfully."}


@router.get("/allocations", response_model=list[ResourceAllocationResponse])
def get_allocations(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    return db.query(ResourceAllocation).order_by(ResourceAllocation.allocation_date.desc()).all()


@router.post(
    "/allocations",
    response_model=ResourceAllocationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_allocation(
    payload: ResourceAllocationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    resource = _resource_or_404(payload.resource_id, db)

    if resource.current_status not in {"Available", "Maintenance"}:
        raise HTTPException(status_code=400, detail="Resource is not available for allocation.")

    project = db.query(Project).filter(Project.project_id == payload.project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    allocator = db.query(User).filter(User.user_id == payload.allocated_by).first()

    if not allocator:
        raise HTTPException(status_code=404, detail="Allocator user not found.")

    if payload.expected_return_date and payload.expected_return_date < payload.allocation_date:
        raise HTTPException(status_code=400, detail="Expected return date cannot be before allocation date.")

    if payload.allocation_status not in ALLOCATION_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Allocation status must be one of: {', '.join(sorted(ALLOCATION_STATUSES))}.",
        )

    allocation = ResourceAllocation(**payload.model_dump())
    resource.current_status = "Allocated" if payload.allocation_status == "Allocated" else "Available"

    db.add(allocation)
    db.commit()
    db.refresh(allocation)

    return allocation


@router.put("/allocations/{allocation_id}", response_model=ResourceAllocationResponse)
def update_allocation(
    allocation_id: int,
    payload: ResourceAllocationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    allocation = (
        db.query(ResourceAllocation)
        .filter(ResourceAllocation.allocation_id == allocation_id)
        .first()
    )

    if not allocation:
        raise HTTPException(status_code=404, detail="Resource allocation not found.")

    update_data = payload.model_dump(exclude_unset=True)
    new_status = update_data.get("allocation_status")

    if new_status is not None and new_status not in ALLOCATION_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Allocation status must be one of: {', '.join(sorted(ALLOCATION_STATUSES))}.",
        )

    if new_status == "Returned" and update_data.get("actual_return_date") is None:
        update_data["actual_return_date"] = date.today()

    for key, value in update_data.items():
        setattr(allocation, key, value)

    if allocation.allocation_status == "Returned":
        allocation.resource.current_status = "Available"
    elif allocation.allocation_status == "Cancelled":
        allocation.resource.current_status = "Available"
    else:
        allocation.resource.current_status = "Allocated"

    db.commit()
    db.refresh(allocation)

    return allocation


@router.get("/maintenance", response_model=list[MaintenanceRecordResponse])
def get_maintenance_records(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    return db.query(MaintenanceRecord).order_by(MaintenanceRecord.maintenance_date.desc()).all()


@router.post(
    "/maintenance",
    response_model=MaintenanceRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_maintenance_record(
    payload: MaintenanceRecordCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    resource = _resource_or_404(payload.resource_id, db)
    record = MaintenanceRecord(**payload.model_dump())
    resource.current_status = "Maintenance"

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


@router.put("/maintenance/{maintenance_id}", response_model=MaintenanceRecordResponse)
def update_maintenance_record(
    maintenance_id: int,
    payload: MaintenanceRecordUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    record = (
        db.query(MaintenanceRecord)
        .filter(MaintenanceRecord.maintenance_id == maintenance_id)
        .first()
    )

    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found.")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, key, value)

    db.commit()
    db.refresh(record)

    return record
