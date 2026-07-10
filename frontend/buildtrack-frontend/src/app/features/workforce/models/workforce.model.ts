// Shared types used across the Workforce Management module

export type WorkforceCategory =
  | 'Engineers'
  | 'Supervisors'
  | 'Contractors'
  | 'Skilled Workers'
  | 'Unskilled Workers'
  | 'Consultants';

export type WorkerStatus = 'Active' | 'On Leave' | 'Inactive';

export interface Worker {
  id: string;
  name: string;
  category: WorkforceCategory;
  status: WorkerStatus;
  project: string;
  contact: string;
  joinDate: string; // ISO date
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'On Leave';

export interface AttendanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  date: string; // ISO date
  status: AttendanceStatus;
  checkIn: string | null; // e.g. '08:05 AM'
  checkOut: string | null;
}

export type ShiftType = 'Morning' | 'Evening' | 'Night';

export interface Shift {
  id: string;
  workerId: string;
  workerName: string;
  project: string;
  shiftType: ShiftType;
  date: string; // ISO date
  startTime: string;
  endTime: string;
}
