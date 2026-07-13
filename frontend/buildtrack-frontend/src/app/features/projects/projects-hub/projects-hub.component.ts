import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppSidebarComponent } from '../../shared/sidebar/app-sidebar.component';
import { ProjectsDataService } from '../projects-data.service';

interface ProjectOption {
  title: string;
  description: string;
  icon: string;
  route: string;
  accent: string;
  stat: string;
  statLabel: string;
}

@Component({
  selector: 'app-projects-hub',
  standalone: true,
  imports: [CommonModule, RouterModule, AppSidebarComponent],
  templateUrl: './projects-hub.component.html',
  styleUrls: ['./projects-hub.component.css'],
})
export class ProjectsHubComponent implements OnInit {
  totalProjects = 0;
  inProgressCount = 0;
  onHoldCount = 0;
  completedCount = 0;

  options: ProjectOption[] = [
    {
      title: 'All Projects',
      description: 'Browse, search, and create projects across every category and status.',
      icon: 'listing',
      route: 'list',
      accent: 'blue',
      stat: '4',
      statLabel: 'Total projects',
    },
    {
      title: 'Milestone Tracking',
      description: 'Track key checkpoints across all projects and mark them complete.',
      icon: 'milestones',
      route: 'milestones',
      accent: 'purple',
      stat: '8',
      statLabel: 'Milestones tracked',
    },
    {
      title: 'Project Status Dashboard',
      description: 'See status and progress breakdowns across your whole portfolio.',
      icon: 'status',
      route: 'status',
      accent: 'green',
      stat: '2',
      statLabel: 'Active projects',
    },
  ];

  constructor(private router: Router, private data: ProjectsDataService) {}

  ngOnInit(): void {
    this.data.projects$.subscribe(projects => {
      this.totalProjects = projects.length;
      this.inProgressCount = projects.filter(p => p.status === 'In Progress').length;
      this.onHoldCount = projects.filter(p => p.status === 'On Hold').length;
      this.completedCount = projects.filter(p => p.status === 'Completed').length;
    });
  }

  open(route: string) {
    this.router.navigate(['/projects', route]);
  }
}
