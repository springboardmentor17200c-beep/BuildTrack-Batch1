from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

from app.db.database import get_db
from app.models.report import DBReport
from app.models.project import Project
from app.models.project_milestone import ProjectMilestone
from app.models.procurement_request import ProcurementRequest
from app.models.workforce import EmployeeProfile, Attendance

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

class ReportSchema(BaseModel):
    id: str
    title: str
    type: str
    generatedDate: str
    status: str
    format: str
    description: str
    data: Optional[Any] = {}

class CreateReportSchema(BaseModel):
    type: str
    title: Optional[str] = None
    filter: Optional[Any] = {}

@router.get("", response_model=List[ReportSchema])
def get_all_reports(db: Session = Depends(get_db)):
    db_reports = db.query(DBReport).all()
    result = []
    for r in db_reports:
        result.append(ReportSchema(
            id=f"rep-{r.report_id}",
            title=r.file_name,
            type=r.report_type,
            generatedDate=r.generated_at.isoformat(),
            status="generated",
            format="both",
            description=f"Generated {r.report_type} report",
            data=r.report_data or {}
        ))
    return result

@router.post("/project/{project_id}/generate", response_model=ReportSchema, status_code=status.HTTP_201_CREATED)
def generate_project_report(project_id: int, payload: CreateReportSchema, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # 1. Project Info
    project_data = {
        "project_id": project.project_id,
        "project_name": project.project_name,
        "description": project.description,
        "location": project.location,
        "start_date": project.start_date.isoformat() if project.start_date else None,
        "expected_end_date": project.expected_end_date.isoformat() if project.expected_end_date else None,
        "status": project.status.status_name if project.status else "Unknown"
    }

    # 2. Milestones
    milestones = db.query(ProjectMilestone).filter(ProjectMilestone.project_id == project_id).all()
    milestone_data = [
        {
            "name": m.milestone_name,
            "due_date": m.due_date.isoformat() if m.due_date else None,
            "status": m.status
        } for m in milestones
    ]

    # 3. Procurement
    procurements = db.query(ProcurementRequest).filter(ProcurementRequest.project_id == project_id).all()
    procurement_data = [
        {
            "type": p.request_type,
            "description": p.description,
            "status": p.request_status,
            "date": p.request_date.isoformat() if p.request_date else None
        } for p in procurements
    ]

    # 4. Workforce / Labor
    employees = db.query(EmployeeProfile).filter(EmployeeProfile.project_id == project_id).all()
    emp_ids = [e.employee_id for e in employees]
    
    attendance_stats = {"Present": 0, "Absent": 0, "Half Day": 0}
    if emp_ids:
        attendances = db.query(
            Attendance.attendance_status, 
            func.count(Attendance.attendance_id)
        ).filter(Attendance.employee_id.in_(emp_ids)).group_by(Attendance.attendance_status).all()
        for status_val, count in attendances:
            if status_val in attendance_stats:
                attendance_stats[status_val] = count
            else:
                attendance_stats[status_val] = count

    workforce_data = {
        "total_employees": len(employees),
        "attendance_summary": attendance_stats
    }

    aggregated_data = {
        "project": project_data,
        "milestones": milestone_data,
        "procurement": procurement_data,
        "workforce": workforce_data,
        "generated_at": datetime.utcnow().isoformat()
    }

    title = payload.title or f"Comprehensive Report - {project.project_name}"
    report_type = payload.type or "project_comprehensive"

    new_db_report = DBReport(
        generated_by=None,
        project_id=project_id,
        report_type=report_type,
        file_name=title,
        file_path=f"/exports/{report_type}_{project_id}_{int(datetime.utcnow().timestamp())}.pdf",
        report_data=aggregated_data
    )
    db.add(new_db_report)
    db.commit()
    db.refresh(new_db_report)

    return ReportSchema(
        id=f"rep-{new_db_report.report_id}",
        title=new_db_report.file_name,
        type=new_db_report.report_type,
        generatedDate=new_db_report.generated_at.isoformat(),
        status="generated",
        format="both",
        description=f"Auto-generated {report_type} report for project {project.project_name}",
        data=aggregated_data
    )

@router.post("", response_model=ReportSchema, status_code=status.HTTP_201_CREATED)
def generate_report(payload: CreateReportSchema, db: Session = Depends(get_db)):
    # Fallback generic report generator
    report_type = payload.type
    title = payload.title or f"{report_type.capitalize()} Report - {datetime.utcnow().strftime('%Y-%m-%d')}"
    
    new_db_report = DBReport(
        generated_by=None,
        report_type=report_type,
        file_name=title,
        file_path=f"/exports/{report_type}_{int(datetime.utcnow().timestamp())}.pdf"
    )
    db.add(new_db_report)
    db.commit()
    db.refresh(new_db_report)

    return ReportSchema(
        id=f"rep-{new_db_report.report_id}",
        title=new_db_report.file_name,
        type=new_db_report.report_type,
        generatedDate=new_db_report.generated_at.isoformat(),
        status="generated",
        format="both",
        description=f"Auto-generated {report_type} report from database",
        data={}
    )

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(report_id: str, db: Session = Depends(get_db)):
    raw_id = report_id.replace("rep-", "")
    if not raw_id.isdigit():
        raise HTTPException(status_code=400, detail="Invalid report ID format")
    
    r = db.query(DBReport).filter(DBReport.report_id == int(raw_id)).first()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    
    db.delete(r)
    db.commit()
    return None
