// Shared types used across the Inventory module

export type MaterialCategory =
  | 'Cement'
  | 'Steel'
  | 'Bricks'
  | 'Sand'
  | 'Concrete'
  | 'Electrical Materials'
  | 'Plumbing Materials';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface MaterialItem {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: string; // e.g. 'tons', 'bags', 'pieces', 'meters'
  currentStock: number;
  reorderLevel: number;
  site: string;
  status: StockStatus;
  lastUpdated: string; // ISO date
}

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Delivered';

export interface ProcurementRequest {
  id: string;
  materialId: string;
  materialName: string;
  category: MaterialCategory;
  quantity: number;
  unit: string;
  project: string;
  requestedBy: string;
  requestDate: string;
  status: RequestStatus;
}
