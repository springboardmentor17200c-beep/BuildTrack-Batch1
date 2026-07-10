import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { WorkforceDataService } from '../workforce-data.service';

interface WorkforceOption {
  title: string;
  description: string;
  icon: string;
  route: string;
  accent: string;
  stat: string;
  statLabel: string;
}

@Component({
  selector: 'app-workforce-hub',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './workforce-hub.component.html',
  styleUrls: ['./workforce-hub.component.css'],
})
export class WorkforceHubComponent implements OnInit {
  totalWorkers = 0;
  activeCount = 0;
  onLeaveCount = 0;
  presentTodayCount = 0;

  options: WorkforceOption[] = [
    {
      title: 'Worker Management Dashboard',
      description: 'Overview of every worker on your sites, grouped by role, with status at a glance.',
      icon: 'dashboard',
      route: 'dashboard',
      accent: 'blue',
      stat: '10',
      statLabel: 'Registered workers',
    },
    {
      title: 'Attendance Tracking',
      description: "Mark and review daily attendance, check-in and check-out times for every worker.",
      icon: 'attendance',
      route: 'attendance',
      accent: 'orange',
      stat: '6',
      statLabel: 'Present today',
    },
    {
      title: 'Shift Scheduling',
      description: 'Plan and assign morning, evening and night shifts across projects.',
      icon: 'shifts',
      route: 'shifts',
      accent: 'purple',
      stat: '4',
      statLabel: 'Shifts scheduled',
    },
  ];

  constructor(private router: Router, private data: WorkforceDataService) {}

  ngOnInit(): void {
    this.data.workers$.subscribe(workers => {
      this.totalWorkers = workers.length;
      this.activeCount = workers.filter(w => w.status === 'Active').length;
      this.onLeaveCount = workers.filter(w => w.status === 'On Leave').length;
    });
    this.data.attendance$.subscribe(records => {
      this.presentTodayCount = records.filter(r => r.status === 'Present').length;
    });
  }

  open(route: string) {
    this.router.navigate(['/workforce', route]);
  }
}
