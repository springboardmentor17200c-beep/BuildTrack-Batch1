import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventoryRecord, InventoryTransaction, Material, MaterialRequest, StockStatus, MaterialAllocation, StockAdjustment, AllocationStatus } from './models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryDataService {
  private apiUrl = environment.apiUrl;

  private materials: Material[] = [];
  private inventoryRecords: InventoryRecord[] = [];
  private transactions: InventoryTransaction[] = [];
  private materialRequests: MaterialRequest[] = [];
  private allocations: MaterialAllocation[] = [];

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

  constructor(private http: HttpClient) {
    this.fetchInventoryData();
  }

  private fetchInventoryData() {
    forkJoin({
      materials: this.http.get<Material[]>(`${this.apiUrl}/inventory/materials`),
      inventory: this.http.get<InventoryRecord[]>(`${this.apiUrl}/inventory`),
      transactions: this.http.get<InventoryTransaction[]>(`${this.apiUrl}/inventory/transactions`),
      requests: this.http.get<MaterialRequest[]>(`${this.apiUrl}/inventory/material-requests`),
      allocations: this.http.get<MaterialAllocation[]>(`${this.apiUrl}/inventory/allocations`)
    }).pipe(
      tap(data => {
        this.materials = data.materials;
        this.inventoryRecords = data.inventory;
        this.transactions = data.transactions;
        this.materialRequests = data.requests;
        this.allocations = data.allocations;
        this.materials$$.next(this.materials);
        this.inventory$$.next(this.inventoryRecords);
        this.transactions$$.next(this.transactions);
        this.requests$$.next(this.materialRequests);
        this.allocations$$.next(this.allocations);
      })
    ).subscribe();
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