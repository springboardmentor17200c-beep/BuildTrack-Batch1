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
        completion_pct = sum((m.progress_percentage or 0) for m in milestones if m.status == "Completed")
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


@router.get("/budget")
def get_budget_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    """
    Budget analytics per project:
    - allocated_budget from projects table
    - labour_cost: sum of (pay_rate * shift_hours) for all employees assigned to the project via shifts
    - material_cost: cost of materials used, computed from procurement unit prices (avg per material)
    """
    store_path = os.path.join(os.path.dirname(__file__), "..", "..", "procurement_store.json")
    try:
        with open(store_path, "r", encoding="utf-8") as f:
            store_data = json.load(f)
    except Exception:
        store_data = {"requests": {}, "purchase_orders": {}}

    db_requests = store_data.get("requests", {})
    db_pos = store_data.get("purchase_orders", {})

    # ── Build avg unit price per material name from all procurement POs ──
    material_unit_prices: dict = {}  # material_name -> list of unit prices
    for po in db_pos.values():
        unit_price = po.get("unitPrice", 0)
        materials = po.get("materials", [])
        for mat in materials:
            mat_lower = mat.lower().strip()
            if mat_lower not in material_unit_prices:
                material_unit_prices[mat_lower] = []
            if unit_price and unit_price > 0:
                material_unit_prices[mat_lower].append(float(unit_price))

    # avg unit price per material
    avg_unit_price: dict = {}
    for mat, prices in material_unit_prices.items():
        avg_unit_price[mat] = sum(prices) / len(prices) if prices else 0

    query = db.query(Project)
    if current_user.role and current_user.role.role_name == "Project Manager":
        query = query.filter(Project.manager_id == current_user.user_id)
    projects = query.all()

    result = []
    for p in projects:
        pid = p.project_id

        # ── Labour cost: shifts joined with employee pay_rate ──
        # Each shift is 1 working day; calculate hours from shift_type or default 8h
        labour_rows = db.execute(text("""
            SELECT ep.pay_rate, ep.payment_type, s.shift_type
            FROM shifts s
            JOIN employee_profiles ep ON s.employee_id = ep.employee_id
            WHERE s.project_id = :pid
        """), {"pid": pid}).fetchall()

        labour_cost = 0.0
        for row in labour_rows:
            pay_rate = float(row[0] or 0)
            payment_type = row[1] or "Daily"
            if payment_type == "Monthly":
                # Treat each shift as 1/26 of monthly salary (26 working days)
                labour_cost += pay_rate / 26
            elif payment_type == "Hourly":
                # Default 8-hour shift
                labour_cost += pay_rate * 8
            else:
                # Daily rate
                labour_cost += pay_rate

        # ── Material cost: from procurement requests linked to this project ──
        project_id_str = f"P-{pid}"
        material_cost = 0.0
        for req in db_requests.values():
            if req.get("projectId") == project_id_str:
                mat_name = (req.get("material") or "").lower().strip()
                qty = float(req.get("receivedQuantity") or req.get("quantity") or 0)
                unit_price = avg_unit_price.get(mat_name, 0)
                material_cost += qty * unit_price

        allocated = float(p.allocated_budget or 0)
        total_spent = labour_cost + material_cost

        result.append({
            "project_id": pid,
            "project_name": p.project_name,
            "allocated_budget": allocated,
            "labour_cost": round(labour_cost, 2),
            "material_cost": round(material_cost, 2),
            "total_spent": round(total_spent, 2),
            "remaining": round(allocated - total_spent, 2),
            "status": p.status.status_name if p.status else "Planning",
        })

    return result


@router.get("/procurement")
def get_procurement_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    """Procurement analytics using JSON store data to match the active procurement system."""
    store_path = os.path.join(os.path.dirname(__file__), "..", "..", "procurement_store.json")
    try:
        with open(store_path, "r", encoding="utf-8") as f:
            store_data = json.load(f)
    except Exception:
        store_data = {"vendors": {}, "requests": {}, "purchase_orders": {}, "invoices": {}}

    db_requests = store_data.get("requests", {})
    db_pos = store_data.get("purchase_orders", {})
    db_invoices = store_data.get("invoices", {})

    postgres_vendors = db.query(Vendor).all()
    vendor_map = {str(v.vendor_id): v.vendor_name for v in postgres_vendors}
    for vid, v in store_data.get("vendors", {}).items():
        if str(vid) not in vendor_map:
            vendor_map[str(vid)] = v.get("name", "Unknown")

    purchase_orders = []
    for po_id, po in db_pos.items():
        req = db_requests.get(po.get("requestId"), {})
        proj_name = "Unknown"
        proj_id_raw = req.get("projectId")
        if proj_id_raw:
            try:
                pid = int(proj_id_raw.replace("P-", ""))
                p_db = db.query(Project).filter(Project.project_id == pid).first()
                if p_db:
                    proj_name = p_db.project_name
            except Exception:
                proj_name = proj_id_raw

        vid = str(po.get("vendorId", ""))
        purchase_orders.append({
            "purchase_order_id": po.get("poNumber", f"PO-{po_id[:6]}"),
            "project": proj_name,
            "vendor": vendor_map.get(vid, "Unknown"),
            "order_date": req.get("requiredDate", ""),
            "expected_delivery_date": po.get("expectedDeliveryDate", ""),
            "total_amount": po.get("totalAmount", 0),
            "order_status": "Delivered" if po.get("status") == "Delivered" else (
                "Confirmed" if po.get("status") == "Accepted" else (
                    "Cancelled" if po.get("status") == "Rejected" else "Pending"
                )
            ),
        })

    purchase_orders = sorted(purchase_orders, key=lambda x: x["order_date"], reverse=True)[:50]

    vendor_summaries = []
    for vid, vname in vendor_map.items():
        vendor_req_count = sum(1 for req in db_requests.values() if str(req.get("vendorId")) == str(vid))
        pending = sum(1 for inv in db_invoices.values() if str(inv.get("vendorId")) == str(vid) and inv.get("paymentStatus") != "Paid")
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
