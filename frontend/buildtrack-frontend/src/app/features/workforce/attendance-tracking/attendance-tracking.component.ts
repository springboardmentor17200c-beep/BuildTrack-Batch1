import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AttendanceRecord, AttendanceStatus, Worker } from '../models/workforce.model';
import { WorkforceDataService } from '../workforce-data.service';

@Component({
  selector: 'app-attendance-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './attendance-tracking.component.html',
  styleUrls: ['./attendance-tracking.component.css'],
})
export class AttendanceTrackingComponent implements OnInit {
  allWorkers: Worker[] = [];
  attendance: AttendanceRecord[] = [];
  selectedDate = new Date().toISOString().slice(0, 10);
  search = '';

  statusOptions: AttendanceStatus[] = ['Present', 'Absent', 'Half Day', 'On Leave'];

  presentCount = 0;
  absentCount = 0;
  halfDayCount = 0;
  onLeaveCount = 0;

  constructor(private data: WorkforceDataService) {}

  ngOnInit(): void {
    this.data.workers$.subscribe(w => (this.allWorkers = w.filter(x => x.status !== 'Inactive')));
    this.data.attendance$.subscribe(a => {
      this.attendance = a;
      this.computeStats();
    });
  }

  get workers(): Worker[] {
    if (!this.search) return this.allWorkers;
    return this.allWorkers.filter(w => w.name.toLowerCase().includes(this.search.toLowerCase()));
  }

  private computeStats() {
    const dayRecords = this.attendance.filter(a => a.date === this.selectedDate);
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

  recordFor(workerId: string): AttendanceRecord | undefined {
    return this.attendance.find(a => a.workerId === workerId && a.date === this.selectedDate);
  }

  setStatus(workerId: string, status: AttendanceStatus) {
    this.data.markAttendance(workerId, status, this.selectedDate);
  }

  markAllPresent() {
    this.data.markAllPresent(this.selectedDate);
  }

  statusClass(status: AttendanceStatus | undefined) {
    if (!status) return 'gray';
    return { Present: 'green', Absent: 'red', 'Half Day': 'orange', 'On Leave': 'blue' }[status];
  }
}
