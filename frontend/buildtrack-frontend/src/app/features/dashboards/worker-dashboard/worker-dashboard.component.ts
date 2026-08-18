import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthDataService } from '../../auth/auth-data.service';
import { AppUser } from '../../auth/models/auth.model';
import { Project } from '../../projects/models/projects.model';

@Component({
  selector: 'app-worker-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './worker-dashboard.component.html',
  styleUrls: ['./worker-dashboard.component.css']
})
export class WorkerDashboardComponent implements OnInit {
  currentUser: AppUser | null = null;
  assignedProjects: Project[] = [];
  todayTasks = 5;
  completedTasks = 2;
  attendancePercent = 95;

  constructor(private auth: AuthDataService) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => {
      this.currentUser = u;
    });
  }

  statusClass(status: string) {
    return { Planning: 'gray', 'In Progress': 'blue', 'On Hold': 'orange', Completed: 'green' }[status] || 'gray';
  }
}
