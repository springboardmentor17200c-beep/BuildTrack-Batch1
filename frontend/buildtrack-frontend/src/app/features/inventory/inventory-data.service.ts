import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InventoryRecord, InventoryTransaction, Material, MaterialRequest, StockStatus, MaterialAllocation, StockAdjustment, AllocationStatus } from './models/inventory.model';

// NOTE: mock/in-memory data for now. When the FastAPI endpoints are ready,
// replace the arrays below with HttpClient calls against:
//   GET /api/inventory/materials
//   GET /api/inventory
//   GET /api/inventory/transactions
//   GET /api/inventory/material-requests
// Field names here match the `materials`, `inventory`, `inventory_transactions`,
// and `material_requests` tables in the BuildTrack database schema.

@Injectable({ providedIn: 'root' })
export class InventoryDataService {
  private materials: Material[] = [
    { materialId: 'MAT-201', materialName: 'OPC 53 Grade Cement', category: 'Cement', unitOfMeasure: 'bags' },
    { materialId: 'MAT-202', materialName: 'PPC Cement', category: 'Cement', unitOfMeasure: 'bags' },
    { materialId: 'MAT-203', materialName: 'TMT Steel Bars (12mm)', category: 'Steel', unitOfMeasure: 'tons' },
    { materialId: 'MAT-204', materialName: 'TMT Steel Bars (8mm)', category: 'Steel', unitOfMeasure: 'tons' },
    { materialId: 'MAT-205', materialName: 'Red Clay Bricks', category: 'Bricks', unitOfMeasure: 'pieces' },
    { materialId: 'MAT-206', materialName: 'Fly Ash Bricks', category: 'Bricks', unitOfMeasure: 'pieces' },
    { materialId: 'MAT-207', materialName: 'River Sand', category: 'Sand', unitOfMeasure: 'tons' },
    { materialId: 'MAT-208', materialName: 'M-Sand', category: 'Sand', unitOfMeasure: 'tons' },
    { materialId: 'MAT-209', materialName: 'Ready Mix Concrete M25', category: 'Concrete', unitOfMeasure: 'cubic meters' },
    { materialId: 'MAT-210', materialName: 'Copper Electrical Wire', category: 'Electrical Materials', unitOfMeasure: 'meters' },
    { materialId: 'MAT-211', materialName: 'MCB Distribution Boards', category: 'Electrical Materials', unitOfMeasure: 'pieces' },
    { materialId: 'MAT-212', materialName: 'PVC Pipes (4 inch)', category: 'Plumbing Materials', unitOfMeasure: 'pieces' },
    { materialId: 'MAT-213', materialName: 'CPVC Fittings Set', category: 'Plumbing Materials', unitOfMeasure: 'sets' },
  ];

  // One row per material — matches the real uq_company_material constraint (no per-site rows).
  private inventoryRecords: InventoryRecord[] = [
    { inventoryId: 'INV-1', materialId: 'MAT-201', materialName: 'OPC 53 Grade Cement', category: 'Cement', unitOfMeasure: 'bags', availableQuantity: 1200, minimumStockLevel: 500, storageLocation: 'Central Warehouse', lastUpdated: '2026-07-08' },
    { inventoryId: 'INV-2', materialId: 'MAT-202', materialName: 'PPC Cement', category: 'Cement', unitOfMeasure: 'bags', availableQuantity: 180, minimumStockLevel: 400, storageLocation: 'Central Warehouse', lastUpdated: '2026-07-06' },
    { inventoryId: 'INV-3', materialId: 'MAT-203', materialName: 'TMT Steel Bars (12mm)', category: 'Steel', unitOfMeasure: 'tons', availableQuantity: 42, minimumStockLevel: 20, storageLocation: 'Central Warehouse', lastUpdated: '2026-07-07' },
    { inventoryId: 'INV-4', materialId: 'MAT-204', materialName: 'TMT Steel Bars (8mm)', category: 'Steel', unitOfMeasure: 'tons', availableQuantity: 6, minimumStockLevel: 15, storageLocation: 'Central Warehouse', lastUpdated: '2026-07-05' },
    { inventoryId: 'INV-5', materialId: 'MAT-205', materialName: 'Red Clay Bricks', category: 'Bricks', unitOfMeasure: 'pieces', availableQuantity: 45000, minimumStockLevel: 10000, storageLocation: 'Yard B', lastUpdated: '2026-07-09' },
    { inventoryId: 'INV-6', materialId: 'MAT-206', materialName: 'Fly Ash Bricks', category: 'Bricks', unitOfMeasure: 'pieces', availableQuantity: 0, minimumStockLevel: 8000, storageLocation: 'Yard B', lastUpdated: '2026-06-29' },
    { inventoryId: 'INV-7', materialId: 'MAT-207', materialName: 'River Sand', category: 'Sand', unitOfMeasure: 'tons', availableQuantity: 85, minimumStockLevel: 30, storageLocation: 'Yard A', lastUpdated: '2026-07-08' },
    { inventoryId: 'INV-8', materialId: 'MAT-208', materialName: 'M-Sand', category: 'Sand', unitOfMeasure: 'tons', availableQuantity: 12, minimumStockLevel: 25, storageLocation: 'Yard A', lastUpdated: '2026-07-04' },
    { inventoryId: 'INV-9', materialId: 'MAT-209', materialName: 'Ready Mix Concrete M25', category: 'Concrete', unitOfMeasure: 'cubic meters', availableQuantity: 60, minimumStockLevel: 20, storageLocation: 'Central Warehouse', lastUpdated: '2026-07-09' },
    { inventoryId: 'INV-10', materialId: 'MAT-210', materialName: 'Copper Electrical Wire', category: 'Electrical Materials', unitOfMeasure: 'meters', availableQuantity: 3200, minimumStockLevel: 1000, storageLocation: 'Central Warehouse', lastUpdated: '2026-07-03' },
    { inventoryId: 'INV-11', materialId: 'MAT-211', materialName: 'MCB Distribution Boards', category: 'Electrical Materials', unitOfMeasure: 'pieces', availableQuantity: 4, minimumStockLevel: 10, storageLocation: 'Central Warehouse', lastUpdated: '2026-07-02' },
    { inventoryId: 'INV-12', materialId: 'MAT-212', materialName: 'PVC Pipes (4 inch)', category: 'Plumbing Materials', unitOfMeasure: 'pieces', availableQuantity: 0, minimumStockLevel: 200, storageLocation: 'Central Warehouse', lastUpdated: '2026-06-27' },
    { inventoryId: 'INV-13', materialId: 'MAT-213', materialName: 'CPVC Fittings Set', category: 'Plumbing Materials', unitOfMeasure: 'sets', availableQuantity: 340, minimumStockLevel: 100, storageLocation: 'Central Warehouse', lastUpdated: '2026-07-07' },
  ];

  private transactions: InventoryTransaction[] = [
    { transactionId: 'TXN-4001', inventoryId: 'INV-6', materialName: 'Fly Ash Bricks', projectId: 'Skyline Residency Tower', transactionType: 'Issued', quantity: 15000, transactionDate: '2026-07-05', createdBy: 'Priya Menon' },
    { transactionId: 'TXN-4002', inventoryId: 'INV-12', materialName: 'PVC Pipes (4 inch)', projectId: 'Riverside Business Park', transactionType: 'Issued', quantity: 500, transactionDate: '2026-07-01', createdBy: 'Karthik Iyer' },
  ];

  private materialRequests: MaterialRequest[] = [
    { requestId: 'MR-3001', project: 'Riverside Business Park', requestedBy: 'Karthik Iyer', materialId: 'MAT-202', materialName: 'PPC Cement', category: 'Cement', unitOfMeasure: 'bags', requestedQuantity: 150, requestDate: '2026-07-07', requestStatus: 'Pending' },
    { requestId: 'MR-3002', project: 'Skyline Residency Tower', requestedBy: 'Priya Menon', materialId: 'MAT-211', materialName: 'MCB Distribution Boards', category: 'Electrical Materials', unitOfMeasure: 'pieces', requestedQuantity: 6, requestDate: '2026-07-06', requestStatus: 'Pending' },
    { requestId: 'MR-3003', project: 'Riverside Business Park', requestedBy: 'Karthik Iyer', materialId: 'MAT-212', materialName: 'PVC Pipes (4 inch)', category: 'Plumbing Materials', unitOfMeasure: 'pieces', requestedQuantity: 500, requestDate: '2026-07-01', requestStatus: 'Approved' },
    { requestId: 'MR-3004', project: 'Skyline Residency Tower', requestedBy: 'Priya Menon', materialId: 'MAT-208', materialName: 'M-Sand', category: 'Sand', unitOfMeasure: 'tons', requestedQuantity: 40, requestDate: '2026-06-28', requestStatus: 'Rejected', remarks: 'Insufficient stock and no pending purchase order' },
  ];

  // ====== NEW: Material Allocations ======
  private allocations: MaterialAllocation[] = [
    {
      allocationId: 'ALL-001',
      materialId: 'MAT-201',
      materialName: 'OPC 53 Grade Cement',
      projectId: 'Skyline Residency Tower',
      projectName: 'Skyline Residency Tower',
      allocatedQuantity: 200,
      issuedQuantity: 150,
      returnedQuantity: 0,
      allocatedDate: '2026-07-08',
      issuedDate: '2026-07-09',
      status: 'Issued',
      allocatedBy: 'Manager A',
      issuedTo: 'Site Supervisor',
      remarks: 'Foundation work'
    },
    {
      allocationId: 'ALL-002',
      materialId: 'MAT-203',
      materialName: 'TMT Steel Bars (12mm)',
      projectId: 'Riverside Business Park',
      projectName: 'Riverside Business Park',
      allocatedQuantity: 10,
      issuedQuantity: 0,
      returnedQuantity: 0,
      allocatedDate: '2026-07-10',
      status: 'Reserved',
      allocatedBy: 'Manager B',
      issuedTo: 'Project Manager',
      remarks: 'Pending delivery'
    }
  ];

  private materials$$ = new BehaviorSubject<Material[]>(this.materials);
  private inventory$$ = new BehaviorSubject<InventoryRecord[]>(this.inventoryRecords);
  private transactions$$ = new BehaviorSubject<InventoryTransaction[]>(this.transactions);
  private requests$$ = new BehaviorSubject<MaterialRequest[]>(this.materialRequests);
  private allocations$$ = new BehaviorSubject<MaterialAllocation[]>(this.allocations);

  materials$ = this.materials$$.asObservable();
  inventory$ = this.inventory$$.asObservable();
  transactions$ = this.transactions$$.asObservable();
  requests$ = this.requests$$.asObservable();
  allocations$ = this.allocations$$.asObservable();

  get projectNames(): string[] {
    return ['Skyline Residency Tower', 'Riverside Business Park'];
  }

  /** Derived, not stored — same logic the backend would apply to available_quantity vs minimum_stock_level. */
  getStockStatus(record: InventoryRecord): StockStatus {
    if (record.availableQuantity <= 0) return 'Out of Stock';
    if (record.availableQuantity <= record.minimumStockLevel) return 'Low Stock';
    return 'In Stock';
  }

  addMaterialRequest(request: MaterialRequest) {
    this.materialRequests = [request, ...this.materialRequests];
    this.requests$$.next(this.materialRequests);
  }

  /**
   * Approving a material request ISSUES stock to the requesting project —
   * this reduces available_quantity and writes an inventory_transaction,
   * matching the real workflow (material_requests -> inventory_transactions).
   */
  approveRequest(requestId: string) {
    const request = this.materialRequests.find(r => r.requestId === requestId);
    if (!request) return;

    const record = this.inventoryRecords.find(inv => inv.materialId === request.materialId);
    if (!record || record.availableQuantity < request.requestedQuantity) {
      // Not enough stock to fulfill — in a real system this would likely
      // trigger a procurement_request instead. For now, block the approval.
      return;
    }

    this.inventoryRecords = this.inventoryRecords.map(inv =>
      inv.inventoryId === record.inventoryId
        ? { ...inv, availableQuantity: inv.availableQuantity - request.requestedQuantity, lastUpdated: '2026-07-10' }
        : inv
    );
    this.inventory$$.next(this.inventoryRecords);

    this.transactions = [
      {
        transactionId: 'TXN-' + Math.floor(4000 + Math.random() * 9000),
        inventoryId: record.inventoryId,
        materialName: record.materialName,
        projectId: request.project,
        transactionType: 'Issued',
        quantity: request.requestedQuantity,
        transactionDate: '2026-07-10',
        createdBy: request.requestedBy,
      },
      ...this.transactions,
    ];
    this.transactions$$.next(this.transactions);

    this.materialRequests = this.materialRequests.map(r =>
      r.requestId === requestId ? { ...r, requestStatus: 'Approved' as const } : r
    );
    this.requests$$.next(this.materialRequests);
  }

  rejectRequest(requestId: string, remarks?: string) {
    this.materialRequests = this.materialRequests.map(r =>
      r.requestId === requestId ? { ...r, requestStatus: 'Rejected' as const, remarks: remarks || r.remarks } : r
    );
    this.requests$$.next(this.materialRequests);
  }

  hasSufficientStock(materialId: string, quantity: number): boolean {
    const record = this.inventoryRecords.find(inv => inv.materialId === materialId);
    return !!record && record.availableQuantity >= quantity;
  }

  // ====== ALLOCATION METHODS ======
  createAllocation(allocation: Omit<MaterialAllocation, 'allocationId' | 'allocatedDate' | 'status'>): void {
    const newAllocation: MaterialAllocation = {
      ...allocation,
      allocationId: `ALL-${String(this.allocations.length + 1).padStart(3, '0')}`,
      allocatedDate: new Date().toISOString().split('T')[0],
      status: 'Reserved'
    };
    
    this.allocations = [newAllocation, ...this.allocations];
    this.allocations$$.next(this.allocations);
    
    // Reduce stock
    this.reduceStock(allocation.materialId, allocation.allocatedQuantity);
  }

  issueAllocation(allocationId: string): void {
    const allocation = this.allocations.find(a => a.allocationId === allocationId);
    if (!allocation || allocation.status !== 'Reserved') return;
    
    this.allocations = this.allocations.map(a =>
      a.allocationId === allocationId
        ? { ...a, status: 'Issued', issuedDate: new Date().toISOString().split('T')[0], issuedQuantity: a.allocatedQuantity }
        : a
    );
    this.allocations$$.next(this.allocations);
  }

  returnAllocation(allocationId: string, returnedQuantity: number): void {
    const allocation = this.allocations.find(a => a.allocationId === allocationId);
    if (!allocation || allocation.status === 'Returned') return;
    
    const currentReturned = allocation.returnedQuantity || 0;
    const newReturned = currentReturned + returnedQuantity;
    
    let newStatus: AllocationStatus = 'Returned';
    if (newReturned < allocation.allocatedQuantity) {
      newStatus = 'PartiallyReturned';
    }
    
    this.allocations = this.allocations.map(a =>
      a.allocationId === allocationId
        ? { ...a, returnedQuantity: newReturned, status: newStatus }
        : a
    );
    this.allocations$$.next(this.allocations);
    
    // Add back to stock
    this.addToStock(allocation.materialId, returnedQuantity);
  }

  getAvailableForAllocation(materialId: string): number {
    const record = this.inventoryRecords.find(inv => inv.materialId === materialId);
    if (!record) return 0;
    
    const reserved = this.allocations
      .filter(a => a.materialId === materialId && a.status === 'Reserved')
      .reduce((sum, a) => sum + a.allocatedQuantity, 0);
    
    return record.availableQuantity - reserved;
  }

  // ====== STOCK MANAGEMENT METHODS ======
  addMaterial(material: Omit<Material, 'materialId'>): void {
    const newMaterial: Material = {
      ...material,
      materialId: `MAT-${Math.floor(200 + Math.random() * 900)}`
    };
    this.materials = [newMaterial, ...this.materials];
    this.materials$$.next(this.materials);
  }

  updateMaterial(materialId: string, updates: Partial<Material>): void {
    this.materials = this.materials.map(m =>
      m.materialId === materialId ? { ...m, ...updates } : m
    );
    this.materials$$.next(this.materials);
  }

  deleteMaterial(materialId: string): void {
    this.materials = this.materials.filter(m => m.materialId !== materialId);
    this.materials$$.next(this.materials);
  }

  addInventoryRecord(record: Omit<InventoryRecord, 'inventoryId' | 'lastUpdated'>): void {
    const newRecord: InventoryRecord = {
      ...record,
      inventoryId: `INV-${String(this.inventoryRecords.length + 1).padStart(3, '0')}`,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    this.inventoryRecords = [newRecord, ...this.inventoryRecords];
    this.inventory$$.next(this.inventoryRecords);
  }

  updateInventoryRecord(inventoryId: string, updates: Partial<InventoryRecord>): void {
    this.inventoryRecords = this.inventoryRecords.map(inv =>
      inv.inventoryId === inventoryId ? { ...inv, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : inv
    );
    this.inventory$$.next(this.inventoryRecords);
  }

  // ====== HELPER METHODS ======
  private reduceStock(materialId: string, quantity: number): void {
    const record = this.inventoryRecords.find(inv => inv.materialId === materialId);
    if (record) {
      this.inventoryRecords = this.inventoryRecords.map(inv =>
        inv.inventoryId === record.inventoryId
          ? { ...inv, availableQuantity: inv.availableQuantity - quantity, lastUpdated: new Date().toISOString().split('T')[0] }
          : inv
      );
      this.inventory$$.next(this.inventoryRecords);
    }
  }

  private addToStock(materialId: string, quantity: number): void {
    const record = this.inventoryRecords.find(inv => inv.materialId === materialId);
    if (record) {
      this.inventoryRecords = this.inventoryRecords.map(inv =>
        inv.inventoryId === record.inventoryId
          ? { ...inv, availableQuantity: inv.availableQuantity + quantity, lastUpdated: new Date().toISOString().split('T')[0] }
          : inv
      );
      this.inventory$$.next(this.inventoryRecords);
    }
  }
}