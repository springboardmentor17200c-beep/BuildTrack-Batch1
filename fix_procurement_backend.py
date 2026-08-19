import os

analytics_path = 'C:/Users/pradu/BuildTrack-Batch1/backend/app/routes/analytics.py'
with open(analytics_path, 'r', encoding='utf-8') as f:
    analytics_content = f.read()

import re

old_procurement_func = re.search(r"def get_procurement_analytics\(.*?\):.*?return {\s*\"purchase_orders\": purchase_orders,\s*\"vendors\": vendor_summaries,\s*}", analytics_content, re.DOTALL).group(0)

new_procurement_func = """import json
import os

def get_procurement_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    \"\"\"Procurement analytics using JSON store data to match the active procurement system.\"\"\"
    
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
    }"""

analytics_content = analytics_content.replace(old_procurement_func, new_procurement_func)

with open(analytics_path, 'w', encoding='utf-8') as f:
    f.write(analytics_content)
