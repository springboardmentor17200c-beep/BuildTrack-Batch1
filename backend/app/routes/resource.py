from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.permissions import require_roles

router = APIRouter(
    prefix="/resources",
    tags=["Resources"],
)

@router.get("")
def get_resources(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    resources = [
        { "resourceId": 'R-101', "resourceName": 'CAT 320 Excavator', "category": 'Excavators', "manufacturer": 'Caterpillar', "modelNumber": '320GC', "serialNumber": 'CAT320-8841', "purchaseDate": '2024-03-10', "currentStatus": 'Allocated' },
        { "resourceId": 'R-102', "resourceName": 'JCB 3DX Excavator', "category": 'Excavators', "manufacturer": 'JCB', "modelNumber": '3DX', "serialNumber": 'JCB3DX-2210', "purchaseDate": '2023-11-02', "currentStatus": 'Available' },
        { "resourceId": 'R-103', "resourceName": 'Schwing Stetter Mixer', "category": 'Concrete Mixers', "manufacturer": 'Schwing Stetter', "modelNumber": 'AM 40 SP', "serialNumber": 'SS40-5521', "purchaseDate": '2024-01-18', "currentStatus": 'Allocated' },
        { "resourceId": 'R-104', "resourceName": 'Ajax Concrete Mixer', "category": 'Concrete Mixers', "manufacturer": 'Ajax', "modelNumber": 'CM-14', "serialNumber": 'AJX14-1187', "purchaseDate": '2022-08-25', "currentStatus": 'Under Maintenance' },
        { "resourceId": 'R-105', "resourceName": 'Liebherr Tower Crane', "category": 'Cranes', "manufacturer": 'Liebherr', "modelNumber": '132 EC-H', "serialNumber": 'LB132-0093', "purchaseDate": '2023-05-14', "currentStatus": 'Allocated' },
        { "resourceId": 'R-106', "resourceName": 'Mobile Crane 50T', "category": 'Cranes', "manufacturer": 'XCMG', "modelNumber": 'QY50KA', "serialNumber": 'XCM50-6602', "purchaseDate": '2022-12-01', "currentStatus": 'Available' },
        { "resourceId": 'R-107', "resourceName": 'Tata Signa Dump Truck', "category": 'Dump Trucks', "manufacturer": 'Tata Motors', "modelNumber": 'Signa 4021', "serialNumber": 'TSG40-3345', "purchaseDate": '2024-02-20', "currentStatus": 'Allocated' },
        { "resourceId": 'R-108', "resourceName": 'Ashok Leyland Dump Truck', "category": 'Dump Trucks', "manufacturer": 'Ashok Leyland', "modelNumber": '2523', "serialNumber": 'ASH25-7789', "purchaseDate": '2023-09-08', "currentStatus": 'Available' },
        { "resourceId": 'R-109', "resourceName": 'Mahindra Diesel Generator', "category": 'Generators', "manufacturer": 'Mahindra Powerol', "modelNumber": 'MPG-125', "serialNumber": 'MPG125-4471', "purchaseDate": '2023-07-11', "currentStatus": 'Allocated' },
        { "resourceId": 'R-110', "resourceName": 'Kirloskar Generator 125kVA', "category": 'Generators', "manufacturer": 'Kirloskar', "modelNumber": 'KG1-125', "serialNumber": 'KG1-9982', "purchaseDate": '2022-10-30', "currentStatus": 'Available' },
        { "resourceId": 'R-111', "resourceName": 'Safety Harness Set (x40)', "category": 'Safety Equipment', "manufacturer": '3M', "modelNumber": 'DBI-Sala', "serialNumber": '3M-SET-2201', "purchaseDate": '2024-04-01', "currentStatus": 'Allocated' },
        { "resourceId": 'R-112', "resourceName": 'Fire Safety Kit (x10)', "category": 'Safety Equipment', "manufacturer": 'Ceasefire', "modelNumber": 'CF-Kit-10', "serialNumber": 'CF10-5567', "purchaseDate": '2023-06-19', "currentStatus": 'Available' },
    ]
    return resources

@router.get("/allocations")
def get_resource_allocations(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    allocations = [
        { "allocationId": 'A-2001', "resourceId": 'R-101', "resourceName": 'CAT 320 Excavator', "category": 'Excavators', "project": 'Skyline Residency Tower', "allocatedBy": 'Priya Menon', "allocationDate": '2026-06-15', "expectedReturnDate": '2026-08-10', "actualReturnDate": None, "allocationStatus": 'Allocated' },
        { "allocationId": 'A-2002', "resourceId": 'R-103', "resourceName": 'Schwing Stetter Mixer', "category": 'Concrete Mixers', "project": 'Riverside Business Park', "allocatedBy": 'Karthik Iyer', "allocationDate": '2026-06-20', "expectedReturnDate": '2026-07-25', "actualReturnDate": None, "allocationStatus": 'Allocated' },
        { "allocationId": 'A-2003', "resourceId": 'R-105', "resourceName": 'Liebherr Tower Crane', "category": 'Cranes', "project": 'Skyline Residency Tower', "allocatedBy": 'Priya Menon', "allocationDate": '2026-05-01', "expectedReturnDate": '2026-09-30', "actualReturnDate": None, "allocationStatus": 'Allocated' },
        { "allocationId": 'A-2004', "resourceId": 'R-107', "resourceName": 'Tata Signa Dump Truck', "category": 'Dump Trucks', "project": 'Riverside Business Park', "allocatedBy": 'Karthik Iyer', "allocationDate": '2026-06-05', "expectedReturnDate": '2026-07-05', "actualReturnDate": None, "allocationStatus": 'Overdue' },
        { "allocationId": 'A-2005', "resourceId": 'R-109', "resourceName": 'Mahindra Diesel Generator', "category": 'Generators', "project": 'Skyline Residency Tower', "allocatedBy": 'Priya Menon', "allocationDate": '2026-06-18', "expectedReturnDate": '2026-08-01', "actualReturnDate": None, "allocationStatus": 'Allocated' },
        { "allocationId": 'A-2006', "resourceId": 'R-111', "resourceName": 'Safety Harness Set (x40)', "category": 'Safety Equipment', "project": 'Riverside Business Park', "allocatedBy": 'Karthik Iyer', "allocationDate": '2026-06-28', "expectedReturnDate": '2026-08-15', "actualReturnDate": None, "allocationStatus": 'Allocated' },
        { "allocationId": 'A-1998', "resourceId": 'R-104', "resourceName": 'Ajax Concrete Mixer', "category": 'Concrete Mixers', "project": 'Skyline Residency Tower', "allocatedBy": 'Priya Menon', "allocationDate": '2026-03-01', "expectedReturnDate": '2026-04-01', "actualReturnDate": '2026-03-30', "allocationStatus": 'Returned' },
    ]
    return allocations

@router.get("/maintenance")
def get_resource_maintenance(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    maintenance_records = [
        { "maintenanceId": 'M-9001', "resourceId": 'R-104', "maintenanceType": 'Engine Repair', "maintenanceDate": '2026-06-25', "nextMaintenanceDate": '2026-09-25', "maintenanceCost": 18500, "servicedBy": 'Ajax Authorized Service' },
        { "maintenanceId": 'M-9002', "resourceId": 'R-101', "maintenanceType": 'Routine Service', "maintenanceDate": '2026-06-01', "nextMaintenanceDate": '2026-09-01', "maintenanceCost": 6200, "servicedBy": 'Caterpillar Service Center' },
        { "maintenanceId": 'M-9003', "resourceId": 'R-105', "maintenanceType": 'Cable Inspection', "maintenanceDate": '2026-05-20', "nextMaintenanceDate": '2026-08-20', "maintenanceCost": 9800, "servicedBy": 'Liebherr Field Team' },
        { "maintenanceId": 'M-9004', "resourceId": 'R-109', "maintenanceType": 'Routine Service', "maintenanceDate": '2026-06-10', "nextMaintenanceDate": '2026-09-10', "maintenanceCost": 3100, "servicedBy": 'Mahindra Powerol Service' },
        { "maintenanceId": 'M-9005', "resourceId": 'R-107', "maintenanceType": 'Tyre Replacement', "maintenanceDate": '2026-05-05', "nextMaintenanceDate": '2026-11-05', "maintenanceCost": 24000, "servicedBy": 'Tata Fleet Service' },
    ]
    return maintenance_records
