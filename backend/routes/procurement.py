from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import List, Dict
import uuid
from datetime import datetime

from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.core.notification_helper import create_notification_for_role, create_notification
from app.models.user import User

from models_procurement import (
    Vendor, VendorCreate,
    MaterialRequest, MaterialRequestCreate, MaterialRequestStatus,
    PurchaseOrder, PurchaseOrderCreate, PurchaseOrderStatus,
    MaterialDelivery, MaterialDeliveryCreate, DeliveryStatus,
    InventoryItem,
    Invoice, InvoiceCreate, InvoiceStatus
)

router = APIRouter(prefix="/procurement", tags=["Procurement"])

# ─── Persistent JSON-backed storage ───────────────────────────────────────────
# Data is persisted to a JSON file so it survives server restarts.
import os, json as _json

_STORE_PATH = os.path.join(os.path.dirname(__file__), "..", "procurement_store.json")

def _load_store() -> dict:
    if os.path.exists(_STORE_PATH):
        try:
            with open(_STORE_PATH, "r", encoding="utf-8") as f:
                return _json.load(f)
        except Exception:
            pass
    return {"vendors": {}, "requests": {}, "purchase_orders": {}, "deliveries": {}, "inventory": {}, "invoices": {}}

def _save_store():
    try:
        data = {
            "vendors": db_vendors, "requests": db_requests,
            "purchase_orders": db_purchase_orders, "deliveries": db_deliveries,
            "inventory": db_inventory, "invoices": db_invoices,
        }
        with open(_STORE_PATH, "w", encoding="utf-8") as f:
            _json.dump(data, f, indent=2, default=str)
    except Exception as e:
        print(f"[procurement] Failed to save store: {e}")

_store = _load_store()

# In-memory stores (initialized from persisted JSON)
db_vendors: Dict[str, dict] = _store.get("vendors", {})
db_requests: Dict[str, dict] = _store.get("requests", {})
db_purchase_orders: Dict[str, dict] = _store.get("purchase_orders", {})
db_deliveries: Dict[str, dict] = _store.get("deliveries", {})
db_inventory: Dict[str, dict] = _store.get("inventory", {})
db_invoices: Dict[str, dict] = _store.get("invoices", {})

# Ensure file exists immediately on startup
if not os.path.exists(_STORE_PATH):
    _save_store()

def generate_id() -> str:
    return str(uuid.uuid4())

def add_timeline_event(req: dict, action: str, notes: str = None):
    req.setdefault("timeline", []).append({
        "timestamp": datetime.utcnow().isoformat(),
        "action": action,
        "user": None,
        "notes": notes
    })

# --- Vendors ---
@router.post("/vendors", response_model=Vendor)
def create_vendor(vendor: VendorCreate, current_user: User = Depends(get_current_user)):
    v_id = generate_id()
    new_vendor = vendor.model_dump()
    new_vendor["id"] = v_id
    db_vendors[v_id] = new_vendor
    _save_store()
    return new_vendor

@router.get("/vendors", response_model=List[Vendor])
def get_vendors(current_user: User = Depends(get_current_user)):
    return list(db_vendors.values())

@router.get("/vendors/{vendor_id}", response_model=Vendor)
def get_vendor(vendor_id: str, current_user: User = Depends(get_current_user)):
    if vendor_id not in db_vendors:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return db_vendors[vendor_id]

@router.put("/vendors/{vendor_id}", response_model=Vendor)
def update_vendor(vendor_id: str, vendor: VendorCreate, current_user: User = Depends(get_current_user)):
    if vendor_id not in db_vendors:
        raise HTTPException(status_code=404, detail="Vendor not found")
    updated = vendor.model_dump()
    updated["id"] = vendor_id
    db_vendors[vendor_id] = updated
    _save_store()
    return updated

@router.delete("/vendors/{vendor_id}")
def delete_vendor(vendor_id: str, current_user: User = Depends(get_current_user)):
    if vendor_id in db_vendors:
        del db_vendors[vendor_id]
    _save_store()
    return {"message": "Vendor deleted"}

# --- Material Requests ---
@router.post("/requests", response_model=MaterialRequest)
def create_request(
    req: MaterialRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    r_id = generate_id()
    new_req = req.model_dump()
    new_req["id"] = r_id
    new_req["status"] = MaterialRequestStatus.Pending_PM_Approval
    new_req["timeline"] = []
    new_req["receivedQuantity"] = 0
    add_timeline_event(new_req, "Site Engineer created request")
    db_requests[r_id] = new_req
    _save_store()
    
    create_notification_for_role(
        db, current_user.company_id, "Project Manager", 
        "New PR Pending", f"New procurement request created for {req.material}."
    )
    return new_req

@router.get("/requests", response_model=List[MaterialRequest])
def get_requests(current_user: User = Depends(get_current_user)):
    return list(db_requests.values())

@router.delete("/requests/{request_id}", status_code=204)
def delete_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a procurement request (only pending ones; SE or Admin only)."""
    if request_id not in db_requests:
        raise HTTPException(status_code=404, detail="Request not found")
    
    req = db_requests[request_id]
    role = current_user.role.role_name if current_user.role else ""

    deletable_statuses = [
        MaterialRequestStatus.Pending_PM_Approval.value,
        MaterialRequestStatus.Revision_Required.value,
        MaterialRequestStatus.Rejected_by_PM.value,
    ]
    if req["status"] not in deletable_statuses:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete a request that is already approved or in progress."
        )

    if role not in ("Site Engineer", "Administrator"):
        raise HTTPException(status_code=403, detail="You do not have permission to delete requests.")

    del db_requests[request_id]
    _save_store()
    return

@router.put("/requests/{request_id}/approve", response_model=MaterialRequest)
def approve_request(
    request_id: str, 
    comments: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if request_id not in db_requests:
        raise HTTPException(status_code=404, detail="Request not found")
    db_requests[request_id]["status"] = MaterialRequestStatus.PM_Approved
    if comments:
        db_requests[request_id]["comments"] = comments
    add_timeline_event(db_requests[request_id], "PM approved request", comments)
    _save_store()
    
    create_notification_for_role(
        db, current_user.company_id, "Administrator",
        "PR Approved", f"PR {request_id[:8]} approved. Vendor assignment required."
    )
    return db_requests[request_id]

@router.put("/requests/{request_id}/reject", response_model=MaterialRequest)
def reject_request(request_id: str, comments: str = None, current_user: User = Depends(get_current_user)):
    if request_id not in db_requests:
        raise HTTPException(status_code=404, detail="Request not found")
    db_requests[request_id]["status"] = MaterialRequestStatus.Rejected_by_PM
    if comments:
        db_requests[request_id]["comments"] = comments
    add_timeline_event(db_requests[request_id], "PM rejected request", comments)
    _save_store()
    return db_requests[request_id]

@router.put("/requests/{request_id}/select-vendor", response_model=MaterialRequest)
def select_vendor_for_request(request_id: str, vendor_id: str, current_user: User = Depends(get_current_user)):
    if request_id not in db_requests:
        raise HTTPException(status_code=404, detail="Request not found")
    req = db_requests[request_id]
    req["vendorId"] = vendor_id
    req["status"] = MaterialRequestStatus.Vendor_Selected
    add_timeline_event(req, f"Procurement selected vendor (ID: {vendor_id})")
    _save_store()
    return req

# --- Purchase Orders ---
@router.post("/purchase-orders", response_model=PurchaseOrder)
def create_purchase_order(po: PurchaseOrderCreate, current_user: User = Depends(get_current_user)):
    po_id = generate_id()
    new_po = po.model_dump()
    new_po["id"] = po_id
    new_po["poNumber"] = f"PO-{len(db_purchase_orders) + 1000}"
    new_po["status"] = PurchaseOrderStatus.Created
    db_purchase_orders[po_id] = new_po

    req = db_requests.get(po.requestId)
    if req:
        req["poId"] = po_id
        req["status"] = MaterialRequestStatus.PO_Generated
        add_timeline_event(req, f"Admin generated Purchase Order ({new_po['poNumber']})")
    _save_store()
    return new_po

@router.get("/purchase-orders", response_model=List[PurchaseOrder])
def get_purchase_orders(current_user: User = Depends(get_current_user)):
    return list(db_purchase_orders.values())

@router.put("/purchase-orders/{po_id}", response_model=PurchaseOrder)
def update_purchase_order(
    po_id: str,
    po_update: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if po_id not in db_purchase_orders:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    po = db_purchase_orders[po_id]
    po.update(po_update)

    if po.get("status") == PurchaseOrderStatus.Sent:
        req = db_requests.get(po["requestId"])
        if req and req["status"] != MaterialRequestStatus.PO_Sent:
            req["status"] = MaterialRequestStatus.PO_Sent
            add_timeline_event(req, "Admin sent Purchase Order to vendor")
        create_notification_for_role(
            db, current_user.company_id, "Vendor",
            "New Purchase Order", f"Purchase Order {po.get('poNumber')} received for approval."
        )
    _save_store()
    return po

# --- Material Deliveries & Inventory ---
@router.post("/deliveries", response_model=MaterialDelivery)
def create_delivery(
    delivery: MaterialDeliveryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    d_id = generate_id()
    new_del = delivery.model_dump()
    new_del["id"] = d_id
    db_deliveries[d_id] = new_del

    if delivery.status in [DeliveryStatus.Received, DeliveryStatus.Partially_Received]:
        mat = delivery.material
        accepted = delivery.acceptedQuantity
        if accepted > 0:
            if mat in db_inventory:
                db_inventory[mat]["stock"] += accepted
            else:
                db_inventory[mat] = {"id": generate_id(), "material": mat, "stock": accepted}
            
            # Update PostgreSQL database to sync with Inventory Dashboard
            try:
                from app.models.inventory import Material, Inventory
                from sqlalchemy import func
                material_db = db.query(Material).filter(func.lower(Material.material_name) == mat.lower()).first()
                if material_db:
                    inv_db = db.query(Inventory).filter(Inventory.material_id == material_db.material_id).first()
                    if inv_db:
                        inv_db.available_quantity = float(inv_db.available_quantity) + float(accepted)
                        db.commit()
            except Exception as e:
                print("Failed to sync inventory to DB:", e)

    po = db_purchase_orders.get(delivery.poId)
    if po:
        req = db_requests.get(po["requestId"])
        if req:
            req["receivedQuantity"] += delivery.acceptedQuantity
            if req["receivedQuantity"] >= req["quantity"]:
                req["status"] = MaterialRequestStatus.Material_Received
                add_timeline_event(req, f"Material fully received ({req['receivedQuantity']}/{req['quantity']})")
                po["status"] = PurchaseOrderStatus.Delivered
            else:
                req["status"] = MaterialRequestStatus.Partially_Received
                add_timeline_event(req, f"Material partially received ({req['receivedQuantity']}/{req['quantity']})")

    create_notification_for_role(db, current_user.company_id, "Site Engineer", "Material Delivered", "Materials delivered for PO.")
    create_notification_for_role(db, current_user.company_id, "Project Manager", "Material Delivered", "Materials delivered for PO.")
    create_notification_for_role(db, current_user.company_id, "Administrator", "Material Delivered", "Materials delivered for PO.")
    _save_store()
    return new_del

@router.get("/deliveries", response_model=List[MaterialDelivery])
def get_deliveries(current_user: User = Depends(get_current_user)):
    return list(db_deliveries.values())

@router.get("/inventory", response_model=List[InventoryItem])
def get_inventory(current_user: User = Depends(get_current_user)):
    return list(db_inventory.values())

# --- Invoices ---
@router.post("/invoices", response_model=Invoice)
def create_invoice(
    invoice: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    i_id = generate_id()
    new_inv = invoice.model_dump()
    new_inv["id"] = i_id
    new_inv["invoiceNo"] = f"INV-{len(db_invoices) + 1000}"
    new_inv["paymentStatus"] = InvoiceStatus.Pending
    db_invoices[i_id] = new_inv

    po = db_purchase_orders.get(invoice.purchaseOrderId)
    if po:
        po["unitPrice"] = invoice.unitPrice
        po["totalAmount"] = invoice.amount

    create_notification_for_role(
        db, current_user.company_id, "Administrator",
        "Invoice Received", f"Invoice {new_inv['invoiceNo']} received, pending payment."
    )
    _save_store()
    return new_inv

@router.get("/invoices", response_model=List[Invoice])
def get_invoices(current_user: User = Depends(get_current_user)):
    return list(db_invoices.values())

@router.put("/invoices/{invoice_id}/payment", response_model=Invoice)
def pay_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if invoice_id not in db_invoices:
        raise HTTPException(status_code=404, detail="Invoice not found")
    db_invoices[invoice_id]["paymentStatus"] = InvoiceStatus.Paid
    db_invoices[invoice_id]["paymentDate"] = datetime.utcnow().isoformat()
    db_invoices[invoice_id]["paymentRef"] = f"TRX-{str(uuid.uuid4())[:8].upper()}"
    create_notification_for_role(
        db, current_user.company_id, "Vendor",
        "Payment Processed", f"Payment completed for invoice {db_invoices[invoice_id]['invoiceNo']}."
    )
    _save_store()
    return db_invoices[invoice_id]
