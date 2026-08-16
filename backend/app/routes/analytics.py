from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List

from app.core.permissions import require_roles
from app.db.database import get_db
from app.models.project import Project
from app.models.project_milestone import ProjectMilestone
from app.models.vendor import Vendor

router = APIRouter(prefix="/analytics", tags=["Analytics"])

ALL_ROLES = ("Administrator", "Project Manager")


@router.get("/progress")
def get_progress_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    """Project progress: completion % derived from milestones per project."""
    projects = db.query(Project).all()
    result = []
    for p in projects:
        milestones = db.query(ProjectMilestone).filter(ProjectMilestone.project_id == p.project_id).all()
        total = len(milestones)
        completed = sum(1 for m in milestones if m.status == "Completed")
        completion_pct = round((completed / total) * 100) if total else 0

        status_name = p.status.status_name if p.status else "Planning"
        category_name = p.category.category_name if p.category else "Other"
        manager_name = p.manager.full_name if p.manager else ""

        result.append({
            "project_id": p.project_id,
            "project": p.project_name,
            "category": category_name,
            "status": status_name,
            "completion_percentage": completion_pct,
            "start_date": str(p.start_date),
            "expected_end_date": str(p.expected_end_date),
            "manager": manager_name,
            "total_milestones": total,
            "completed_milestones": completed,
        })
    return result


@router.get("/procurement")
def get_procurement_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    """Procurement analytics using raw SQL to match actual DB schema."""
    # Use raw SQL since the ORM model is out of sync with the real table
    po_rows = db.execute(text("""
        SELECT pr.procurement_request_id, pr.project_id, pr.vendor_id,
               pr.request_status, pr.request_date, pr.required_date,
               pr.po_id, pr.priority,
               p.project_name,
               v.vendor_name
        FROM procurement_requests pr
        LEFT JOIN projects p ON pr.project_id = p.project_id
        LEFT JOIN vendors v ON pr.vendor_id = v.vendor_id
        ORDER BY pr.request_date DESC
        LIMIT 50
    """)).fetchall()

    purchase_orders = []
    for row in po_rows:
        purchase_orders.append({
            "purchase_order_id": f"PO-{row[0]}",
            "project": row[8] or "Unknown",
            "vendor": row[9] or "Unknown",
            "order_date": str(row[4].date()) if row[4] else "",
            "expected_delivery_date": row[5] or "",
            "total_amount": 0,
            "order_status": row[3] or "Pending",
        })

    # Vendor summaries
    vendors = db.query(Vendor).all()
    vendor_summaries = []
    for v in vendors:
        vendor_req_count = db.execute(text(
            "SELECT COUNT(*) FROM procurement_requests WHERE vendor_id = :vid"
        ), {"vid": v.vendor_id}).scalar() or 0
        pending = db.execute(text(
            "SELECT COUNT(*) FROM procurement_requests WHERE vendor_id = :vid AND request_status IN ('Pending','Quoted')"
        ), {"vid": v.vendor_id}).scalar() or 0
        vendor_summaries.append({
            "vendor_id": f"V-{v.vendor_id}",
            "vendor_name": v.vendor_name,
            "total_orders": vendor_req_count,
            "total_spend": 0,
            "pending_invoices": pending,
        })

    return {
        "purchase_orders": purchase_orders,
        "vendors": vendor_summaries,
    }


@router.get("/summary")
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    """Top-level KPIs for the analytics hub."""
    projects = db.query(Project).all()
    total_projects = len(projects)
    in_progress = sum(1 for p in projects if p.status and p.status.status_name == "In Progress")

    all_milestones = db.query(ProjectMilestone).all()
    total_m = len(all_milestones)
    done_m = sum(1 for m in all_milestones if m.status == "Completed")
    avg_completion = round((done_m / total_m) * 100) if total_m else 0

    vendors_count = db.query(Vendor).count()
    requests_count = db.execute(text("SELECT COUNT(*) FROM procurement_requests")).scalar() or 0

    return {
        "total_projects": total_projects,
        "in_progress_projects": in_progress,
        "avg_completion_percent": avg_completion,
        "total_vendors": vendors_count,
        "total_procurement_requests": requests_count,
    }
