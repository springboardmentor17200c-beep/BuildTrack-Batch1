import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MaintenanceRecord, Resource, ResourceAllocation } from './models/resource.model';

@Injectable({ providedIn: 'root' })
export class ResourceDataService {
  private apiUrl = environment.apiUrl;

  private resources: Resource[] = [];
  private allocations: ResourceAllocation[] = [];
  private maintenanceRecords: MaintenanceRecord[] = [];

  private resources$$ = new BehaviorSubject<Resource[]>(this.resources);
  private allocations$$ = new BehaviorSubject<ResourceAllocation[]>(this.allocations);
  private maintenance$$ = new BehaviorSubject<MaintenanceRecord[]>(this.maintenanceRecords);

  resources$ = this.resources$$.asObservable();
  allocations$ = this.allocations$$.asObservable();
  maintenance$ = this.maintenance$$.asObservable();

  constructor(private http: HttpClient) {
    this.fetchResourceData();
  }

  private fetchResourceData() {
    forkJoin({
      resources: this.http.get<Resource[]>(`${this.apiUrl}/resources`),
      allocations: this.http.get<ResourceAllocation[]>(`${this.apiUrl}/resources/allocations`),
      maintenance: this.http.get<MaintenanceRecord[]>(`${this.apiUrl}/resources/maintenance`)
    }).pipe(
      tap(data => {
        this.resources = data.resources;
        this.allocations = data.allocations;
        this.maintenanceRecords = data.maintenance;
        
        this.resources$$.next(this.resources);
        this.allocations$$.next(this.allocations);
        this.maintenance$$.next(this.maintenanceRecords);
      })
    ).subscribe();
  }

  get projectNames(): string[] {
    return ['Skyline Residency Tower', 'Riverside Business Park'];
  }

  // --- Derived values (not stored columns — computed the same way the
  //     backend would compute them from resource_allocations / maintenance_records) ---

  /** The project a resource is currently allocated to, or null if none (derived from the open allocation row). */
  getAssignedProject(resourceId: string): string | null {
    const open = this.allocations.find(a => a.resourceId === resourceId && a.actualReturnDate === null);
    return open ? open.project : null;
  }

  /** Most recent maintenance_date for a resource. */
  getLastMaintenanceDate(resourceId: string): string | null {
    const records = this.maintenanceRecords
      .filter(m => m.resourceId === resourceId)
      .sort((a, b) => b.maintenanceDate.localeCompare(a.maintenanceDate));
    return records.length ? records[0].maintenanceDate : null;
  }

  /** Next scheduled maintenance for a resource. */
  getNextMaintenanceDate(resourceId: string): string | null {
    const records = this.maintenanceRecords
      .filter(m => m.resourceId === resourceId && m.nextMaintenanceDate)
      .sort((a, b) => (a.nextMaintenanceDate as string).localeCompare(b.nextMaintenanceDate as string));
    return records.length ? records[0].nextMaintenanceDate : null;
  }

  /**
   * Utilization % — approximated as the share of days since purchase that
   * the resource has spent allocated (open or closed allocations), capped
   * at 100. In production this would be a backend aggregate query rather
   * than something computed client-side.
   */
  getUtilization(resourceId: string): number {
    const resource = this.resources.find(r => r.resourceId === resourceId);
    if (!resource) return 0;

    const purchase = new Date(resource.purchaseDate).getTime();
    const now = new Date('2026-07-10').getTime(); // fixed "today" for demo consistency
    const totalDays = Math.max(1, (now - purchase) / 86400000);

    const allocatedDays = this.allocations
      .filter(a => a.resourceId === resourceId)
      .reduce((sum, a) => {
        const start = new Date(a.allocationDate).getTime();
        const end = a.actualReturnDate ? new Date(a.actualReturnDate).getTime() : now;
        return sum + Math.max(0, (end - start) / 86400000);
      }, 0);

    return Math.min(100, Math.round((allocatedDays / totalDays) * 100));
  }

  addAllocation(allocation: ResourceAllocation) {
    this.allocations = [allocation, ...this.allocations];
    this.allocations$$.next(this.allocations);

    this.resources = this.resources.map(r =>
      r.resourceId === allocation.resourceId ? { ...r, currentStatus: 'Allocated' as const } : r
    );
    this.resources$$.next(this.resources);
  }

  returnAllocation(allocationId: string) {
    const allocation = this.allocations.find(a => a.allocationId === allocationId);
    if (!allocation) return;

    const today = '2026-07-10';
    this.allocations = this.allocations.map(a =>
      a.allocationId === allocationId ? { ...a, actualReturnDate: today, allocationStatus: 'Returned' as const } : a
    );
    this.allocations$$.next(this.allocations);

    this.resources = this.resources.map(r =>
      r.resourceId === allocation.resourceId ? { ...r, currentStatus: 'Available' as const } : r
    );
    this.resources$$.next(this.resources);
  }
}
