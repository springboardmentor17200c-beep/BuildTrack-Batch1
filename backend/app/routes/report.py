from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

from app.db.database import get_db
from app.models.report import DBReport

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
            data={}
        ))
    return result

@router.post("", response_model=ReportSchema, status_code=status.HTTP_201_CREATED)
def generate_report(payload: CreateReportSchema, db: Session = Depends(get_db)):
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
