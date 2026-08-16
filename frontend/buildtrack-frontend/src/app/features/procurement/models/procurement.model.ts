// Shared types for the Procurement module based on the new FastAPI Schema

export type MaterialRequestStatus = 
  'Draft' | 'Pending PM Approval' | 'Revision Required' | 'Rejected by PM' | 
  'PM Approved' | 'Procurement Processing' | 'Vendor Selected' | 'PO Pending' | 
  'PO Generated' | 'PO Sent' | 'Partially Received' | 'Fully Received' | 'Material Received' | 
  'Completed' | 'Cancelled' | 'Pending' | 'Approved' | 'Rejected';

export type PurchaseOrderStatus = 'Created' | 'Sent' | 'Accepted' | 'Rejected' | 'Invoiced' | 'Delivered';
export type DeliveryStatus = 'Received' | 'Partially Received' | 'Rejected';
export type InvoiceStatus = 'Pending' | 'Approved' | 'Paid';

export interface TimelineEvent {
  timestamp: string;
  action: string;
  user?: string;
  notes?: string;
}

// ---------------- Vendors ----------------
export interface Vendor {
  id: string;
  vendorName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  materials: string[];
  rating: number;
  isActive: boolean;
}

export interface VendorCreatePayload {
  vendorName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  materials?: string[];
  rating?: number;
  isActive?: boolean;
}

// ---------------- Material Requests ----------------
export interface MaterialRequest {
  id: string;
  projectId: string;
  material: string;
  quantity: number;
  requiredDate: string;
  priority: string;
  status: MaterialRequestStatus;
  comments?: string;
  timeline: TimelineEvent[];
  vendorId?: string;
  poId?: string;
  receivedQuantity: number;
}

export interface MaterialRequestCreatePayload {
  projectId: string;
  material: string;
  quantity: number;
  requiredDate: string;
  priority: string;
}

// ---------------- Purchase Orders ----------------
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  requestId: string;
  materials: string[];
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  expectedDeliveryDate: string;
  status: PurchaseOrderStatus;
}

export interface PurchaseOrderCreatePayload {
  vendorId: string;
  requestId: string;
  materials: string[];
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  expectedDeliveryDate: string;
}

// ---------------- Material Deliveries & Inventory ----------------
export interface MaterialDelivery {
  id: string;
  poId: string;
  material: string;
  quantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  deliveryDate: string;
  status: DeliveryStatus;
}

export interface MaterialDeliveryCreatePayload {
  poId: string;
  material: string;
  quantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  deliveryDate: string;
  status: DeliveryStatus;
}

export interface InventoryItem {
  id: string;
  material: string;
  stock: number;
}

// ---------------- Invoices ----------------
export interface Invoice {
  id: string;
  invoiceNo: string;
  vendorId: string;
  purchaseOrderId: string;
  amount: number;
  gst: number;
  date: string;
  paymentStatus: InvoiceStatus;
  paymentDate?: string;
  paymentRef?: string;
}

export interface InvoiceCreatePayload {
  vendorId: string;
  purchaseOrderId: string;
  amount: number;
  gst: number;
  date: string;
}