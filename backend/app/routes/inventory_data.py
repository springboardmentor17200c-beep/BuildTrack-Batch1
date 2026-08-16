from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.permissions import require_roles

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"],
)

@router.get("/materials")
def get_materials(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    return [
        { "materialId": "MAT-201", "materialName": "OPC 53 Grade Cement", "category": "Cement", "unitOfMeasure": "bags" },
        { "materialId": "MAT-202", "materialName": "PPC Cement", "category": "Cement", "unitOfMeasure": "bags" },
        { "materialId": "MAT-203", "materialName": "TMT Steel Bars (12mm)", "category": "Steel", "unitOfMeasure": "tons" },
        { "materialId": "MAT-204", "materialName": "TMT Steel Bars (8mm)", "category": "Steel", "unitOfMeasure": "tons" },
        { "materialId": "MAT-205", "materialName": "Red Clay Bricks", "category": "Bricks", "unitOfMeasure": "pieces" },
        { "materialId": "MAT-206", "materialName": "Fly Ash Bricks", "category": "Bricks", "unitOfMeasure": "pieces" },
        { "materialId": "MAT-207", "materialName": "River Sand", "category": "Sand", "unitOfMeasure": "tons" },
        { "materialId": "MAT-208", "materialName": "M-Sand", "category": "Sand", "unitOfMeasure": "tons" },
        { "materialId": "MAT-209", "materialName": "Ready Mix Concrete M25", "category": "Concrete", "unitOfMeasure": "cubic meters" },
        { "materialId": "MAT-210", "materialName": "Copper Electrical Wire", "category": "Electrical Materials", "unitOfMeasure": "meters" },
        { "materialId": "MAT-211", "materialName": "MCB Distribution Boards", "category": "Electrical Materials", "unitOfMeasure": "pieces" },
        { "materialId": "MAT-212", "materialName": "PVC Pipes (4 inch)", "category": "Plumbing Materials", "unitOfMeasure": "pieces" },
        { "materialId": "MAT-213", "materialName": "CPVC Fittings Set", "category": "Plumbing Materials", "unitOfMeasure": "sets" },
    ]

@router.get("")
def get_inventory(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    return [
        { "inventoryId": "INV-1", "materialId": "MAT-201", "materialName": "OPC 53 Grade Cement", "category": "Cement", "unitOfMeasure": "bags", "availableQuantity": 1200, "minimumStockLevel": 500, "storageLocation": "Central Warehouse", "lastUpdated": "2026-07-08" },
        { "inventoryId": "INV-2", "materialId": "MAT-202", "materialName": "PPC Cement", "category": "Cement", "unitOfMeasure": "bags", "availableQuantity": 180, "minimumStockLevel": 400, "storageLocation": "Central Warehouse", "lastUpdated": "2026-07-06" },
        { "inventoryId": "INV-3", "materialId": "MAT-203", "materialName": "TMT Steel Bars (12mm)", "category": "Steel", "unitOfMeasure": "tons", "availableQuantity": 42, "minimumStockLevel": 20, "storageLocation": "Central Warehouse", "lastUpdated": "2026-07-07" },
        { "inventoryId": "INV-4", "materialId": "MAT-204", "materialName": "TMT Steel Bars (8mm)", "category": "Steel", "unitOfMeasure": "tons", "availableQuantity": 6, "minimumStockLevel": 15, "storageLocation": "Central Warehouse", "lastUpdated": "2026-07-05" },
        { "inventoryId": "INV-5", "materialId": "MAT-205", "materialName": "Red Clay Bricks", "category": "Bricks", "unitOfMeasure": "pieces", "availableQuantity": 45000, "minimumStockLevel": 10000, "storageLocation": "Yard B", "lastUpdated": "2026-07-09" },
        { "inventoryId": "INV-6", "materialId": "MAT-206", "materialName": "Fly Ash Bricks", "category": "Bricks", "unitOfMeasure": "pieces", "availableQuantity": 0, "minimumStockLevel": 8000, "storageLocation": "Yard B", "lastUpdated": "2026-06-29" },
        { "inventoryId": "INV-7", "materialId": "MAT-207", "materialName": "River Sand", "category": "Sand", "unitOfMeasure": "tons", "availableQuantity": 85, "minimumStockLevel": 30, "storageLocation": "Yard A", "lastUpdated": "2026-07-08" },
        { "inventoryId": "INV-8", "materialId": "MAT-208", "materialName": "M-Sand", "category": "Sand", "unitOfMeasure": "tons", "availableQuantity": 12, "minimumStockLevel": 25, "storageLocation": "Yard A", "lastUpdated": "2026-07-04" },
        { "inventoryId": "INV-9", "materialId": "MAT-209", "materialName": "Ready Mix Concrete M25", "category": "Concrete", "unitOfMeasure": "cubic meters", "availableQuantity": 60, "minimumStockLevel": 20, "storageLocation": "Central Warehouse", "lastUpdated": "2026-07-09" },
        { "inventoryId": "INV-10", "materialId": "MAT-210", "materialName": "Copper Electrical Wire", "category": "Electrical Materials", "unitOfMeasure": "meters", "availableQuantity": 3200, "minimumStockLevel": 1000, "storageLocation": "Central Warehouse", "lastUpdated": "2026-07-03" },
        { "inventoryId": "INV-11", "materialId": "MAT-211", "materialName": "MCB Distribution Boards", "category": "Electrical Materials", "unitOfMeasure": "pieces", "availableQuantity": 4, "minimumStockLevel": 10, "storageLocation": "Central Warehouse", "lastUpdated": "2026-07-02" },
        { "inventoryId": "INV-12", "materialId": "MAT-212", "materialName": "PVC Pipes (4 inch)", "category": "Plumbing Materials", "unitOfMeasure": "pieces", "availableQuantity": 0, "minimumStockLevel": 200, "storageLocation": "Central Warehouse", "lastUpdated": "2026-06-27" },
        { "inventoryId": "INV-13", "materialId": "MAT-213", "materialName": "CPVC Fittings Set", "category": "Plumbing Materials", "unitOfMeasure": "sets", "availableQuantity": 340, "minimumStockLevel": 100, "storageLocation": "Central Warehouse", "lastUpdated": "2026-07-07" },
    ]

@router.get("/transactions")
def get_transactions(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    return [
        { "transactionId": "TXN-4001", "inventoryId": "INV-6", "materialName": "Fly Ash Bricks", "projectId": "Skyline Residency Tower", "transactionType": "Issued", "quantity": 15000, "transactionDate": "2026-07-05", "createdBy": "Priya Menon" },
        { "transactionId": "TXN-4002", "inventoryId": "INV-12", "materialName": "PVC Pipes (4 inch)", "projectId": "Riverside Business Park", "transactionType": "Issued", "quantity": 500, "transactionDate": "2026-07-01", "createdBy": "Karthik Iyer" },
    ]

@router.get("/material-requests")
def get_material_requests(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    return [
        { "requestId": "MR-3001", "project": "Riverside Business Park", "requestedBy": "Karthik Iyer", "materialId": "MAT-202", "materialName": "PPC Cement", "category": "Cement", "unitOfMeasure": "bags", "requestedQuantity": 150, "requestDate": "2026-07-07", "requestStatus": "Pending" },
        { "requestId": "MR-3002", "project": "Skyline Residency Tower", "requestedBy": "Priya Menon", "materialId": "MAT-211", "materialName": "MCB Distribution Boards", "category": "Electrical Materials", "unitOfMeasure": "pieces", "requestedQuantity": 6, "requestDate": "2026-07-06", "requestStatus": "Pending" },
        { "requestId": "MR-3003", "project": "Riverside Business Park", "requestedBy": "Karthik Iyer", "materialId": "MAT-212", "materialName": "PVC Pipes (4 inch)", "category": "Plumbing Materials", "unitOfMeasure": "pieces", "requestedQuantity": 500, "requestDate": "2026-07-01", "requestStatus": "Approved" },
        { "requestId": "MR-3004", "project": "Skyline Residency Tower", "requestedBy": "Priya Menon", "materialId": "MAT-208", "materialName": "M-Sand", "category": "Sand", "unitOfMeasure": "tons", "requestedQuantity": 40, "requestDate": "2026-06-28", "requestStatus": "Rejected", "remarks": "Insufficient stock and no pending purchase order" },
    ]

@router.get("/allocations")
def get_allocations(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    return [
        { "allocationId": "ALL-001", "materialId": "MAT-201", "materialName": "OPC 53 Grade Cement", "projectId": "Skyline Residency Tower", "projectName": "Skyline Residency Tower", "allocatedQuantity": 200, "issuedQuantity": 150, "returnedQuantity": 0, "allocatedDate": "2026-07-08", "issuedDate": "2026-07-09", "status": "Issued", "allocatedBy": "Manager A", "issuedTo": "Site Supervisor", "remarks": "Foundation work" },
        { "allocationId": "ALL-002", "materialId": "MAT-203", "materialName": "TMT Steel Bars (12mm)", "projectId": "Riverside Business Park", "projectName": "Riverside Business Park", "allocatedQuantity": 10, "issuedQuantity": 0, "returnedQuantity": 0, "allocatedDate": "2026-07-10", "issuedDate": None, "status": "Reserved", "allocatedBy": "Manager B", "issuedTo": "Project Manager", "remarks": "Pending delivery" },
    ]
