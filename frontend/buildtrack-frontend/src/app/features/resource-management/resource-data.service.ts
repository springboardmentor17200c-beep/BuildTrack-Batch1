import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Allocation, Resource } from './models/resource.model';

// NOTE: This service currently serves mock/in-memory data so the UI is
// demoable without the backend. When the FastAPI endpoints are ready,
// replace the arrays below with HttpClient calls, e.g.:
//   this.http.get<Resource[]>('/api/resources')
// The component code does not need to change, since it only depends on
// the observables exposed here.

@Injectable({ providedIn: 'root' })
export class ResourceDataService {
  private resources: Resource[] = [
    { id: 'R-101', name: 'CAT 320 Excavator', category: 'Excavators', status: 'In Use', assignedProject: 'Skyline Residency Tower', site: 'Whitefield, Bengaluru', utilization: 82, lastServiced: '2026-06-12' },
    { id: 'R-102', name: 'JCB 3DX Excavator', category: 'Excavators', status: 'Available', assignedProject: null, site: 'Central Yard', utilization: 34, lastServiced: '2026-05-28' },
    { id: 'R-103', name: 'Schwing Stetter Mixer', category: 'Concrete Mixers', status: 'In Use', assignedProject: 'Riverside Business Park', site: 'Gachibowli, Hyderabad', utilization: 91, lastServiced: '2026-06-30' },
    { id: 'R-104', name: 'Ajax Concrete Mixer', category: 'Concrete Mixers', status: 'Under Maintenance', assignedProject: null, site: 'Central Yard', utilization: 12, lastServiced: '2026-04-15' },
    { id: 'R-105', name: 'Liebherr Tower Crane', category: 'Cranes', status: 'In Use', assignedProject: 'Skyline Residency Tower', site: 'Whitefield, Bengaluru', utilization: 76, lastServiced: '2026-06-20' },
    { id: 'R-106', name: 'Mobile Crane 50T', category: 'Cranes', status: 'Idle', assignedProject: null, site: 'Central Yard', utilization: 8, lastServiced: '2026-03-10' },
    { id: 'R-107', name: 'Tata Signa Dump Truck', category: 'Dump Trucks', status: 'In Use', assignedProject: 'Riverside Business Park', site: 'Gachibowli, Hyderabad', utilization: 68, lastServiced: '2026-06-05' },
    { id: 'R-108', name: 'Ashok Leyland Dump Truck', category: 'Dump Trucks', status: 'Available', assignedProject: null, site: 'Central Yard', utilization: 22, lastServiced: '2026-05-02' },
    { id: 'R-109', name: 'Mahindra Diesel Generator', category: 'Generators', status: 'In Use', assignedProject: 'Skyline Residency Tower', site: 'Whitefield, Bengaluru', utilization: 55, lastServiced: '2026-06-18' },
    { id: 'R-110', name: 'Kirloskar Generator 125kVA', category: 'Generators', status: 'Available', assignedProject: null, site: 'Central Yard', utilization: 18, lastServiced: '2026-05-22' },
    { id: 'R-111', name: 'Safety Harness Set (x40)', category: 'Safety Equipment', status: 'In Use', assignedProject: 'Riverside Business Park', site: 'Gachibowli, Hyderabad', utilization: 88, lastServiced: '2026-06-28' },
    { id: 'R-112', name: 'Fire Safety Kit (x10)', category: 'Safety Equipment', status: 'Available', assignedProject: null, site: 'Central Yard', utilization: 30, lastServiced: '2026-06-01' },
  ];

  private allocations: Allocation[] = [
    { id: 'A-2001', resourceId: 'R-101', resourceName: 'CAT 320 Excavator', category: 'Excavators', project: 'Skyline Residency Tower', allocatedTo: 'Priya Menon', startDate: '2026-06-15', endDate: '2026-08-10', status: 'Active' },
    { id: 'A-2002', resourceId: 'R-103', resourceName: 'Schwing Stetter Mixer', category: 'Concrete Mixers', project: 'Riverside Business Park', allocatedTo: 'Karthik Iyer', startDate: '2026-06-20', endDate: '2026-07-25', status: 'Active' },
    { id: 'A-2003', resourceId: 'R-105', resourceName: 'Liebherr Tower Crane', category: 'Cranes', project: 'Skyline Residency Tower', allocatedTo: 'Priya Menon', startDate: '2026-05-01', endDate: '2026-09-30', status: 'Active' },
    { id: 'A-2004', resourceId: 'R-108', resourceName: 'Ashok Leyland Dump Truck', category: 'Dump Trucks', project: 'Riverside Business Park', allocatedTo: 'Karthik Iyer', startDate: '2026-07-15', endDate: '2026-07-31', status: 'Scheduled' },
  ];

  private resources$$ = new BehaviorSubject<Resource[]>(this.resources);
  private allocations$$ = new BehaviorSubject<Allocation[]>(this.allocations);

  resources$ = this.resources$$.asObservable();
  allocations$ = this.allocations$$.asObservable();

  get projectNames(): string[] {
    return ['Skyline Residency Tower', 'Riverside Business Park'];
  }

  addAllocation(allocation: Allocation, resourceId: string) {
    this.allocations = [allocation, ...this.allocations];
    this.allocations$$.next(this.allocations);

    this.resources = this.resources.map(r =>
      r.id === resourceId ? { ...r, status: 'In Use', assignedProject: allocation.project } : r
    );
    this.resources$$.next(this.resources);
  }

  deleteAllocation(id: string) {
    const allocation = this.allocations.find(a => a.id === id);
    this.allocations = this.allocations.filter(a => a.id !== id);
    this.allocations$$.next(this.allocations);

    if (allocation) {
      this.resources = this.resources.map(r =>
        r.id === allocation.resourceId ? { ...r, status: 'Available', assignedProject: null } : r
      );
      this.resources$$.next(this.resources);
    }
  }
}
