from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.permissions import require_roles

router = APIRouter(
    prefix="/projects-data",
    tags=["Projects Data"],
)

@router.get("")
def get_projects_data(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer", "Client")),
):
    projects = [
        {
            "projectId": "P-1",
            "projectName": "Skyline Residency Tower",
            "description": "32-storey residential tower with podium parking and rooftop amenities.",
            "location": "Whitefield, Bengaluru",
            "category": "Residential",
            "status": "In Progress",
            "manager": "Priya Menon",
            "client": "L&T Realty",
            "startDate": "2025-11-01",
            "expectedEndDate": "2026-10-12",
            "actualEndDate": None,
        },
        {
            "projectId": "P-2",
            "projectName": "Riverside Business Park",
            "description": "Grade-A commercial office park with 4 towers and a central plaza.",
            "location": "Gachibowli, Hyderabad",
            "category": "Commercial",
            "status": "In Progress",
            "manager": "Karthik Iyer",
            "client": "NCC Limited",
            "startDate": "2026-02-15",
            "expectedEndDate": "2027-03-30",
            "actualEndDate": None,
        },
        {
            "projectId": "P-3",
            "projectName": "Greenfield Metro Extension",
            "description": "Elevated metro corridor extension, 6.2 km with 5 stations.",
            "location": "Patna Sector 4",
            "category": "Infrastructure",
            "status": "Completed",
            "manager": "Ananya Sharma",
            "client": "Bihar State Infra Corp",
            "startDate": "2024-06-01",
            "expectedEndDate": "2026-01-05",
            "actualEndDate": "2026-01-02",
        },
        {
            "projectId": "P-4",
            "projectName": "Harborview Logistics Hub",
            "description": "Warehousing and logistics hub with cold storage facility.",
            "location": "Vizag Port Area",
            "category": "Industrial",
            "status": "On Hold",
            "manager": "Rohan Desai",
            "client": "Adani Ports",
            "startDate": "2025-09-01",
            "expectedEndDate": "2026-08-18",
            "actualEndDate": None,
        },
    ]
    return projects

@router.get("/milestones")
def get_milestones_data(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    milestones = [
        { "milestoneId": "M-1", "projectId": "P-1", "projectName": "Skyline Residency Tower", "milestoneName": "Foundation Complete", "description": "Raft foundation and basement waterproofing.", "dueDate": "2026-02-01", "completionDate": "2026-01-28", "status": "Completed" },
        { "milestoneId": "M-2", "projectId": "P-1", "projectName": "Skyline Residency Tower", "milestoneName": "Structure Topped Out", "description": "All 32 floors of RCC structure complete.", "dueDate": "2026-07-15", "completionDate": None, "status": "In Progress" },
        { "milestoneId": "M-3", "projectId": "P-1", "projectName": "Skyline Residency Tower", "milestoneName": "MEP Rough-in Complete", "description": "Electrical, plumbing and HVAC rough-in for all floors.", "dueDate": "2026-09-01", "completionDate": None, "status": "Pending" },
        { "milestoneId": "M-4", "projectId": "P-2", "projectName": "Riverside Business Park", "milestoneName": "Site Grading Complete", "description": "Earthwork and site leveling across all 4 tower footprints.", "dueDate": "2026-04-01", "completionDate": "2026-03-30", "status": "Completed" },
        { "milestoneId": "M-5", "projectId": "P-2", "projectName": "Riverside Business Park", "milestoneName": "Tower A Foundation", "description": "Pile foundation for Tower A.", "dueDate": "2026-08-01", "completionDate": None, "status": "In Progress" },
        { "milestoneId": "M-6", "projectId": "P-3", "projectName": "Greenfield Metro Extension", "milestoneName": "Track Laying Complete", "description": "Ballast-less track across full corridor.", "dueDate": "2025-11-15", "completionDate": "2025-11-10", "status": "Completed" },
        { "milestoneId": "M-7", "projectId": "P-3", "projectName": "Greenfield Metro Extension", "milestoneName": "Commissioning & Handover", "description": "Signal testing and final handover to operator.", "dueDate": "2026-01-05", "completionDate": "2026-01-02", "status": "Completed" },
        { "milestoneId": "M-8", "projectId": "P-4", "projectName": "Harborview Logistics Hub", "milestoneName": "Environmental Clearance", "description": "Pending state pollution control board approval.", "dueDate": "2026-05-01", "completionDate": None, "status": "Pending" },
    ]
    return milestones
