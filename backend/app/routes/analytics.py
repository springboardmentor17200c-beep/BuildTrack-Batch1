from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List

import json
import os
from app.core.permissions import require_roles
from app.db.database import get_db
from app.models.project import Project
from app.models.project_milestone import ProjectMilestone
from app.models.vendor import Vendor

router = APIRouter(prefix="/analytics", tags=["Analytics"])

ALL_ROLES = ("Administrator", "Project Manager", "Client", "Client / Owner", "Engineer", "Contractor", "Worker")


@router.get("/progress")
def get_progress_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    """Project progress: completion % derived from milestones per project."""
    query = db.query(Project)
    if current_user.role and current_user.role.role_name == "Project Manager":
        query = query.filter(Project.manager_id == current_user.user_id)
    elif current_user.role and current_user.role.role_name in ("Client", "Client / Owner"):
        query = query.filter(Project.client_id == current_user.user_id)
    projects = query.all()
    result = []
    for p in projects:
        milestones = db.query(ProjectMilestone).filter(ProjectMilestone.project_id == p.project_id).all()
        total = len(milestones)
        completed = sum(1 for m in milestones if m.status == "Completed")
        # Sum the percentage weight of all completed milestones
        completion_pct = sum((m.progress_percentage or 0) for m in milestones if m.status == "Completed")
        # Cap at 100
        completion_pct = min(100, completion_pct)

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
    """Procurement analytics using JSON store data to match the active procurement system."""
    
    # Read directly from the JSON store where actual procurement happens
    store_path = os.path.join(os.path.dirname(__file__), "..", "..", "procurement_store.json")
    try:
        with open(store_path, "r", encoding="utf-8") as f:
            store_data = json.load(f)
    except Exception:
        store_data = {"vendors": {}, "requests": {}, "purchase_orders": {}, "invoices": {}}

    db_requests = store_data.get("requests", {})
    db_pos = store_data.get("purchase_orders", {})
    db_invoices = store_data.get("invoices", {})
    
    # Retrieve all vendors from PostgreSQL to ensure we don't miss any UI vendors
    postgres_vendors = db.query(Vendor).all()
    vendor_map = {str(v.vendor_id): v.vendor_name for v in postgres_vendors}
    # Also blend with JSON vendors in case they only exist there
    for vid, v in store_data.get("vendors", {}).items():
        if str(vid) not in vendor_map:
            vendor_map[str(vid)] = v.get("name", "Unknown")

    purchase_orders = []
    for po_id, po in db_pos.items():
        req = db_requests.get(po.get("requestId"), {})
        proj_name = "Unknown"
        # We need to map projectId (e.g. "P-13") to a real name if we want, but for now just use the ID
        proj_id_raw = req.get("projectId")
        if proj_id_raw:
            try:
                pid = int(proj_id_raw.replace("P-", ""))
                p_db = db.query(Project).filter(Project.project_id == pid).first()
                if p_db:
                    proj_name = p_db.project_name
            except:
                proj_name = proj_id_raw
                
        vid = str(po.get("vendorId", ""))
        purchase_orders.append({
            "purchase_order_id": po.get("poNumber", f"PO-{po_id[:6]}"),
            "project": proj_name,
            "vendor": vendor_map.get(vid, "Unknown"),
            "order_date": req.get("requiredDate", ""),
            "expected_delivery_date": po.get("expectedDeliveryDate", ""),
            "total_amount": po.get("totalAmount", 0),
            "order_status": po.get("status", "Pending"),
        })

    # Sort purchase orders by date descending
    purchase_orders = sorted(purchase_orders, key=lambda x: x["order_date"], reverse=True)[:50]

    vendor_summaries = []
    for vid, vname in vendor_map.items():
        vendor_req_count = sum(1 for req in db_requests.values() if str(req.get("vendorId")) == str(vid))
        
        # Pending invoices for this vendor
        pending = sum(1 for inv in db_invoices.values() if str(inv.get("vendorId")) == str(vid) and inv.get("paymentStatus") != "Paid")
        
        # Spend is calculated strictly from PAID INVOICES
        total_spend = sum(float(inv.get("amount", 0)) for inv in db_invoices.values() if str(inv.get("vendorId")) == str(vid) and inv.get("paymentStatus") == "Paid")
        
        vendor_summaries.append({
            "vendor_id": f"V-{vid}",
            "vendor_name": vname,
            "total_orders": vendor_req_count,
            "total_spend": float(total_spend),
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
    
    # Read from procurement store
    store_path = os.path.join(os.path.dirname(__file__), "..", "..", "procurement_store.json")
    try:
        with open(store_path, "r", encoding="utf-8") as f:
            store_data = json.load(f)
            requests_count = len(store_data.get("requests", {}))
    except Exception:
        requests_count = db.execute(text("SELECT COUNT(*) FROM procurement_requests")).scalar() or 0

    return {
        "total_projects": total_projects,
        "in_progress_projects": in_progress,
        "avg_completion_percent": avg_completion,
        "total_vendors": vendors_count,
        "total_procurement_requests": requests_count,
    }
