import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { AttendanceRecord, AttendanceStatus, Employee, Shift } from './models/workforce.model';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'buildtrack_access_token';

/** Shape returned by GET /workforce/employees */
interface ApiEmployee {
  employee_id: number;
  employee_code: string;
  full_name: string;
  contact: string | null;
  category_name: string;
  project_name: string;
  project_id: number;
  joining_date: string;
  experience_years: number | null;
  pay_rate: number;
  payment_type: string;
  employment_status: string;
}

/** Shape returned by GET /workforce/attendance */
interface ApiAttendance {
  attendance_id: number;
  employee_id: number;
  employee_name: string;
  project_id: number;
  attendance_date: string;
  attendance_status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  remarks: string | null;
}

/** Shape returned by GET /workforce/shifts */
interface ApiShift {
  shift_id: number;
  employee_id: number;
  employee_name: string;
  project_id: number;
  project_name: string;
  shift_type: string;
  shift_date: string;
  start_time: string;
  end_time: string;
}

function mapEmployee(a: ApiEmployee): Employee {
  return {
    employeeId: `E-${a.employee_id}`,
    employeeCode: a.employee_code,
    fullName: a.full_name,
    workforceCategory: a.category_name as any,
    project: a.project_name,
    contact: a.contact ?? '',
    joiningDate: a.joining_date,
    experienceYears: a.experience_years ?? 0,
    payRate: a.pay_rate,
    paymentType: a.payment_type as any,
    employmentStatus: a.employment_status as any,
  };
}

function mapAttendance(a: ApiAttendance): AttendanceRecord {
  return {
    attendanceId: `A-${a.attendance_id}`,
    employeeId: `E-${a.employee_id}`,
    employeeName: a.employee_name,
    attendanceDate: a.attendance_date,
    status: a.attendance_status as AttendanceStatus,
    checkInTime: a.check_in_time
      ? new Date(a.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : null,
    checkOutTime: a.check_out_time
      ? new Date(a.check_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : null,
  };
}

function mapShift(s: ApiShift): Shift {
  return {
    shiftId: `SH-${s.shift_id}`,
    employeeId: `E-${s.employee_id}`,
    employeeName: s.employee_name,
    project: s.project_name,
    shiftType: s.shift_type as any,
    shiftDate: s.shift_date,
    startTime: s.start_time,
    endTime: s.end_time,
  };
}

@Injectable({ providedIn: 'root' })
export class WorkforceDataService {
  private readonly base = `${environment.apiUrl}/workforce`;

  private employees$$ = new BehaviorSubject<Employee[]>([]);
  private attendance$$ = new BehaviorSubject<AttendanceRecord[]>([]);
  private shifts$$ = new BehaviorSubject<Shift[]>([]);

  employees$ = this.employees$$.asObservable();
  attendance$ = this.attendance$$.asObservable();
  shifts$ = this.shifts$$.asObservable();

  constructor(private http: HttpClient) {}


  private headers(): HttpHeaders {
    const token = localStorage.getItem(TOKEN_KEY) ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private handleError<T>(fallback: T) {
    return (err: any): Observable<T> => {
      console.error('[WorkforceDataService]', err);
      return of(fallback);
    };
  }

  // ── Initial data load ──────────────────────────────
  loadAll() {
    this.loadEmployees();
    this.loadShifts();
    // Load today's attendance by default
    const today = new Date().toISOString().split('T')[0];
    this.loadAttendance(today);
  }

  loadEmployees() {
    this.http.get<ApiEmployee[]>(`${this.base}/employees`, { headers: this.headers() })
      .pipe(catchError(this.handleError([])))
      .subscribe(data => this.employees$$.next(data.map(mapEmployee)));
  }

  loadAttendance(date?: string) {
    let params = new HttpParams();
    if (date) params = params.set('attendance_date', date);
    this.http.get<ApiAttendance[]>(`${this.base}/attendance`, { headers: this.headers(), params })
      .pipe(catchError(this.handleError([])))
      .subscribe(data => this.attendance$$.next(data.map(mapAttendance)));
  }

  loadShifts() {
    this.http.get<ApiShift[]>(`${this.base}/shifts`, { headers: this.headers() })
      .pipe(catchError(this.handleError([])))
      .subscribe(data => this.shifts$$.next(data.map(mapShift)));
  }

  get projectNames(): string[] {
    const seen = new Set<string>();
    this.employees$$.value.forEach(e => seen.add(e.project));
    return Array.from(seen);
  }

  // ── Employee CRUD ─────────────────────────────────
  addEmployee(employee: Employee) {
    // Optimistic UI update
    const current = this.employees$$.value;
    this.employees$$.next([employee, ...current]);

    // Persist to backend
    const payload = {
      full_name: employee.fullName,
      category_name: employee.workforceCategory,
      project_name: employee.project,
      employee_code: employee.employeeCode,
      joining_date: employee.joiningDate,
      experience_years: employee.experienceYears || 0,
      pay_rate: employee.payRate || 0,
      payment_type: employee.paymentType || 'Hourly',
      employment_status: employee.employmentStatus || 'Active'
    };

    this.http.post<ApiEmployee>(`${this.base}/employees`, payload, { headers: this.headers() })
      .pipe(catchError(this.handleError(null)))
      .subscribe(result => {
        if (result) this.loadEmployees(); // Refresh the list with actual DB data and IDs
      });
  }

  // ── Attendance ────────────────────────────────────
  markAttendance(employeeId: string, status: AttendanceStatus, date: string) {
    const numericId = parseInt(employeeId.replace('E-', ''), 10);
    const emp = this.employees$$.value.find(e => e.employeeId === employeeId);
    if (!emp) return;

    // Optimistic UI update
    const existing = this.attendance$$.value.find(
      a => a.employeeId === employeeId && a.attendanceDate === date
    );
    if (existing) {
      this.attendance$$.next(
        this.attendance$$.value.map(a =>
          a.attendanceId === existing.attendanceId
            ? { ...a, status, checkInTime: (status === 'Present' || status === 'Half Day') ? '08:00 AM' : null }
            : a
        )
      );
    } else {
      this.attendance$$.next([
        {
          attendanceId: `A-${Date.now()}`,
          employeeId,
          employeeName: emp.fullName,
          attendanceDate: date,
          status,
          checkInTime: (status === 'Present' || status === 'Half Day') ? '08:00 AM' : null,
          checkOutTime: null,
        },
        ...this.attendance$$.value,
      ]);
    }

    // Persist to backend (upsert)
    const projectNumericId = 1; // fallback; real implementation should resolve project_id from emp.project
    const payload = {
      employee_id: numericId,
      project_id: projectNumericId,
      attendance_date: date,
      attendance_status: status,
      check_in_time: (status === 'Present' || status === 'Half Day')
        ? `${date}T08:00:00` : null,
    };
    this.http.post<ApiAttendance>(`${this.base}/attendance`, payload, { headers: this.headers() })
      .pipe(catchError(this.handleError(null)))
      .subscribe(result => {
        if (result) this.loadAttendance(date); // refresh from DB
      });
  }

  markAllPresent(date: string) {
    const params = new HttpParams().set('attendance_date', date);
    // Optimistic UI update
    const alreadyMarked = new Set(
      this.attendance$$.value.filter(a => a.attendanceDate === date).map(a => a.employeeId)
    );
    const newRecords: AttendanceRecord[] = this.employees$$.value
      .filter(e => e.employmentStatus === 'Active' && !alreadyMarked.has(e.employeeId))
      .map(e => ({
        attendanceId: `A-${Date.now()}-${e.employeeId}`,
        employeeId: e.employeeId,
        employeeName: e.fullName,
        attendanceDate: date,
        status: 'Present' as AttendanceStatus,
        checkInTime: '08:00 AM',
        checkOutTime: null,
      }));

    this.attendance$$.next([
      ...newRecords,
      ...this.attendance$$.value.map(a =>
        a.attendanceDate === date &&
        this.employees$$.value.find(e => e.employeeId === a.employeeId)?.employmentStatus === 'Active'
          ? { ...a, status: 'Present' as AttendanceStatus, checkInTime: a.checkInTime || '08:00 AM' }
          : a
      ),
    ]);

    // Persist
    this.http.post<ApiAttendance[]>(`${this.base}/attendance/bulk`, null, { headers: this.headers(), params })
      .pipe(catchError(this.handleError([])))
      .subscribe(() => this.loadAttendance(date));
  }

  // ── Shifts ────────────────────────────────────────
  addShift(shift: Shift) {
    const numericEmpId = parseInt(shift.employeeId.replace('E-', ''), 10);
    const payload = {
      employee_id: numericEmpId,
      project_id: 1, // fallback
      shift_type: shift.shiftType,
      shift_date: shift.shiftDate,
      start_time: shift.startTime,
      end_time: shift.endTime,
    };
    // Optimistic add
    this.shifts$$.next([shift, ...this.shifts$$.value]);

    this.http.post<ApiShift>(`${this.base}/shifts`, payload, { headers: this.headers() })
      .pipe(catchError(this.handleError(null)))
      .subscribe(() => this.loadShifts());
  }

  deleteShift(id: string) {
    const numericId = parseInt(id.replace('SH-', ''), 10);
    // Optimistic remove
    this.shifts$$.next(this.shifts$$.value.filter(s => s.shiftId !== id));

    this.http.delete(`${this.base}/shifts/${numericId}`, { headers: this.headers() })
      .pipe(catchError(this.handleError(null)))
      .subscribe(() => this.loadShifts());
  }
}
