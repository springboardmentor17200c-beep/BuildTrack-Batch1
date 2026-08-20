// Shared types used across the Inventory module.
// Field names mirror the BuildTrack database schema:
//   materials, inventory, inventory_transactions, material_requests
//
// NOTE: what this module calls "Material Requests" maps to the DB's
// `material_requests` table (a project asking to draw material from
// existing stock). This is a DIFFERENT concept from the `procurement_requests`
// / `purchase_orders` / `invoices` tables, which handle buying new stock
// from vendors — that's a separate Procurement module not yet built.

export type MaterialCategory =
  | 'Cement'
  | 'Steel'
  | 'Bricks'
  | 'Sand'
  | 'Concrete'
  | 'Electrical Materials'
  | 'Plumbing Materials';

// Derived, not stored — computed from availableQuantity vs minimumStockLevel,
// same way the backend would (there's no status column on `inventory`).
export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface Material {
  materialId: string;
  materialName: string;
  category: MaterialCategory;
  unitOfMeasure: string;
  description?: string;
  isActive?: boolean;
}

// Maps to the `inventory` table (how much is currently in stock).
// One row per material per company — no per-site breakdown in this schema.
export interface InventoryRecord {
  inventoryId: string;
  materialId: string;
  materialName: string;
  category: MaterialCategory;
  unitOfMeasure: string;
  availableQuantity: number;
  minimumStockLevel: number;
  storageLocation: string;
  lastUpdated: string; // ISO date
}

// Maps to the `inventory_transactions` table (the movement ledger).
export type TransactionType = 'Received' | 'Issued' | 'Adjustment';

export interface InventoryTransaction {
  transactionId: string;
  inventoryId: string;
  materialName: string;
  projectId: string | null; // null for transactions not tied to a project (e.g. a bulk receipt)
  transactionType: TransactionType;
  quantity: number;
  transactionDate: string;
  remarks?: string;
  createdBy: string;
}

// Maps to the `material_requests` table.
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface MaterialRequest {
  requestId: string;
  project: string;
  requestedBy: string;
  materialId: string;
  materialName: string;
  category: MaterialCategory;
  unitOfMeasure: string;
  requestedQuantity: number;
  requestDate: string;
  requestStatus: RequestStatus;
  remarks?: string;
}

// ====== NEW: Material Allocation ======
export type AllocationStatus = 'Reserved' | 'Issued' | 'Returned' | 'PartiallyReturned';

export interface MaterialAllocation {
  allocationId: string;
  materialId: string;
  materialName: string;
  projectId: string;
  projectName: string;
  allocatedQuantity: number;
  issuedQuantity?: number;
  returnedQuantity?: number;
  allocatedDate: string;
  issuedDate?: string;
  status: AllocationStatus;
  allocatedBy: string;
  issuedTo: string;
  remarks?: string;
}

// ====== NEW: Stock Adjustment ======
export type AdjustmentType = 'Addition' | 'Reduction' | 'Transfer' | 'Return';

export interface StockAdjustment {
  adjustmentId: string;
  inventoryId: string;
  materialName: string;
  adjustmentType: AdjustmentType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  referenceNumber?: string;
  fromSiteId?: string;
  toSiteId?: string;
  adjustedBy: string;
  adjustmentDate: string;
  approvedBy?: string;
}