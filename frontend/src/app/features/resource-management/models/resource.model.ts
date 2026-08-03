// Shared types used across the Resource Management module.
// Field names mirror the BuildTrack database schema:
//   resources, resource_categories, resource_allocations, maintenance_records

export type ResourceCategory =
  | 'Excavators'
  | 'Concrete Mixers'
  | 'Cranes'
  | 'Dump Trucks'
  | 'Generators'
  | 'Safety Equipment';

// Matches resources.current_status
export type ResourceStatus = 'Available' | 'Allocated' | 'Under Maintenance';

// Maps to the `resources` table.
// NOTE: site/location and "assigned project" are NOT stored on this table in
// the real schema — they're derived from the resource's current (open)
// resource_allocations row. See ResourceDataService.getAssignedProject().
export interface Resource {
  resourceId: string;
  resourceName: string;
  category: ResourceCategory;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  purchaseDate: string; // ISO date
  currentStatus: ResourceStatus;
}

// Maps to the `resource_allocations` table.
// allocationStatus matches resource_allocations.allocation_status.
export type AllocationStatus = 'Allocated' | 'Returned' | 'Overdue';

export interface ResourceAllocation {
  allocationId: string;
  resourceId: string;
  resourceName: string; // denormalized for display only
  category: ResourceCategory; // denormalized for display only
  project: string;
  allocatedBy: string;
  allocationDate: string; // ISO date
  expectedReturnDate: string; // ISO date
  actualReturnDate: string | null; // null while still allocated
  allocationStatus: AllocationStatus;
  remarks?: string;
}

// Maps to the `maintenance_records` table.
export interface MaintenanceRecord {
  maintenanceId: string;
  resourceId: string;
  maintenanceType: string;
  maintenanceDate: string; // ISO date
  nextMaintenanceDate: string | null;
  maintenanceCost: number;
  servicedBy: string;
  remarks?: string;
}
