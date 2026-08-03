from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.database import get_db
from app.models.company import Company
from app.models.inventory import (
    Inventory,
    InventoryTransaction,
    Material,
    MaterialCategory,
    MaterialRequest,
)
from app.models.project import Project
from app.models.user import User
from app.schemas.inventory import (
    InventoryCreate,
    InventoryResponse,
    InventoryTransactionCreate,
    InventoryTransactionResponse,
    InventoryUpdate,
    MaterialCreate,
    MaterialRequestCreate,
    MaterialRequestResponse,
    MaterialRequestUpdate,
    MaterialResponse,
    MaterialUpdate,
)

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"],
)

TRANSACTION_TYPES = {"Receipt", "Issue", "Adjustment"}
REQUEST_STATUSES = {"Pending", "Approved", "Rejected", "Issued"}


def _inventory_or_404(inventory_id: int, db: Session) -> Inventory:
    inventory = db.query(Inventory).filter(Inventory.inventory_id == inventory_id).first()

    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory item not found.")

    return inventory


def _material_or_404(material_id: int, db: Session) -> Material:
    material = db.query(Material).filter(Material.material_id == material_id).first()

    if not material:
        raise HTTPException(status_code=404, detail="Material not found.")

    return material


@router.get("/materials", response_model=list[MaterialResponse])
def get_materials(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer", "Contractor")),
):
    return db.query(Material).order_by(Material.material_name).all()


@router.post("/materials", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
def create_material(
    payload: MaterialCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    category = (
        db.query(MaterialCategory)
        .filter(MaterialCategory.material_category_id == payload.material_category_id)
        .first()
    )

    if not category:
        raise HTTPException(status_code=404, detail="Material category not found.")

    duplicate = db.query(Material).filter(Material.material_name == payload.material_name).first()

    if duplicate:
        raise HTTPException(status_code=409, detail="Material already exists.")

    material = Material(**payload.model_dump())
    db.add(material)
    db.commit()
    db.refresh(material)

    return material


@router.put("/materials/{material_id}", response_model=MaterialResponse)
def update_material(
    material_id: int,
    payload: MaterialUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    material = _material_or_404(material_id, db)

    if payload.material_category_id is not None:
        category = (
            db.query(MaterialCategory)
            .filter(MaterialCategory.material_category_id == payload.material_category_id)
            .first()
        )

        if not category:
            raise HTTPException(status_code=404, detail="Material category not found.")

    if payload.material_name is not None:
        duplicate = (
            db.query(Material)
            .filter(Material.material_name == payload.material_name, Material.material_id != material_id)
            .first()
        )

        if duplicate:
            raise HTTPException(status_code=409, detail="Material already exists.")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(material, key, value)

    db.commit()
    db.refresh(material)

    return material


@router.get("/items", response_model=list[InventoryResponse])
def get_inventory_items(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer", "Contractor")),
):
    query = db.query(Inventory)

    if current_user.role.role_name != "Administrator":
        query = query.filter(Inventory.company_id == current_user.company_id)

    return query.order_by(Inventory.inventory_id).all()


@router.post("/items", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
def create_inventory_item(
    payload: InventoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    company = db.query(Company).filter(Company.company_id == payload.company_id).first()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found.")

    _material_or_404(payload.material_id, db)

    duplicate = (
        db.query(Inventory)
        .filter(Inventory.company_id == payload.company_id, Inventory.material_id == payload.material_id)
        .first()
    )

    if duplicate:
        raise HTTPException(status_code=409, detail="Inventory item already exists for this company and material.")

    inventory = Inventory(**payload.model_dump())
    db.add(inventory)
    db.commit()
    db.refresh(inventory)

    return inventory


@router.put("/items/{inventory_id}", response_model=InventoryResponse)
def update_inventory_item(
    inventory_id: int,
    payload: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    inventory = _inventory_or_404(inventory_id, db)

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(inventory, key, value)

    db.commit()
    db.refresh(inventory)

    return inventory


@router.get("/transactions", response_model=list[InventoryTransactionResponse])
def get_inventory_transactions(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    return db.query(InventoryTransaction).order_by(InventoryTransaction.transaction_date.desc()).all()


@router.post(
    "/transactions",
    response_model=InventoryTransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_inventory_transaction(
    payload: InventoryTransactionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    inventory = _inventory_or_404(payload.inventory_id, db)

    if payload.transaction_type not in TRANSACTION_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Transaction type must be one of: {', '.join(sorted(TRANSACTION_TYPES))}.",
        )

    creator = db.query(User).filter(User.user_id == payload.created_by).first()

    if not creator:
        raise HTTPException(status_code=404, detail="Creator user not found.")

    if payload.project_id is not None:
        project = db.query(Project).filter(Project.project_id == payload.project_id).first()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found.")

    quantity = Decimal(payload.quantity)

    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than zero.")

    if payload.transaction_type == "Receipt":
        inventory.available_quantity += quantity
    elif payload.transaction_type == "Issue":
        if inventory.available_quantity < quantity:
            raise HTTPException(status_code=400, detail="Insufficient inventory quantity.")

        inventory.available_quantity -= quantity
    else:
        inventory.available_quantity = quantity

    transaction = InventoryTransaction(**payload.model_dump())
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


@router.get("/material-requests", response_model=list[MaterialRequestResponse])
def get_material_requests(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer", "Contractor")),
):
    return db.query(MaterialRequest).order_by(MaterialRequest.request_date.desc()).all()


@router.post(
    "/material-requests",
    response_model=MaterialRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_material_request(
    payload: MaterialRequestCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer", "Contractor")),
):
    project = db.query(Project).filter(Project.project_id == payload.project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    requester = db.query(User).filter(User.user_id == payload.requested_by).first()

    if not requester:
        raise HTTPException(status_code=404, detail="Requester user not found.")

    _material_or_404(payload.material_id, db)

    if payload.request_status not in REQUEST_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Request status must be one of: {', '.join(sorted(REQUEST_STATUSES))}.",
        )

    request = MaterialRequest(**payload.model_dump())
    db.add(request)
    db.commit()
    db.refresh(request)

    return request


@router.put("/material-requests/{request_id}", response_model=MaterialRequestResponse)
def update_material_request(
    request_id: int,
    payload: MaterialRequestUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    request = (
        db.query(MaterialRequest)
        .filter(MaterialRequest.request_id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(status_code=404, detail="Material request not found.")

    update_data = payload.model_dump(exclude_unset=True)
    new_status = update_data.get("request_status")

    if new_status is not None and new_status not in REQUEST_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Request status must be one of: {', '.join(sorted(REQUEST_STATUSES))}.",
        )

    if new_status == "Approved" and request.request_status != "Approved":
        inventory = (
            db.query(Inventory)
            .filter(
                Inventory.company_id == request.project.company_id,
                Inventory.material_id == request.material_id,
            )
            .first()
        )

        if not inventory:
            raise HTTPException(status_code=404, detail="No inventory record exists for the requested material.")

        if inventory.available_quantity < request.requested_quantity:
            raise HTTPException(status_code=400, detail="Insufficient inventory quantity for this request.")

        inventory.available_quantity -= request.requested_quantity
        db.add(
            InventoryTransaction(
                inventory_id=inventory.inventory_id,
                project_id=request.project_id,
                transaction_type="Issue",
                quantity=request.requested_quantity,
                remarks=f"Material request #{request.request_id} approved.",
                created_by=current_user.user_id,
            )
        )

    for key, value in update_data.items():
        setattr(request, key, value)

    db.commit()
    db.refresh(request)

    return request
