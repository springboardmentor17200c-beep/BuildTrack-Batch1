// Shared types used across the Workforce Management module.
// Field names mirror the BuildTrack database schema:
//   workforce_categories, employee_profiles
// PLUS `attendance` and `shifts` — tables that did not exist in the
// original schema doc. These match exactly what was recommended to the
// DB team to add (see conversation history). Since I have not seen the
// actual updated schema or backend route files, treat this as a
// best-effort alignment, not a confirmed one — worth a quick recheck
// once the real schema/backend code is available, the same way
// Resources and Inventory were rechecked once their real schema arrived.

export type WorkforceCategory =
  | 'Engineers'
  | 'Supervisors'
  | 'Contractors'
  | 'Skilled Workers'
  | 'Unskilled Workers'
  | 'Consultants';

// Matches employee_profiles.employment_status exactly, per the real
// database doc: "defaults to 'Active', e.g. Active, On Leave, or Terminated."
export type EmploymentStatus = 'Active' | 'On Leave' | 'Terminated';

export type PaymentType = 'Hourly' | 'Daily' | 'Monthly';

// Maps to the `employee_profiles` table (confirmed real table).
export interface Employee {
  employeeId: string;
  employeeCode: string;
  fullName: string; // denormalized from users.full_name for display
  workforceCategory: WorkforceCategory;
  project: string;
  contact: string;
  joiningDate: string; // ISO date
  experienceYears: number;
  payRate: number;
  paymentType: PaymentType;
  employmentStatus: EmploymentStatus;
}

// Maps to the recommended `attendance` table:
//   attendance_id, employee_id, attendance_date, status,
//   check_in_time, check_out_time
export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'On Leave';

export interface AttendanceRecord {
  attendanceId: string;
  employeeId: string;
  employeeName: string; // denormalized for display only
  attendanceDate: string; // ISO date
  status: AttendanceStatus;
  checkInTime: string | null;
  checkOutTime: string | null;
}

// Maps to the recommended `shifts` table:
//   shift_id, employee_id, project_id, shift_type, shift_date,
//   start_time, end_time
export type ShiftType = 'Morning' | 'Evening' | 'Night';

export interface Shift {
  shiftId: string;
  employeeId: string;
  employeeName: string; // denormalized for display only
  project: string;
  shiftType: ShiftType;
  shiftDate: string; // ISO date
  startTime: string;
  endTime: string;
}
