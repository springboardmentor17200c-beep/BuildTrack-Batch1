import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthDataService } from '../../auth/auth-data.service';
import { AppUser } from '../../auth/models/auth.model';
import { WorkforceDataService } from '../../workforce/workforce-data.service';
import { Employee, Shift, AttendanceRecord } from '../../workforce/models/workforce.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-worker-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './worker-dashboard.component.html',
  styleUrls: ['./worker-dashboard.component.css']
})
export class WorkerDashboardComponent implements OnInit {
  currentUser: AppUser | null = null;
  myProfile: Employee | null = null;
  myShifts: Shift[] = [];
  myAttendance: AttendanceRecord[] = [];

  calendarDays: { date: Date, record: AttendanceRecord | null }[] = [];
  currentMonthName = '';

  constructor(
    private auth: AuthDataService, 
    private workforce: WorkforceDataService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => {
      this.currentUser = u;
      
      if (u) {
        // Find employee profile by username matching employeeCode
        this.workforce.employees$.subscribe(emps => {
          this.myProfile = emps.find(e => e.employeeCode === u.username) || null;
          
          if (this.myProfile) {
            // Find shifts where the worker is assigned
            this.workforce.shifts$.subscribe(shifts => {
              this.myShifts = shifts.filter(s => s.employeeId === this.myProfile!.employeeId);
            });

            // Fetch all attendance directly to avoid overwriting global state
            const headers = { Authorization: `Bearer ${localStorage.getItem('buildtrack_access_token')}` };
            this.http.get<any[]>(`${environment.apiUrl}/workforce/attendance`, { headers }).subscribe(data => {
              // Map ApiAttendance to AttendanceRecord
              const allAttendance = data.map(a => ({
                attendanceId: `A-${a.attendance_id}`,
                employeeId: `E-${a.employee_id}`,
                employeeName: a.employee_name,
                attendanceDate: a.attendance_date,
                status: a.status as any,
                checkInTime: a.check_in_time,
                checkOutTime: a.check_out_time
              }));
              this.myAttendance = allAttendance.filter(a => a.employeeId === this.myProfile!.employeeId);
              this.generateCalendar();
            });
          }
        });
      }
    });
  }

  generateCalendar() {
    const today = new Date();
    this.currentMonthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    this.calendarDays = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      // Format as YYYY-MM-DD
      const isoDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      
      const record = this.myAttendance.find(a => a.attendanceDate === isoDate) || null;
      this.calendarDays.push({ date: d, record });
    }
  }

  getAttendanceClass(status: string) {
    if (status === 'Present') return 'bt-status-present';
    if (status === 'Absent') return 'bt-status-absent';
    if (status === 'Leave' || status === 'On Leave') return 'bt-status-leave';
    if (status === 'Half Day') return 'bt-status-half';
    return '';
  }
}
