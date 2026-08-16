from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

# Enums
class MaterialRequestStatus(str, Enum):
    Draft = "Draft"
    Pending_PM_Approval = "Pending PM Approval"
    Revision_Required = "Revision Required"
    Rejected_by_PM = "Rejected by PM"
    PM_Approved = "PM Approved"
    Procurement_Processing = "Procurement Processing"
    Vendor_Selected = "Vendor Selected"
    PO_Pending = "PO Pending"
    PO_Generated = "PO Generated"
    PO_Sent = "PO Sent"
    Partially_Received = "Partially Received"
    Fully_Received = "Fully Received"
    Material_Received = "Material Received"
    Completed = "Completed"
    Cancelled = "Cancelled"

class PurchaseOrderStatus(str, Enum):
    Created = "Created"
    Sent = "Sent"
    Accepted = "Accepted"
    Rejected = "Rejected"
    Invoiced = "Invoiced"
    Delivered = "Delivered"

class DeliveryStatus(str, Enum):
    Received = "Received"
    Partially_Received = "Partially Received"
    Rejected = "Rejected"

class InvoiceStatus(str, Enum):
    Pending = "Pending"
    Approved = "Approved"
    Paid = "Paid"

class TimelineEvent(BaseModel):
    timestamp: str
    action: str
    user: Optional[str] = None
    notes: Optional[str] = None

# Vendor Models
class VendorBase(BaseModel):
    vendorName: str
    contactPerson: str
    phone: str
    email: EmailStr
    address: str
    materials: List[str] = []
    rating: float = 0.0
    isActive: bool = True

class VendorCreate(VendorBase):
    pass

class Vendor(VendorBase):
    id: str

# Material Request Models
class MaterialRequestBase(BaseModel):
    projectId: str
    material: str
    quantity: int
    requiredDate: str
    priority: str

class MaterialRequestCreate(MaterialRequestBase):
    pass

class MaterialRequest(MaterialRequestBase):
    id: str
    status: MaterialRequestStatus = MaterialRequestStatus.Pending_PM_Approval
    comments: Optional[str] = None
    timeline: List[TimelineEvent] = []
    vendorId: Optional[str] = None
    poId: Optional[str] = None
    receivedQuantity: int = 0

# Purchase Order Models
class PurchaseOrderBase(BaseModel):
    vendorId: str
    requestId: str
    materials: List[str]
    quantity: int
    unitPrice: float
    totalAmount: float
    expectedDeliveryDate: str

class PurchaseOrderCreate(PurchaseOrderBase):
    pass

class PurchaseOrder(PurchaseOrderBase):
    id: str
    poNumber: str
    status: PurchaseOrderStatus = PurchaseOrderStatus.Created

# Material Delivery Models
class MaterialDeliveryBase(BaseModel):
    poId: str
    material: str
    quantity: int
    acceptedQuantity: int
    rejectedQuantity: int
    deliveryDate: str
    status: DeliveryStatus

class MaterialDeliveryCreate(MaterialDeliveryBase):
    pass

class MaterialDelivery(MaterialDeliveryBase):
    id: str

# Inventory Models (Virtual collection for stock tracking)
class InventoryItem(BaseModel):
    id: str
    material: str
    stock: int

# Invoice Models
class InvoiceBase(BaseModel):
    vendorId: str
    purchaseOrderId: str
    amount: float
    gst: float
    date: str
    paymentDate: Optional[str] = None
    paymentRef: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    pass

class Invoice(InvoiceBase):
    id: str
    invoiceNo: str
    paymentStatus: InvoiceStatus = InvoiceStatus.Pending

