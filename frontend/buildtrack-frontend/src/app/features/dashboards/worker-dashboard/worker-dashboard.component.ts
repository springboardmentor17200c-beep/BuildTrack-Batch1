import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthDataService } from '../../auth/auth-data.service';
import { AppUser } from '../../auth/models/auth.model';
import { WorkforceDataService } from '../../workforce/workforce-data.service';
import { Employee, Shift } from '../../workforce/models/workforce.model';

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

  constructor(private auth: AuthDataService, private workforce: WorkforceDataService) {}

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
          }
        });
      }
    });
  }
}
