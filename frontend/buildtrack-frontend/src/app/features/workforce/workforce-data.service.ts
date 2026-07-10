import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AttendanceRecord, AttendanceStatus, Shift, Worker } from './models/workforce.model';

// NOTE: mock/in-memory data for now. When the FastAPI workforce endpoints
// are ready, replace the arrays below with HttpClient calls, e.g.
//   this.http.get<Worker[]>('/api/workforce/workers')
// Components only depend on the observables exposed here, so no component
// code needs to change when you switch to a real backend.

@Injectable({ providedIn: 'root' })
export class WorkforceDataService {
  private workers: Worker[] = [
    { id: 'W-401', name: 'Vikram Nair', category: 'Supervisors', status: 'Active', project: 'Skyline Residency Tower', contact: '+91 98450 11122', joinDate: '2025-11-02' },
    { id: 'W-402', name: 'Ananya Reddy', category: 'Engineers', status: 'Active', project: 'Riverside Business Park', contact: '+91 98450 22233', joinDate: '2025-09-15' },
    { id: 'W-403', name: 'Suresh Electricals (Contractor)', category: 'Contractors', status: 'Active', project: 'Riverside Business Park', contact: '+91 98450 33344', joinDate: '2026-01-10' },
    { id: 'W-404', name: 'Ramesh Kumar', category: 'Skilled Workers', status: 'On Leave', project: 'Skyline Residency Tower', contact: '+91 98450 44455', joinDate: '2025-08-20' },
    { id: 'W-405', name: 'Ganesh Yadav', category: 'Skilled Workers', status: 'Active', project: 'Skyline Residency Tower', contact: '+91 98450 55566', joinDate: '2025-10-05' },
    { id: 'W-406', name: 'Mohan Das', category: 'Unskilled Workers', status: 'Active', project: 'Riverside Business Park', contact: '+91 98450 66677', joinDate: '2026-02-18' },
    { id: 'W-407', name: 'Lakshmi Priya', category: 'Unskilled Workers', status: 'Active', project: 'Skyline Residency Tower', contact: '+91 98450 77788', joinDate: '2026-03-01' },
    { id: 'W-408', name: 'Dr. Arvind Rao', category: 'Consultants', status: 'Inactive', project: 'Central Office', contact: '+91 98450 88899', joinDate: '2025-06-12' },
    { id: 'W-409', name: 'Priya Menon', category: 'Engineers', status: 'Active', project: 'Skyline Residency Tower', contact: '+91 98450 99900', joinDate: '2025-05-01' },
    { id: 'W-410', name: 'Karthik Iyer', category: 'Engineers', status: 'Active', project: 'Riverside Business Park', contact: '+91 98450 10011', joinDate: '2025-07-22' },
  ];

  private attendance: AttendanceRecord[] = [
    { id: 'AT-5001', workerId: 'W-401', workerName: 'Vikram Nair', date: '2026-07-10', status: 'Present', checkIn: '08:02 AM', checkOut: null },
    { id: 'AT-5002', workerId: 'W-402', workerName: 'Ananya Reddy', date: '2026-07-10', status: 'Present', checkIn: '08:15 AM', checkOut: null },
    { id: 'AT-5003', workerId: 'W-404', workerName: 'Ramesh Kumar', date: '2026-07-10', status: 'On Leave', checkIn: null, checkOut: null },
    { id: 'AT-5004', workerId: 'W-405', workerName: 'Ganesh Yadav', date: '2026-07-10', status: 'Present', checkIn: '07:55 AM', checkOut: null },
    { id: 'AT-5005', workerId: 'W-406', workerName: 'Mohan Das', date: '2026-07-10', status: 'Half Day', checkIn: '08:30 AM', checkOut: '01:00 PM' },
    { id: 'AT-5006', workerId: 'W-407', workerName: 'Lakshmi Priya', date: '2026-07-10', status: 'Absent', checkIn: null, checkOut: null },
    { id: 'AT-5007', workerId: 'W-409', workerName: 'Priya Menon', date: '2026-07-10', status: 'Present', checkIn: '08:00 AM', checkOut: null },
    { id: 'AT-5008', workerId: 'W-410', workerName: 'Karthik Iyer', date: '2026-07-10', status: 'Present', checkIn: '08:10 AM', checkOut: null },
  ];

  private shifts: Shift[] = [
    { id: 'SH-6001', workerId: 'W-401', workerName: 'Vikram Nair', project: 'Skyline Residency Tower', shiftType: 'Morning', date: '2026-07-11', startTime: '08:00 AM', endTime: '04:00 PM' },
    { id: 'SH-6002', workerId: 'W-405', workerName: 'Ganesh Yadav', project: 'Skyline Residency Tower', shiftType: 'Morning', date: '2026-07-11', startTime: '08:00 AM', endTime: '04:00 PM' },
    { id: 'SH-6003', workerId: 'W-402', workerName: 'Ananya Reddy', project: 'Riverside Business Park', shiftType: 'Evening', date: '2026-07-11', startTime: '02:00 PM', endTime: '10:00 PM' },
    { id: 'SH-6004', workerId: 'W-406', workerName: 'Mohan Das', project: 'Riverside Business Park', shiftType: 'Night', date: '2026-07-11', startTime: '10:00 PM', endTime: '06:00 AM' },
  ];

  private workers$$ = new BehaviorSubject<Worker[]>(this.workers);
  private attendance$$ = new BehaviorSubject<AttendanceRecord[]>(this.attendance);
  private shifts$$ = new BehaviorSubject<Shift[]>(this.shifts);

  workers$ = this.workers$$.asObservable();
  attendance$ = this.attendance$$.asObservable();
  shifts$ = this.shifts$$.asObservable();

  get projectNames(): string[] {
    return ['Skyline Residency Tower', 'Riverside Business Park'];
  }

  markAttendance(workerId: string, status: AttendanceRecord['status'], date: string) {
    const worker = this.workers.find(w => w.id === workerId);
    if (!worker) return;

    const existing = this.attendance.find(a => a.workerId === workerId && a.date === date);
    if (existing) {
      this.attendance = this.attendance.map(a =>
        a.id === existing.id
          ? { ...a, status, checkIn: status === 'Present' || status === 'Half Day' ? '08:00 AM' : null }
          : a
      );
    } else {
      this.attendance = [
        {
          id: 'AT-' + Math.floor(5000 + Math.random() * 9000),
          workerId,
          workerName: worker.name,
          date,
          status,
          checkIn: status === 'Present' || status === 'Half Day' ? '08:00 AM' : null,
          checkOut: null,
        },
        ...this.attendance,
      ];
    }
    this.attendance$$.next(this.attendance);
  }

  addShift(shift: Shift) {
    this.shifts = [shift, ...this.shifts];
    this.shifts$$.next(this.shifts);
  }

  deleteShift(id: string) {
    this.shifts = this.shifts.filter(s => s.id !== id);
    this.shifts$$.next(this.shifts);
  }

  addWorker(worker: Worker) {
    this.workers = [worker, ...this.workers];
    this.workers$$.next(this.workers);
  }

  markAllPresent(date: string) {
    const alreadyMarked = new Set(this.attendance.filter(a => a.date === date).map(a => a.workerId));
    const newRecords: AttendanceRecord[] = this.workers
      .filter(w => w.status === 'Active' && !alreadyMarked.has(w.id))
      .map(w => ({
        id: 'AT-' + Math.floor(5000 + Math.random() * 9000) + '-' + w.id,
        workerId: w.id,
        workerName: w.name,
        date,
        status: 'Present' as AttendanceStatus,
        checkIn: '08:00 AM',
        checkOut: null,
      }));

    this.attendance = [
      ...newRecords,
      ...this.attendance.map(a =>
        a.date === date && this.workers.find(w => w.id === a.workerId)?.status === 'Active'
          ? { ...a, status: 'Present' as AttendanceStatus, checkIn: a.checkIn || '08:00 AM' }
          : a
      ),
    ];
    this.attendance$$.next(this.attendance);
  }
}
