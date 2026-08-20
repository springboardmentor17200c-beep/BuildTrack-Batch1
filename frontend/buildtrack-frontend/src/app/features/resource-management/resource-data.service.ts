import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MaintenanceRecord, Resource, ResourceAllocation } from './models/resource.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResourceDataService {
  private resources = new BehaviorSubject<Resource[]>([]);
  private allocations = new BehaviorSubject<ResourceAllocation[]>([]);
  private projects = new BehaviorSubject<any[]>([]);
  private maintenance = new BehaviorSubject<MaintenanceRecord[]>([]);

  resources$ = this.resources.asObservable();
  allocations$ = this.allocations.asObservable();
  projects$ = this.projects.asObservable();
  maintenance$ = this.maintenance.asObservable();

  constructor(private http: HttpClient) {}

  private get headers() {
    let token = '';
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      token = localStorage.getItem('buildtrack_access_token') || '';
    }
    return { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  }

  loadAll() {
    forkJoin({
      resources: this.http.get<any[]>(`${environment.apiUrl}/resources`, this.headers).pipe(catchError(() => of([]))),
      allocations: this.http.get<any[]>(`${environment.apiUrl}/resources/allocations`, this.headers).pipe(catchError(() => of([]))),
      maintenance: this.http.get<any[]>(`${environment.apiUrl}/resources/maintenance`, this.headers).pipe(catchError(() => of([]))),
      projects: this.http.get<any[]>(`${environment.apiUrl}/projects/enriched`, this.headers).pipe(catchError(() => of([])))
    }).subscribe(({ resources, allocations, maintenance, projects }) => {
      this.projects.next(projects);
      this.resources.next(resources.map(r => ({
        resourceId: String(r.resource_id),
        resourceName: r.resource_name,
        category: r.category_name,
        manufacturer: r.manufacturer || '',
        modelNumber: r.model_number || '',
        serialNumber: r.serial_number || '',
        purchaseDate: r.purchase_date || '',
        currentStatus: r.current_status as any
      })));

      this.allocations.next(allocations.map(a => ({
        allocationId: String(a.allocation_id),
        resourceId: String(a.resource_id),
        resourceName: a.resource_name || '',
        category: a.category_name || '',
        project: a.project_name || '',
        allocatedBy: a.allocated_by_name || '',
        allocationDate: a.allocation_date || '',
        expectedReturnDate: a.expected_return_date || '',
        actualReturnDate: a.actual_return_date || null,
        allocationStatus: a.allocation_status as any || 'Allocated',
        remarks: a.remarks
      })));

      this.maintenance.next(maintenance.map(m => ({
        maintenanceId: String(m.maintenance_id),
        resourceId: String(m.resource_id),
        resourceName: m.resource_name || '',
        maintenanceType: m.maintenance_type,
        maintenanceDate: m.maintenance_date || '',
        nextMaintenanceDate: m.next_maintenance_date || null,
        maintenanceCost: m.maintenance_cost || 0,
        servicedBy: m.serviced_by || '',
        remarks: m.remarks
      })));
    });
  }

  get projectNames(): string[] {
    return this.projects.value.map(p => p.project_name);
  }

  getAssignedProject(resourceId: string): string | null {
    const open = this.allocations.value.find(a => String(a.resourceId) === String(resourceId) && !a.actualReturnDate);
    return open ? open.project : null;
  }

  getLastMaintenanceDate(resourceId: string): string | null {
    const records = this.maintenance.value
      .filter(m => String(m.resourceId) === String(resourceId))
      .sort((a, b) => b.maintenanceDate.localeCompare(a.maintenanceDate));
    return records.length ? records[0].maintenanceDate : null;
  }

  getNextMaintenanceDate(resourceId: string): string | null {
    const records = this.maintenance.value
      .filter(m => String(m.resourceId) === String(resourceId) && m.nextMaintenanceDate)
      .sort((a, b) => (a.nextMaintenanceDate as string).localeCompare(b.nextMaintenanceDate as string));
    return records.length ? (records[0].nextMaintenanceDate as string) : null;
  }

  getUtilization(resourceId: string): number {
    const resource = this.resources.value.find(r => String(r.resourceId) === String(resourceId));
    if (!resource || !resource.purchaseDate) return 0;

    const purchase = new Date(resource.purchaseDate).getTime();
    const now = new Date().getTime();
    const totalDays = Math.max(1, (now - purchase) / 86400000);

    const allocatedDays = this.allocations.value
      .filter(a => String(a.resourceId) === String(resourceId))
      .reduce((sum, a) => {
        const start = new Date(a.allocationDate).getTime();
        const end = a.actualReturnDate ? new Date(a.actualReturnDate).getTime() : now;
        return sum + Math.max(0, (end - start) / 86400000);
      }, 0);

    return Math.min(100, Math.round((allocatedDays / totalDays) * 100));
  }

  addAllocation(alloc: ResourceAllocation) {
    const proj = this.projects.value.find(p => p.project_name === alloc.project);
    const projId = proj ? proj.project_id : 1; // Fallback to 1 if not found
    const numResourceId = parseInt(alloc.resourceId.replace('R-', ''), 10) || parseInt(alloc.resourceId, 10);
    
    const body = {
      resource_id: numResourceId,
      project_id: projId,
      allocated_by_id: 1, // Will be overridden by backend using current_user
      allocation_date: alloc.allocationDate,
      expected_return_date: alloc.expectedReturnDate,
      allocation_status: 'Allocated',
      remarks: alloc.remarks || ''
    };
    
    this.http.post(`${environment.apiUrl}/resources/allocations`, body, this.headers).subscribe({
      next: () => this.loadAll(),
      error: err => console.error('Failed to add allocation', err)
    });
  }

  returnAllocation(allocId: string) {
    const today = new Date().toISOString().split('T')[0];
    const numericId = parseInt(allocId.replace('A-', ''), 10) || parseInt(allocId, 10);
    
    // Optimistic UI update
    const update = this.allocations.value.map(a => {
      if(a.allocationId === allocId) {
         return { ...a, actualReturnDate: today, allocationStatus: 'Returned' as any };
      }
      return a;
    });
    this.allocations.next(update);

    this.http.put(`${environment.apiUrl}/resources/allocations/${numericId}`, {
      actual_return_date: today,
      allocation_status: 'Returned'
    }, this.headers).subscribe({
      next: () => this.loadAll(),
      error: err => console.error('Failed to return allocation', err)
    });
  }
}
