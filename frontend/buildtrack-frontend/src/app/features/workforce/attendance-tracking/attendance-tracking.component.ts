import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { AttendanceRecord, AttendanceStatus, Employee } from '../models/workforce.model';
import { WorkforceDataService } from '../workforce-data.service';
import { } from '../../shared/sidebar/app-sidebar.component';


@Component({
  selector: 'app-attendance-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './attendance-tracking.component.html',
  styleUrls: ['./attendance-tracking.component.css'],
})
export class AttendanceTrackingComponent implements OnInit {
  allEmployees: Employee[] = [];
  attendance: AttendanceRecord[] = [];
  selectedDate = new Date().toISOString().slice(0, 10);
  search = '';

  statusOptions: AttendanceStatus[] = ['Present', 'Absent', 'Half Day', 'On Leave'];

  presentCount = 0;
  absentCount = 0;
  halfDayCount = 0;
  onLeaveCount = 0;

  constructor(private data: WorkforceDataService, private location: Location) {}

  ngOnInit(): void {
    this.data.employees$.subscribe(e => (this.allEmployees = e.filter(x => x.employmentStatus !== 'Terminated')));
    this.data.attendance$.subscribe(a => {
      this.attendance = a;
      this.computeStats();
    });
  }

  get employees(): Employee[] {
    if (!this.search) return this.allEmployees;
    return this.allEmployees.filter(e => e.fullName.toLowerCase().includes(this.search.toLowerCase()));
  }

  private computeStats() {
    const dayRecords = this.attendance.filter(a => a.attendanceDate === this.selectedDate);
    this.presentCount = dayRecords.filter(a => a.status === 'Present').length;
    this.absentCount = dayRecords.filter(a => a.status === 'Absent').length;
    this.halfDayCount = dayRecords.filter(a => a.status === 'Half Day').length;
    this.onLeaveCount = dayRecords.filter(a => a.status === 'On Leave').length;
  }

  onDateChange() {
    this.computeStats();
  }

  shiftDate(days: number) {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + days);
    this.selectedDate = d.toISOString().slice(0, 10);
    this.computeStats();
  }

  recordFor(employeeId: string): AttendanceRecord | undefined {
    return this.attendance.find(a => a.employeeId === employeeId && a.attendanceDate === this.selectedDate);
  }

  setStatus(employeeId: string, status: AttendanceStatus) {
    this.data.markAttendance(employeeId, status, this.selectedDate);
  }

  markAllPresent() {
    this.data.markAllPresent(this.selectedDate);
  }

  statusClass(status: AttendanceStatus | undefined) {
    if (!status) return 'gray';
    return { Present: 'green', Absent: 'red', 'Half Day': 'orange', 'On Leave': 'blue' }[status];
  }

  goBack(): void {
    this.location.back();
  }
}
