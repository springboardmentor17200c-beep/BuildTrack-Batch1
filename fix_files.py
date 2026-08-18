import os

# resource.model.ts
model_text = '''// Shared types used across the Resource Management module.

export type ResourceCategory =
  | 'Excavators'
  | 'Concrete Mixers'
  | 'Cranes'
  | 'Dump Trucks'
  | 'Generators'
  | 'Safety Equipment'
  | string;

export type ResourceStatus = 'Available' | 'Allocated' | 'Under Maintenance';

export interface Resource {
  resourceId: string;
  resourceName: string;
  category: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  purchaseDate: string;
  currentStatus: string;
}

export type AllocationStatus = 'Allocated' | 'Returned' | 'Overdue';

export interface ResourceAllocation {
  allocationId: string;
  resourceId: string;
  resourceName: string;
  category: string;
  project: string;
  allocatedBy: string;
  allocationDate: string;
  expectedReturnDate: string;
  actualReturnDate: string | null;
  allocationStatus: string;
  remarks?: string;
}

export interface MaintenanceRecord {
  maintenanceId: string;
  resourceId: string;
  resourceName?: string;
  maintenanceType: string;
  maintenanceDate: string;
  nextMaintenanceDate: string | null;
  maintenanceCost: number;
  servicedBy: string;
  remarks?: string;
}
'''
with open('C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/models/resource.model.ts', 'w', encoding='utf-8') as f:
    f.write(model_text)

# resource-data.service.ts
service_text = '''import { Injectable } from '@angular/core';
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
    return { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  }

  loadAll() {
    forkJoin({
      resources: this.http.get<any[]>(`${environment.apiUrl}/resources`, this.headers).pipe(catchError(() => of([]))),
      allocations: this.http.get<any[]>(`${environment.apiUrl}/resources/allocations`, this.headers).pipe(catchError(() => of([]))),
      maintenance: this.http.get<any[]>(`${environment.apiUrl}/resources/maintenance`, this.headers).pipe(catchError(() => of([])))
    }).subscribe(({ resources, allocations, maintenance }) => {
      this.resources.next(resources.map(r => ({
        resourceId: String(r.resource_id),
        resourceName: r.resource_name,
        category: r.category_name,
        manufacturer: r.manufacturer || '',
        modelNumber: r.model_number || '',
        serialNumber: r.serial_number || '',
        purchaseDate: r.purchase_date || '',
        currentStatus: r.current_status
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
        allocationStatus: a.allocation_status || 'Allocated',
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
    return ['Skyline Residency Tower', 'Riverside Business Park'];
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
    this.allocations.next([alloc, ...this.allocations.value]);
  }

  returnAllocation(allocId: string) {
    const update = this.allocations.value.map(a => {
      if(a.allocationId === allocId) {
         return { ...a, actualReturnDate: new Date().toISOString().split('T')[0], allocationStatus: 'Returned' };
      }
      return a;
    });
    this.allocations.next(update);
  }
}
'''
with open('C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/resource-data.service.ts', 'w', encoding='utf-8') as f:
    f.write(service_text)

# resource-categories.component.ts (Just in case it had issues)
categories_ts_text = '''import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ResourceCategory {
  resource_category_id?: number;
  category_name: string;
  description: string;
  resources: number;
  status: string;
}

@Component({
  selector: 'app-resource-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resource-categories.component.html',
  styleUrls: ['./resource-categories.component.css']
})
export class ResourceCategoriesComponent implements OnInit {

  showModal = false;
  categories: ResourceCategory[] = [];
  
  // Form fields
  newCategoryName = '';
  newCategoryDesc = '';

  constructor(private location: Location, private http: HttpClient) {}

  ngOnInit() {
    this.loadCategories();
  }

  private get headers() {
    const token = localStorage.getItem('buildtrack_access_token');
    return { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  }

  loadCategories() {
    this.http.get<any[]>(`${environment.apiUrl}/resources/categories`, this.headers)
      .subscribe({
        next: (data) => {
          this.categories = data.map(item => ({
            resource_category_id: item.resource_category_id,
            category_name: item.category_name,
            description: item.description || '',
            resources: item.resources || 0,
            status: item.status || 'Active'
          }));
        },
        error: (err) => console.error('Error loading categories', err)
      });
  }

  goBack(): void {
    this.location.back();
  }

  openModal() {
    this.newCategoryName = '';
    this.newCategoryDesc = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveCategory() {
    if (!this.newCategoryName.trim()) return;

    const payload = {
      category_name: this.newCategoryName,
      description: this.newCategoryDesc
    };

    this.http.post(`${environment.apiUrl}/resources/categories`, payload, this.headers)
      .subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error saving category', err);
          alert('Failed to save category. It may already exist.');
        }
      });
  }

  deleteCategory(id?: number) {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this category?')) return;

    this.http.delete(`${environment.apiUrl}/resources/categories/${id}`, this.headers)
      .subscribe({
        next: () => this.loadCategories(),
        error: (err) => {
          console.error('Error deleting category', err);
          alert('Cannot delete this category. It may have resources associated with it.');
        }
      });
  }
}
'''
with open('C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/resource-management/resource-categories/resource-categories.component.ts', 'w', encoding='utf-8') as f:
    f.write(categories_ts_text)
