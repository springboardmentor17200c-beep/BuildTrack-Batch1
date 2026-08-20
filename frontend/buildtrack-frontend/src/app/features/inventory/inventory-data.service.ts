import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, forkJoin, tap } from 'rxjs';
import {
  InventoryRecord, InventoryTransaction, Material, MaterialRequest,
  StockStatus, MaterialAllocation, StockAdjustment, AllocationStatus
} from './models/inventory.model';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'buildtrack_access_token';

interface ApiInventory {
  inventory_id: number;
  material_id: number;
  material_name: string;
  category: string;
  unit_of_measure: string;
  available_quantity: number;
  minimum_stock_level: number;
  storage_location: string | null;
  last_updated: string | null;
}

interface ApiMaterial {
  material_id: number;
  material_name: string;
  category: string;
  unit_of_measure: string;
  description: string | null;
  is_active: boolean;
}

function mapInventory(a: ApiInventory): InventoryRecord {
  return {
    inventoryId: `INV-${a.inventory_id}`,
    materialId: `MAT-${a.material_id}`,
    materialName: a.material_name,
    category: a.category as any,
    unitOfMeasure: a.unit_of_measure,
    availableQuantity: a.available_quantity,
    minimumStockLevel: a.minimum_stock_level,
    storageLocation: a.storage_location ?? 'Central Warehouse',
    lastUpdated: a.last_updated ?? new Date().toISOString().split('T')[0],
  };
}

function mapMaterial(a: ApiMaterial): Material {
  return {
    materialId: `MAT-${a.material_id}`,
    materialName: a.material_name,
    category: a.category as any,
    unitOfMeasure: a.unit_of_measure,
    description: a.description ?? undefined,
  };
}

@Injectable({ providedIn: 'root' })
export class InventoryDataService {
  private readonly base = `${environment.apiUrl}/inventory`;

  private materials$$ = new BehaviorSubject<Material[]>([]);
  private inventory$$ = new BehaviorSubject<InventoryRecord[]>([]);
  private transactions$$ = new BehaviorSubject<InventoryTransaction[]>([]);
  private requests$$ = new BehaviorSubject<MaterialRequest[]>([]);
  private allocations$$ = new BehaviorSubject<MaterialAllocation[]>([]);

  materials$ = this.materials$$.asObservable();
  inventory$ = this.inventory$$.asObservable();
  transactions$ = this.transactions$$.asObservable();
  requests$ = this.requests$$.asObservable();
  allocations$ = this.allocations$$.asObservable();

  constructor(private http: HttpClient) {}


  private headers(): HttpHeaders {
    let token = '';
    if (typeof localStorage !== 'undefined') {
      token = localStorage.getItem(TOKEN_KEY) ?? '';
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private err<T>(fallback: T) {
    return (e: any): Observable<T> => {
      console.error('[InventoryDataService]', e?.error?.detail ?? e?.message ?? e);
      return of(fallback);
    };
  }

  loadAll() {
    forkJoin({
      inventory: this.http.get<ApiInventory[]>(`${this.base}/enriched`, { headers: this.headers() })
        .pipe(catchError(this.err([]))),
      materials: this.http.get<ApiMaterial[]>(`${this.base}/materials/enriched`, { headers: this.headers() })
        .pipe(catchError(this.err([]))),
    }).subscribe(({ inventory, materials }) => {
      this.inventory$$.next(inventory.map(mapInventory));
      this.materials$$.next(materials.map(mapMaterial));
    });
  }

  get projectNames(): string[] {
    // Pulled from inventory records' project context — returned from service for forms
    return [];
  }

  getStockStatus(record: InventoryRecord): StockStatus {
    if (record.availableQuantity <= 0) return 'Out of Stock';
    if (record.availableQuantity <= record.minimumStockLevel) return 'Low Stock';
    return 'In Stock';
  }

  hasSufficientStock(materialId: string, quantity: number): boolean {
    const record = this.inventory$$.value.find(inv => inv.materialId === materialId);
    return !!record && record.availableQuantity >= quantity;
  }

  getAvailableForAllocation(materialId: string): number {
    const record = this.inventory$$.value.find(inv => inv.materialId === materialId);
    if (!record) return 0;
    const reserved = this.allocations$$.value
      .filter(a => a.materialId === materialId && a.status === 'Reserved')
      .reduce((sum, a) => sum + a.allocatedQuantity, 0);
    return record.availableQuantity - reserved;
  }

  // ── Material Requests ────────────────────────────────────────────────
  addMaterialRequest(request: MaterialRequest) {
    this.requests$$.next([request, ...this.requests$$.value]);
  }

  approveRequest(requestId: string) {
    const request = this.requests$$.value.find(r => r.requestId === requestId);
    if (!request) return;

    const record = this.inventory$$.value.find(inv => inv.materialId === request.materialId);
    if (!record || record.availableQuantity < request.requestedQuantity) return;

    const numericId = parseInt(record.inventoryId.replace('INV-', ''), 10);
    const newQty = record.availableQuantity - request.requestedQuantity;

    // Optimistic update
    this.inventory$$.next(this.inventory$$.value.map(inv =>
      inv.inventoryId === record.inventoryId
        ? { ...inv, availableQuantity: newQty, lastUpdated: new Date().toISOString().split('T')[0] }
        : inv
    ));
    this.requests$$.next(this.requests$$.value.map(r =>
      r.requestId === requestId ? { ...r, requestStatus: 'Approved' as const } : r
    ));

    // Persist stock reduction via PATCH
    this.http.patch(
      `${this.base}/enriched/${numericId}`,
      { quantity_available: newQty },
      { headers: this.headers() }
    ).pipe(catchError(this.err(null)))
     .subscribe(() => this.loadAll());
  }

  rejectRequest(requestId: string, remarks?: string) {
    this.requests$$.next(this.requests$$.value.map(r =>
      r.requestId === requestId
        ? { ...r, requestStatus: 'Rejected' as const, remarks: remarks || r.remarks }
        : r
    ));
  }

  // ── Material Allocations ─────────────────────────────────────────────
  createAllocation(allocation: Omit<MaterialAllocation, 'allocationId' | 'allocatedDate' | 'status'>): void {
    const newAllocation: MaterialAllocation = {
      ...allocation,
      allocationId: `ALL-${Date.now()}`,
      allocatedDate: new Date().toISOString().split('T')[0],
      status: 'Reserved',
    };
    this.allocations$$.next([newAllocation, ...this.allocations$$.value]);
    this._reduceStock(allocation.materialId, allocation.allocatedQuantity);
  }

  issueAllocation(allocationId: string): void {
    const allocation = this.allocations$$.value.find(a => a.allocationId === allocationId);
    if (!allocation || allocation.status !== 'Reserved') return;
    this.allocations$$.next(this.allocations$$.value.map(a =>
      a.allocationId === allocationId
        ? { ...a, status: 'Issued', issuedDate: new Date().toISOString().split('T')[0], issuedQuantity: a.allocatedQuantity }
        : a
    ));
  }

  returnAllocation(allocationId: string, returnedQuantity: number): void {
    const allocation = this.allocations$$.value.find(a => a.allocationId === allocationId);
    if (!allocation || allocation.status === 'Returned') return;
    const newReturned = (allocation.returnedQuantity || 0) + returnedQuantity;
    const newStatus: AllocationStatus = newReturned < allocation.allocatedQuantity ? 'PartiallyReturned' : 'Returned';
    this.allocations$$.next(this.allocations$$.value.map(a =>
      a.allocationId === allocationId ? { ...a, returnedQuantity: newReturned, status: newStatus } : a
    ));
    this._addToStock(allocation.materialId, returnedQuantity);
  }

  // ── Material Catalog (Stock Management) ─────────────────────────────
  addMaterial(material: Omit<Material, 'materialId'>): Observable<any> {
    // POST to /materials to persist
    const payload = {
      company_id: 1, // fallback
      material_name: material.materialName,
      unit: material.unitOfMeasure,
      description: material.description,
      is_active: material.isActive ?? true
    };
    
    return this.http.post<any>(`${environment.apiUrl}/materials`, payload, { headers: this.headers() }).pipe(
      tap(() => this.loadAll())
    );
  }

  updateMaterial(materialId: string, updates: Partial<Material>): void {
    this.materials$$.next(this.materials$$.value.map(m =>
      m.materialId === materialId ? { ...m, ...updates } : m
    ));

    const numericId = parseInt(materialId.replace('MAT-', ''), 10);
    const payload: any = {};
    if (updates.materialName) payload.material_name = updates.materialName;
    if (updates.unitOfMeasure) payload.unit = updates.unitOfMeasure;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;

    this.http.put(`${environment.apiUrl}/materials/${numericId}`, payload, { headers: this.headers() })
      .pipe(catchError(this.err(null)))
      .subscribe(() => this.loadAll());
  }

  deleteMaterial(materialId: string): void {
    this.materials$$.next(this.materials$$.value.filter(m => m.materialId !== materialId));

    const numericId = parseInt(materialId.replace('MAT-', ''), 10);
    this.http.delete(`${environment.apiUrl}/materials/${numericId}`, { headers: this.headers() })
      .pipe(catchError(this.err(null)))
      .subscribe(() => this.loadAll());
  }

  addInventoryRecord(record: Omit<InventoryRecord, 'inventoryId' | 'lastUpdated'>): void {
    const tmp: InventoryRecord = {
      ...record,
      inventoryId: `INV-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    this.inventory$$.next([tmp, ...this.inventory$$.value]);

    const payload = {
      company_id: 1, // fallback (matches user's company)
      material_id: parseInt(record.materialId.replace('MAT-', ''), 10),
      quantity_available: record.availableQuantity,
      minimum_quantity: record.minimumStockLevel,
      location_note: record.storageLocation
    };

    this.http.post(`${this.base}`, payload, { headers: this.headers() })
      .pipe(catchError(this.err(null)))
      .subscribe(() => this.loadAll());
  }

  updateInventoryRecord(inventoryId: string, updates: Partial<InventoryRecord>): void {
    this.inventory$$.next(this.inventory$$.value.map(inv =>
      inv.inventoryId === inventoryId
        ? { ...inv, ...updates, lastUpdated: new Date().toISOString().split('T')[0] }
        : inv
    ));

    const numericId = parseInt(inventoryId.replace('INV-', ''), 10);
    const payload: any = {};
    if (updates.availableQuantity !== undefined) payload.quantity_available = updates.availableQuantity;
    if (updates.minimumStockLevel !== undefined) payload.minimum_quantity = updates.minimumStockLevel;
    if (updates.storageLocation !== undefined) payload.location_note = updates.storageLocation;

    this.http.patch(`${this.base}/enriched/${numericId}`, payload, { headers: this.headers() })
      .pipe(catchError(this.err(null)))
      .subscribe(() => this.loadAll());
  }

  // ── Private helpers ──────────────────────────────────────────────────
  private _reduceStock(materialId: string, quantity: number): void {
    const record = this.inventory$$.value.find(inv => inv.materialId === materialId);
    if (!record) return;
    const numericId = parseInt(record.inventoryId.replace('INV-', ''), 10);
    const newQty = Math.max(0, record.availableQuantity - quantity);
    this.inventory$$.next(this.inventory$$.value.map(inv =>
      inv.inventoryId === record.inventoryId
        ? { ...inv, availableQuantity: newQty, lastUpdated: new Date().toISOString().split('T')[0] }
        : inv
    ));
    this.http.patch(`${this.base}/enriched/${numericId}`, { quantity_available: newQty }, { headers: this.headers() })
      .pipe(catchError(this.err(null))).subscribe(() => this.loadAll());
  }

  private _addToStock(materialId: string, quantity: number): void {
    const record = this.inventory$$.value.find(inv => inv.materialId === materialId);
    if (!record) return;
    const numericId = parseInt(record.inventoryId.replace('INV-', ''), 10);
    const newQty = record.availableQuantity + quantity;
    this.inventory$$.next(this.inventory$$.value.map(inv =>
      inv.inventoryId === record.inventoryId
        ? { ...inv, availableQuantity: newQty, lastUpdated: new Date().toISOString().split('T')[0] }
        : inv
    ));
    this.http.patch(`${this.base}/enriched/${numericId}`, { quantity_available: newQty }, { headers: this.headers() })
      .pipe(catchError(this.err(null))).subscribe(() => this.loadAll());
  }
}