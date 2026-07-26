import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AttendanceRecord, AttendanceStatus, Employee, Shift } from './models/workforce.model';

// NOTE: mock/in-memory data for now. When the FastAPI endpoints are ready,
// replace the arrays below with HttpClient calls against:
//   GET  /api/workforce/employees
//   POST /api/workforce/employees
//   GET  /api/workforce/attendance?date=...
//   POST /api/workforce/attendance
//   GET  /api/workforce/shifts
//   POST /api/workforce/shifts
//   DELETE /api/workforce/shifts/:id
// Field names here match employee_profiles (confirmed real table) and the
// attendance/shifts tables as recommended to the DB team — see the note
// at the top of workforce.model.ts.

@Injectable({ providedIn: 'root' })
export class WorkforceDataService {
  private employees: Employee[] = [
    { employeeId: 'E-401', employeeCode: 'EMP-1001', fullName: 'Vikram Nair', workforceCategory: 'Supervisors', project: 'Skyline Residency Tower', contact: '+91 98450 11122', joiningDate: '2025-11-02', experienceYears: 8.5, payRate: 1200, paymentType: 'Daily', employmentStatus: 'Active' },
    { employeeId: 'E-402', employeeCode: 'EMP-1002', fullName: 'Ananya Reddy', workforceCategory: 'Engineers', project: 'Riverside Business Park', contact: '+91 98450 22233', joiningDate: '2025-09-15', experienceYears: 4.0, payRate: 65000, paymentType: 'Monthly', employmentStatus: 'Active' },
    { employeeId: 'E-403', employeeCode: 'EMP-1003', fullName: 'Suresh Electricals', workforceCategory: 'Contractors', project: 'Riverside Business Park', contact: '+91 98450 33344', joiningDate: '2026-01-10', experienceYears: 12.0, payRate: 2500, paymentType: 'Daily', employmentStatus: 'Active' },
    { employeeId: 'E-404', employeeCode: 'EMP-1004', fullName: 'Ramesh Kumar', workforceCategory: 'Skilled Workers', project: 'Skyline Residency Tower', contact: '+91 98450 44455', joiningDate: '2025-08-20', experienceYears: 6.5, payRate: 900, paymentType: 'Daily', employmentStatus: 'On Leave' },
    { employeeId: 'E-405', employeeCode: 'EMP-1005', fullName: 'Ganesh Yadav', workforceCategory: 'Skilled Workers', project: 'Skyline Residency Tower', contact: '+91 98450 55566', joiningDate: '2025-10-05', experienceYears: 5.0, payRate: 850, paymentType: 'Daily', employmentStatus: 'Active' },
    { employeeId: 'E-406', employeeCode: 'EMP-1006', fullName: 'Mohan Das', workforceCategory: 'Unskilled Workers', project: 'Riverside Business Park', contact: '+91 98450 66677', joiningDate: '2026-02-18', experienceYears: 1.5, payRate: 550, paymentType: 'Daily', employmentStatus: 'Active' },
    { employeeId: 'E-407', employeeCode: 'EMP-1007', fullName: 'Lakshmi Priya', workforceCategory: 'Unskilled Workers', project: 'Skyline Residency Tower', contact: '+91 98450 77788', joiningDate: '2026-03-01', experienceYears: 0.8, payRate: 550, paymentType: 'Daily', employmentStatus: 'Active' },
    { employeeId: 'E-408', employeeCode: 'EMP-1008', fullName: 'Dr. Arvind Rao', workforceCategory: 'Consultants', project: 'Central Office', contact: '+91 98450 88899', joiningDate: '2025-06-12', experienceYears: 20.0, payRate: 8000, paymentType: 'Daily', employmentStatus: 'Terminated' },
    { employeeId: 'E-409', employeeCode: 'EMP-1009', fullName: 'Priya Menon', workforceCategory: 'Engineers', project: 'Skyline Residency Tower', contact: '+91 98450 99900', joiningDate: '2025-05-01', experienceYears: 9.0, payRate: 95000, paymentType: 'Monthly', employmentStatus: 'Active' },
    { employeeId: 'E-410', employeeCode: 'EMP-1010', fullName: 'Karthik Iyer', workforceCategory: 'Engineers', project: 'Riverside Business Park', contact: '+91 98450 10011', joiningDate: '2025-07-22', experienceYears: 7.0, payRate: 88000, paymentType: 'Monthly', employmentStatus: 'Active' },
  ];

  private attendance: AttendanceRecord[] = [
    { attendanceId: 'A-5001', employeeId: 'E-401', employeeName: 'Vikram Nair', attendanceDate: '2026-07-17', status: 'Present', checkInTime: '08:02 AM', checkOutTime: null },
    { attendanceId: 'A-5002', employeeId: 'E-402', employeeName: 'Ananya Reddy', attendanceDate: '2026-07-17', status: 'Present', checkInTime: '08:15 AM', checkOutTime: null },
    { attendanceId: 'A-5003', employeeId: 'E-404', employeeName: 'Ramesh Kumar', attendanceDate: '2026-07-17', status: 'On Leave', checkInTime: null, checkOutTime: null },
    { attendanceId: 'A-5004', employeeId: 'E-405', employeeName: 'Ganesh Yadav', attendanceDate: '2026-07-17', status: 'Present', checkInTime: '07:55 AM', checkOutTime: null },
    { attendanceId: 'A-5005', employeeId: 'E-406', employeeName: 'Mohan Das', attendanceDate: '2026-07-17', status: 'Half Day', checkInTime: '08:30 AM', checkOutTime: '01:00 PM' },
    { attendanceId: 'A-5006', employeeId: 'E-407', employeeName: 'Lakshmi Priya', attendanceDate: '2026-07-17', status: 'Absent', checkInTime: null, checkOutTime: null },
    { attendanceId: 'A-5007', employeeId: 'E-409', employeeName: 'Priya Menon', attendanceDate: '2026-07-17', status: 'Present', checkInTime: '08:00 AM', checkOutTime: null },
    { attendanceId: 'A-5008', employeeId: 'E-410', employeeName: 'Karthik Iyer', attendanceDate: '2026-07-17', status: 'Present', checkInTime: '08:10 AM', checkOutTime: null },
  ];

  private shifts: Shift[] = [
    { shiftId: 'SH-6001', employeeId: 'E-401', employeeName: 'Vikram Nair', project: 'Skyline Residency Tower', shiftType: 'Morning', shiftDate: '2026-07-18', startTime: '08:00 AM', endTime: '04:00 PM' },
    { shiftId: 'SH-6002', employeeId: 'E-405', employeeName: 'Ganesh Yadav', project: 'Skyline Residency Tower', shiftType: 'Morning', shiftDate: '2026-07-18', startTime: '08:00 AM', endTime: '04:00 PM' },
    { shiftId: 'SH-6003', employeeId: 'E-402', employeeName: 'Ananya Reddy', project: 'Riverside Business Park', shiftType: 'Evening', shiftDate: '2026-07-18', startTime: '02:00 PM', endTime: '10:00 PM' },
    { shiftId: 'SH-6004', employeeId: 'E-406', employeeName: 'Mohan Das', project: 'Riverside Business Park', shiftType: 'Night', shiftDate: '2026-07-18', startTime: '10:00 PM', endTime: '06:00 AM' },
  ];

  private employees$$ = new BehaviorSubject<Employee[]>(this.employees);
  private attendance$$ = new BehaviorSubject<AttendanceRecord[]>(this.attendance);
  private shifts$$ = new BehaviorSubject<Shift[]>(this.shifts);

  employees$ = this.employees$$.asObservable();
  attendance$ = this.attendance$$.asObservable();
  shifts$ = this.shifts$$.asObservable();

  get projectNames(): string[] {
    return ['Skyline Residency Tower', 'Riverside Business Park'];
  }

  addEmployee(employee: Employee) {
    this.employees = [employee, ...this.employees];
    this.employees$$.next(this.employees);
  }

  markAttendance(employeeId: string, status: AttendanceStatus, date: string) {
    const employee = this.employees.find(e => e.employeeId === employeeId);
    if (!employee) return;

    const existing = this.attendance.find(a => a.employeeId === employeeId && a.attendanceDate === date);
    if (existing) {
      this.attendance = this.attendance.map(a =>
        a.attendanceId === existing.attendanceId
          ? { ...a, status, checkInTime: status === 'Present' || status === 'Half Day' ? '08:00 AM' : null }
          : a
      );
    } else {
      this.attendance = [
        {
          attendanceId: 'A-' + Math.floor(5000 + Math.random() * 9000),
          employeeId,
          employeeName: employee.fullName,
          attendanceDate: date,
          status,
          checkInTime: status === 'Present' || status === 'Half Day' ? '08:00 AM' : null,
          checkOutTime: null,
        },
        ...this.attendance,
      ];
    }
    this.attendance$$.next(this.attendance);
  }

  markAllPresent(date: string) {
    const alreadyMarked = new Set(this.attendance.filter(a => a.attendanceDate === date).map(a => a.employeeId));
    const newRecords: AttendanceRecord[] = this.employees
      .filter(e => e.employmentStatus === 'Active' && !alreadyMarked.has(e.employeeId))
      .map(e => ({
        attendanceId: 'A-' + Math.floor(5000 + Math.random() * 9000) + '-' + e.employeeId,
        employeeId: e.employeeId,
        employeeName: e.fullName,
        attendanceDate: date,
        status: 'Present' as AttendanceStatus,
        checkInTime: '08:00 AM',
        checkOutTime: null,
      }));

    this.attendance = [
      ...newRecords,
      ...this.attendance.map(a =>
        a.attendanceDate === date && this.employees.find(e => e.employeeId === a.employeeId)?.employmentStatus === 'Active'
          ? { ...a, status: 'Present' as AttendanceStatus, checkInTime: a.checkInTime || '08:00 AM' }
          : a
      ),
    ];
    this.attendance$$.next(this.attendance);
  }

  addShift(shift: Shift) {
    this.shifts = [shift, ...this.shifts];
    this.shifts$$.next(this.shifts);
  }

  deleteShift(id: string) {
    this.shifts = this.shifts.filter(s => s.shiftId !== id);
    this.shifts$$.next(this.shifts);
  }
}
