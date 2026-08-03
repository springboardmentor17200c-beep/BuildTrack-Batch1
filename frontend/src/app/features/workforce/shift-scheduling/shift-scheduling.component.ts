import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { Employee, Shift, ShiftType } from '../models/workforce.model';
import { WorkforceDataService } from '../workforce-data.service';

const SHIFT_TIMES: Record<ShiftType, { start: string; end: string }> = {
  Morning: { start: '08:00 AM', end: '04:00 PM' },
  Evening: { start: '02:00 PM', end: '10:00 PM' },
  Night: { start: '10:00 PM', end: '06:00 AM' },
};

@Component({
  selector: 'app-shift-scheduling',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './shift-scheduling.component.html',
  styleUrls: ['./shift-scheduling.component.css'],
})
export class ShiftSchedulingComponent implements OnInit {
  allShifts: Shift[] = [];
  employees: Employee[] = [];
  projectNames: string[] = [];
  shiftTypes: ShiftType[] = ['Morning', 'Evening', 'Night'];
  showForm = false;
  form: FormGroup;

  projectFilter = 'All';
  shiftTypeFilter: ShiftType | 'All' = 'All';

  constructor(private data: WorkforceDataService, private fb: FormBuilder, private location: Location) {
    this.form = this.fb.group({
      employeeId: ['', Validators.required],
      project: ['', Validators.required],
      shiftType: ['', Validators.required],
      shiftDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.data.shifts$.subscribe(s => (this.allShifts = s));
    this.data.employees$.subscribe(e => (this.employees = e.filter(x => x.employmentStatus === 'Active')));
    this.projectNames = this.data.projectNames;
  }

  get filtered(): Shift[] {
    return this.allShifts.filter(s => {
      const matchesProject = this.projectFilter === 'All' || s.project === this.projectFilter;
      const matchesType = this.shiftTypeFilter === 'All' || s.shiftType === this.shiftTypeFilter;
      return matchesProject && matchesType;
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { employeeId, project, shiftType, shiftDate } = this.form.value;
    const employee = this.employees.find(e => e.employeeId === employeeId);
    if (!employee) return;

    const times = SHIFT_TIMES[shiftType as ShiftType];

    const shift: Shift = {
      shiftId: 'SH-' + Math.floor(6000 + Math.random() * 9000),
      employeeId,
      employeeName: employee.fullName,
      project,
      shiftType,
      shiftDate,
      startTime: times.start,
      endTime: times.end,
    };

    this.data.addShift(shift);
    this.form.reset();
    this.showForm = false;
  }

  removeShift(id: string) {
    this.data.deleteShift(id);
  }

  shiftClass(type: ShiftType) {
    return { Morning: 'blue', Evening: 'orange', Night: 'purple' }[type];
  }

  goBack(): void {
    this.location.back();
  }
}
