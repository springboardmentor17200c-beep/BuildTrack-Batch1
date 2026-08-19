import os

analytics_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/analytics.py'
with open(analytics_path, 'r', encoding='utf-8') as f:
    analytics_content = f.read()

old_procurement = """def get_procurement_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    \"\"\"Procurement analytics using raw SQL to match actual DB schema.\"\"\"
    # Use raw SQL since the ORM model is out of sync with the real table
    po_rows = db.execute(text(\"\"\"
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
    \"\"\")).fetchall()

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
    }"""

new_procurement = """def get_procurement_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    \"\"\"Procurement analytics using raw SQL to match actual DB schema.\"\"\"
    # Use raw SQL since the ORM model is out of sync with the real table
    po_rows = db.execute(text(\"\"\"
        SELECT pr.procurement_request_id, pr.project_id, pr.vendor_id,
               pr.request_status, pr.request_date, pr.required_date,
               pr.po_id, pr.priority,
               p.project_name,
               v.vendor_name,
               po.total_amount
        FROM procurement_requests pr
        LEFT JOIN projects p ON pr.project_id = p.project_id
        LEFT JOIN vendors v ON pr.vendor_id = v.vendor_id
        LEFT JOIN purchase_orders po ON pr.po_id = po.po_id
        ORDER BY pr.request_date DESC
        LIMIT 50
    \"\"\")).fetchall()

    purchase_orders = []
    for row in po_rows:
        total = row[10] if len(row) > 10 and row[10] is not None else 0
        purchase_orders.append({
            "purchase_order_id": f"PO-{row[0]}",
            "project": row[8] or "Unknown",
            "vendor": row[9] or "Unknown",
            "order_date": str(row[4].date()) if row[4] else "",
            "expected_delivery_date": row[5] or "",
            "total_amount": float(total),
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
        total_spend = db.execute(text(
            "SELECT SUM(total_amount) FROM purchase_orders WHERE vendor_id = :vid AND status != 'Cancelled'"
        ), {"vid": v.vendor_id}).scalar() or 0
        vendor_summaries.append({
            "vendor_id": f"V-{v.vendor_id}",
            "vendor_name": v.vendor_name,
            "total_orders": vendor_req_count,
            "total_spend": float(total_spend),
            "pending_invoices": pending,
        })

    return {
        "purchase_orders": purchase_orders,
        "vendors": vendor_summaries,
    }"""

analytics_content = analytics_content.replace(old_procurement, new_procurement)

with open(analytics_path, 'w', encoding='utf-8') as f:
    f.write(analytics_content)
