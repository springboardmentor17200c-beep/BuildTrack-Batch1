import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MaterialItem, ProcurementRequest } from './models/inventory.model';

// NOTE: mock/in-memory data for now. When the FastAPI inventory endpoints
// are ready, replace the arrays below with HttpClient calls, e.g.
//   this.http.get<MaterialItem[]>('/api/inventory/materials')
// Components only depend on the observables exposed here, so no component
// code needs to change when you switch to a real backend.

@Injectable({ providedIn: 'root' })
export class InventoryDataService {
  private materials: MaterialItem[] = [
    { id: 'M-201', name: 'OPC 53 Grade Cement', category: 'Cement', unit: 'bags', currentStock: 1200, reorderLevel: 500, site: 'Whitefield, Bengaluru', status: 'In Stock', lastUpdated: '2026-07-08' },
    { id: 'M-202', name: 'PPC Cement', category: 'Cement', unit: 'bags', currentStock: 180, reorderLevel: 400, site: 'Gachibowli, Hyderabad', status: 'Low Stock', lastUpdated: '2026-07-06' },
    { id: 'M-203', name: 'TMT Steel Bars (12mm)', category: 'Steel', unit: 'tons', currentStock: 42, reorderLevel: 20, site: 'Whitefield, Bengaluru', status: 'In Stock', lastUpdated: '2026-07-07' },
    { id: 'M-204', name: 'TMT Steel Bars (8mm)', category: 'Steel', unit: 'tons', currentStock: 6, reorderLevel: 15, site: 'Gachibowli, Hyderabad', status: 'Low Stock', lastUpdated: '2026-07-05' },
    { id: 'M-205', name: 'Red Clay Bricks', category: 'Bricks', unit: 'pieces', currentStock: 45000, reorderLevel: 10000, site: 'Whitefield, Bengaluru', status: 'In Stock', lastUpdated: '2026-07-09' },
    { id: 'M-206', name: 'Fly Ash Bricks', category: 'Bricks', unit: 'pieces', currentStock: 0, reorderLevel: 8000, site: 'Central Yard', status: 'Out of Stock', lastUpdated: '2026-06-29' },
    { id: 'M-207', name: 'River Sand', category: 'Sand', unit: 'tons', currentStock: 85, reorderLevel: 30, site: 'Gachibowli, Hyderabad', status: 'In Stock', lastUpdated: '2026-07-08' },
    { id: 'M-208', name: 'M-Sand', category: 'Sand', unit: 'tons', currentStock: 12, reorderLevel: 25, site: 'Whitefield, Bengaluru', status: 'Low Stock', lastUpdated: '2026-07-04' },
    { id: 'M-209', name: 'Ready Mix Concrete M25', category: 'Concrete', unit: 'cubic meters', currentStock: 60, reorderLevel: 20, site: 'Gachibowli, Hyderabad', status: 'In Stock', lastUpdated: '2026-07-09' },
    { id: 'M-210', name: 'Copper Electrical Wire', category: 'Electrical Materials', unit: 'meters', currentStock: 3200, reorderLevel: 1000, site: 'Central Yard', status: 'In Stock', lastUpdated: '2026-07-03' },
    { id: 'M-211', name: 'MCB Distribution Boards', category: 'Electrical Materials', unit: 'pieces', currentStock: 4, reorderLevel: 10, site: 'Whitefield, Bengaluru', status: 'Low Stock', lastUpdated: '2026-07-02' },
    { id: 'M-212', name: 'PVC Pipes (4 inch)', category: 'Plumbing Materials', unit: 'pieces', currentStock: 0, reorderLevel: 200, site: 'Central Yard', status: 'Out of Stock', lastUpdated: '2026-06-27' },
    { id: 'M-213', name: 'CPVC Fittings Set', category: 'Plumbing Materials', unit: 'sets', currentStock: 340, reorderLevel: 100, site: 'Gachibowli, Hyderabad', status: 'In Stock', lastUpdated: '2026-07-07' },
  ];

  private requests: ProcurementRequest[] = [
    { id: 'PR-3001', materialId: 'M-202', materialName: 'PPC Cement', category: 'Cement', quantity: 600, unit: 'bags', project: 'Riverside Business Park', requestedBy: 'Karthik Iyer', requestDate: '2026-07-07', status: 'Pending' },
    { id: 'PR-3002', materialId: 'M-206', materialName: 'Fly Ash Bricks', category: 'Bricks', quantity: 15000, unit: 'pieces', project: 'Skyline Residency Tower', requestedBy: 'Priya Menon', requestDate: '2026-07-05', status: 'Approved' },
    { id: 'PR-3003', materialId: 'M-212', materialName: 'PVC Pipes (4 inch)', category: 'Plumbing Materials', quantity: 500, unit: 'pieces', project: 'Riverside Business Park', requestedBy: 'Karthik Iyer', requestDate: '2026-07-01', status: 'Delivered' },
    { id: 'PR-3004', materialId: 'M-211', materialName: 'MCB Distribution Boards', category: 'Electrical Materials', quantity: 20, unit: 'pieces', project: 'Skyline Residency Tower', requestedBy: 'Priya Menon', requestDate: '2026-06-28', status: 'Rejected' },
  ];

  private materials$$ = new BehaviorSubject<MaterialItem[]>(this.materials);
  private requests$$ = new BehaviorSubject<ProcurementRequest[]>(this.requests);

  materials$ = this.materials$$.asObservable();
  requests$ = this.requests$$.asObservable();

  get projectNames(): string[] {
    return ['Skyline Residency Tower', 'Riverside Business Park'];
  }

  addRequest(request: ProcurementRequest) {
    this.requests = [request, ...this.requests];
    this.requests$$.next(this.requests);
  }

  updateRequestStatus(id: string, status: ProcurementRequest['status']) {
    this.requests = this.requests.map(r => (r.id === id ? { ...r, status } : r));
    this.requests$$.next(this.requests);

    // If a request is marked delivered, top up stock for that material.
    if (status === 'Delivered') {
      const req = this.requests.find(r => r.id === id);
      if (req) {
        this.materials = this.materials.map(m =>
          m.id === req.materialId
            ? {
                ...m,
                currentStock: m.currentStock + req.quantity,
                status: m.currentStock + req.quantity > m.reorderLevel ? 'In Stock' : 'Low Stock',
                lastUpdated: new Date().toISOString().slice(0, 10),
              }
            : m
        );
        this.materials$$.next(this.materials);
      }
    }
  }
}
