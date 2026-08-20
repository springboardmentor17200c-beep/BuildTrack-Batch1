import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MaintenanceRecord, Resource, ResourceAllocation } from './models/resource.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResourceDataService {
  private resources = new BehaviorSubject<Resource[]>([]);
  private allocations = new BehaviorSubject<ResourceAllocation[]>([]);
  private maintenance = new BehaviorSubject<MaintenanceRecord[]>([]);

  resources$ = this.resources.asObservable();
  allocations$ = this.allocations.asObservable();
  maintenance$ = this.maintenance.asObservable();

  constructor(private http: HttpClient) {}

  private get headers() {
    let token = '';
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      token = localStorage.getItem('buildtrack_access_token') || '';
    }
    return { headers: new HttpHeaders({ 'Authorization': \Bearer \\ }) };
  }

  loadAll() {
    forkJoin({
      resources: this.http.get<any[]>(\\/resources\, this.headers).pipe(catchError(() => of([]))),
      allocations: this.http.get<any[]>(\\/resources/allocations\, this.headers).pipe(catchError(() => of([]))),
      maintenance: this.http.get<any[]>(\\/resources/maintenance\, this.headers).pipe(catchError(() => of([])))
    }).subscribe(({ resources, allocations, maintenance }) => {
      this.resources.next(resources.map(r => ({
        resourceId: \R-\\,
        resourceName: r.resource_name,
        category: r.category_name,
        manufacturer: r.manufacturer || '',
        modelNumber: r.model_number || '',
        serialNumber: r.serial_number || '',
        purchaseDate: r.purchase_date || '',
        currentStatus: r.current_status
      })));

      this.allocations.next(allocations.map(a => ({
        allocationId: \A-\\,
        resourceId: \R-\\,
        resourceName: a.resource_name,
        category: a.category_name,
        project: a.project_name,
        allocatedBy: a.allocated_by_name,
        allocationDate: a.allocation_date,
        expectedReturnDate: a.expected_return_date,
        actualReturnDate: a.actual_return_date,
        allocationStatus: a.allocation_status,
        remarks: a.remarks
      })));

      this.maintenance.next(maintenance.map(m => ({
        maintenanceId: \M-\\,
        resourceId: \R-\\,
        maintenanceType: m.maintenance_type,
        maintenanceDate: m.maintenance_date,
        nextMaintenanceDate: m.next_maintenance_date,
        maintenanceCost: m.maintenance_cost,
        servicedBy: m.serviced_by,
        remarks: m.remarks
      })));
    });
  }

  get projectNames(): string[] {
    return ['Skyline Residency Tower', 'Riverside Business Park'];
  }

  getAssignedProject(resourceId: string): string | null {
    const open = this.allocations.value.find(a => a.resourceId === resourceId && !a.actualReturnDate);
    return open ? open.project : null;
  }

  getLastMaintenanceDate(resourceId: string): string | null {
    const records = this.maintenance.value
      .filter(m => m.resourceId === resourceId)
      .sort((a, b) => b.maintenanceDate.localeCompare(a.maintenanceDate));
    return records.length ? records[0].maintenanceDate : null;
  }

  getNextMaintenanceDate(resourceId: string): string | null {
    const records = this.maintenance.value
      .filter(m => m.resourceId === resourceId && m.nextMaintenanceDate)
      .sort((a, b) => (a.nextMaintenanceDate as string).localeCompare(b.nextMaintenanceDate as string));
    return records.length ? records[0].nextMaintenanceDate as string : null;
  }

  getUtilization(resourceId: string): number {
    const resource = this.resources.value.find(r => r.resourceId === resourceId);
    if (!resource || !resource.purchaseDate) return 0;

    const purchase = new Date(resource.purchaseDate).getTime();
    const now = new Date().getTime();
    const totalDays = Math.max(1, (now - purchase) / 86400000);

    const allocatedDays = this.allocations.value
      .filter(a => a.resourceId === resourceId)
      .reduce((sum, a) => {
        const start = new Date(a.allocationDate).getTime();
        const end = a.actualReturnDate ? new Date(a.actualReturnDate).getTime() : now;
        return sum + Math.max(0, (end - start) / 86400000);
      }, 0);

    return Math.min(100, Math.round((allocatedDays / totalDays) * 100));
  }
}
