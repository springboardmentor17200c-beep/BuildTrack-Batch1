// Shared types used across the Resource Management module.

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
  currentStatus: ResourceStatus;
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
  allocationStatus: AllocationStatus;
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
