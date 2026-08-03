import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MaintenanceRecord, Resource, ResourceAllocation } from './models/resource.model';

// NOTE: mock/in-memory data for now. When the FastAPI endpoints are ready,
// replace the arrays below with HttpClient calls against:
//   GET /api/resources
//   GET /api/resources/allocations
//   GET /api/resources/maintenance
// Field names here match the `resources`, `resource_allocations`, and
// `maintenance_records` tables in the BuildTrack database schema, so the
// mapping to real API responses should be close to 1:1.

@Injectable({ providedIn: 'root' })
export class ResourceDataService {
  private resources: Resource[] = [
    { resourceId: 'R-101', resourceName: 'CAT 320 Excavator', category: 'Excavators', manufacturer: 'Caterpillar', modelNumber: '320GC', serialNumber: 'CAT320-8841', purchaseDate: '2024-03-10', currentStatus: 'Allocated' },
    { resourceId: 'R-102', resourceName: 'JCB 3DX Excavator', category: 'Excavators', manufacturer: 'JCB', modelNumber: '3DX', serialNumber: 'JCB3DX-2210', purchaseDate: '2023-11-02', currentStatus: 'Available' },
    { resourceId: 'R-103', resourceName: 'Schwing Stetter Mixer', category: 'Concrete Mixers', manufacturer: 'Schwing Stetter', modelNumber: 'AM 40 SP', serialNumber: 'SS40-5521', purchaseDate: '2024-01-18', currentStatus: 'Allocated' },
    { resourceId: 'R-104', resourceName: 'Ajax Concrete Mixer', category: 'Concrete Mixers', manufacturer: 'Ajax', modelNumber: 'CM-14', serialNumber: 'AJX14-1187', purchaseDate: '2022-08-25', currentStatus: 'Under Maintenance' },
    { resourceId: 'R-105', resourceName: 'Liebherr Tower Crane', category: 'Cranes', manufacturer: 'Liebherr', modelNumber: '132 EC-H', serialNumber: 'LB132-0093', purchaseDate: '2023-05-14', currentStatus: 'Allocated' },
    { resourceId: 'R-106', resourceName: 'Mobile Crane 50T', category: 'Cranes', manufacturer: 'XCMG', modelNumber: 'QY50KA', serialNumber: 'XCM50-6602', purchaseDate: '2022-12-01', currentStatus: 'Available' },
    { resourceId: 'R-107', resourceName: 'Tata Signa Dump Truck', category: 'Dump Trucks', manufacturer: 'Tata Motors', modelNumber: 'Signa 4021', serialNumber: 'TSG40-3345', purchaseDate: '2024-02-20', currentStatus: 'Allocated' },
    { resourceId: 'R-108', resourceName: 'Ashok Leyland Dump Truck', category: 'Dump Trucks', manufacturer: 'Ashok Leyland', modelNumber: '2523', serialNumber: 'ASH25-7789', purchaseDate: '2023-09-08', currentStatus: 'Available' },
    { resourceId: 'R-109', resourceName: 'Mahindra Diesel Generator', category: 'Generators', manufacturer: 'Mahindra Powerol', modelNumber: 'MPG-125', serialNumber: 'MPG125-4471', purchaseDate: '2023-07-11', currentStatus: 'Allocated' },
    { resourceId: 'R-110', resourceName: 'Kirloskar Generator 125kVA', category: 'Generators', manufacturer: 'Kirloskar', modelNumber: 'KG1-125', serialNumber: 'KG1-9982', purchaseDate: '2022-10-30', currentStatus: 'Available' },
    { resourceId: 'R-111', resourceName: 'Safety Harness Set (x40)', category: 'Safety Equipment', manufacturer: '3M', modelNumber: 'DBI-Sala', serialNumber: '3M-SET-2201', purchaseDate: '2024-04-01', currentStatus: 'Allocated' },
    { resourceId: 'R-112', resourceName: 'Fire Safety Kit (x10)', category: 'Safety Equipment', manufacturer: 'Ceasefire', modelNumber: 'CF-Kit-10', serialNumber: 'CF10-5567', purchaseDate: '2023-06-19', currentStatus: 'Available' },
  ];

  private allocations: ResourceAllocation[] = [
    { allocationId: 'A-2001', resourceId: 'R-101', resourceName: 'CAT 320 Excavator', category: 'Excavators', project: 'Skyline Residency Tower', allocatedBy: 'Priya Menon', allocationDate: '2026-06-15', expectedReturnDate: '2026-08-10', actualReturnDate: null, allocationStatus: 'Allocated' },
    { allocationId: 'A-2002', resourceId: 'R-103', resourceName: 'Schwing Stetter Mixer', category: 'Concrete Mixers', project: 'Riverside Business Park', allocatedBy: 'Karthik Iyer', allocationDate: '2026-06-20', expectedReturnDate: '2026-07-25', actualReturnDate: null, allocationStatus: 'Allocated' },
    { allocationId: 'A-2003', resourceId: 'R-105', resourceName: 'Liebherr Tower Crane', category: 'Cranes', project: 'Skyline Residency Tower', allocatedBy: 'Priya Menon', allocationDate: '2026-05-01', expectedReturnDate: '2026-09-30', actualReturnDate: null, allocationStatus: 'Allocated' },
    { allocationId: 'A-2004', resourceId: 'R-107', resourceName: 'Tata Signa Dump Truck', category: 'Dump Trucks', project: 'Riverside Business Park', allocatedBy: 'Karthik Iyer', allocationDate: '2026-06-05', expectedReturnDate: '2026-07-05', actualReturnDate: null, allocationStatus: 'Overdue' },
    { allocationId: 'A-2005', resourceId: 'R-109', resourceName: 'Mahindra Diesel Generator', category: 'Generators', project: 'Skyline Residency Tower', allocatedBy: 'Priya Menon', allocationDate: '2026-06-18', expectedReturnDate: '2026-08-01', actualReturnDate: null, allocationStatus: 'Allocated' },
    { allocationId: 'A-2006', resourceId: 'R-111', resourceName: 'Safety Harness Set (x40)', category: 'Safety Equipment', project: 'Riverside Business Park', allocatedBy: 'Karthik Iyer', allocationDate: '2026-06-28', expectedReturnDate: '2026-08-15', actualReturnDate: null, allocationStatus: 'Allocated' },
    { allocationId: 'A-1998', resourceId: 'R-104', resourceName: 'Ajax Concrete Mixer', category: 'Concrete Mixers', project: 'Skyline Residency Tower', allocatedBy: 'Priya Menon', allocationDate: '2026-03-01', expectedReturnDate: '2026-04-01', actualReturnDate: '2026-03-30', allocationStatus: 'Returned' },
  ];

  private maintenanceRecords: MaintenanceRecord[] = [
    { maintenanceId: 'M-9001', resourceId: 'R-104', maintenanceType: 'Engine Repair', maintenanceDate: '2026-06-25', nextMaintenanceDate: '2026-09-25', maintenanceCost: 18500, servicedBy: 'Ajax Authorized Service' },
    { maintenanceId: 'M-9002', resourceId: 'R-101', maintenanceType: 'Routine Service', maintenanceDate: '2026-06-01', nextMaintenanceDate: '2026-09-01', maintenanceCost: 6200, servicedBy: 'Caterpillar Service Center' },
    { maintenanceId: 'M-9003', resourceId: 'R-105', maintenanceType: 'Cable Inspection', maintenanceDate: '2026-05-20', nextMaintenanceDate: '2026-08-20', maintenanceCost: 9800, servicedBy: 'Liebherr Field Team' },
    { maintenanceId: 'M-9004', resourceId: 'R-109', maintenanceType: 'Routine Service', maintenanceDate: '2026-06-10', nextMaintenanceDate: '2026-09-10', maintenanceCost: 3100, servicedBy: 'Mahindra Powerol Service' },
    { maintenanceId: 'M-9005', resourceId: 'R-107', maintenanceType: 'Tyre Replacement', maintenanceDate: '2026-05-05', nextMaintenanceDate: '2026-11-05', maintenanceCost: 24000, servicedBy: 'Tata Fleet Service' },
  ];

  private resources$$ = new BehaviorSubject<Resource[]>(this.resources);
  private allocations$$ = new BehaviorSubject<ResourceAllocation[]>(this.allocations);
  private maintenance$$ = new BehaviorSubject<MaintenanceRecord[]>(this.maintenanceRecords);

  resources$ = this.resources$$.asObservable();
  allocations$ = this.allocations$$.asObservable();
  maintenance$ = this.maintenance$$.asObservable();

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
