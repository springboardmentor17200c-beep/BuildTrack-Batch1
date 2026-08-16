import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AttendanceRecord, AttendanceStatus, Employee, Shift } from './models/workforce.model';

@Injectable({ providedIn: 'root' })
export class WorkforceDataService {
  private apiUrl = environment.apiUrl;

  private employees: Employee[] = [];
  private attendance: AttendanceRecord[] = [];
  private shifts: Shift[] = [];

  private employees$$ = new BehaviorSubject<Employee[]>(this.employees);
  private attendance$$ = new BehaviorSubject<AttendanceRecord[]>(this.attendance);
  private shifts$$ = new BehaviorSubject<Shift[]>(this.shifts);

  employees$ = this.employees$$.asObservable();
  attendance$ = this.attendance$$.asObservable();
  shifts$ = this.shifts$$.asObservable();

  get projectNames(): string[] {
    return ['Skyline Residency Tower', 'Riverside Business Park'];
  }

  constructor(private http: HttpClient) {
    this.fetchWorkforceData();
  }

  private fetchWorkforceData() {
    forkJoin({
      employees: this.http.get<Employee[]>(`${this.apiUrl}/workforce/employees`),
      attendance: this.http.get<AttendanceRecord[]>(`${this.apiUrl}/workforce/attendance`),
      shifts: this.http.get<Shift[]>(`${this.apiUrl}/workforce/shifts`)
    }).pipe(
      tap(data => {
        this.employees = data.employees;
        this.attendance = data.attendance;
        this.shifts = data.shifts;
        this.employees$$.next(this.employees);
        this.attendance$$.next(this.attendance);
        this.shifts$$.next(this.shifts);
      })
    ).subscribe();
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
