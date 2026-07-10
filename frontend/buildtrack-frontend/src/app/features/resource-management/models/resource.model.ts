// Shared types used across the Resource Management module

export type ResourceCategory =
  | 'Excavators'
  | 'Concrete Mixers'
  | 'Cranes'
  | 'Dump Trucks'
  | 'Generators'
  | 'Safety Equipment';

export type ResourceStatus = 'Available' | 'In Use' | 'Under Maintenance' | 'Idle';

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  status: ResourceStatus;
  assignedProject: string | null;
  site: string;
  utilization: number; // 0-100
  lastServiced: string; // ISO date
}

export interface Allocation {
  id: string;
  resourceId: string;
  resourceName: string;
  category: ResourceCategory;
  project: string;
  allocatedTo: string; // person responsible
  startDate: string;
  endDate: string;
  status: 'Active' | 'Scheduled' | 'Completed';
}
