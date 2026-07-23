import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ProjectHeaderData {
  projectName: string;
  clientName: string;
  location: string;
  status: string;
  startDate: string;
  endDate: string;
  projectManager: string;
  progress: number;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  @Output() editProject = new EventEmitter<void>();
  @Output() closeProject = new EventEmitter<void>();

  @Input() project: ProjectHeaderData = {
    projectName: '',
    clientName: '',
    location: '',
    status: '',
    startDate: '',
    endDate: '',
    projectManager: '',
    progress: 0,
  };

  get managerInitials(): string {
    return this.project.projectManager
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  get statusKey(): string {
    return this.project.status.toLowerCase().replace(/\s+/g, '-');
  }

  get statusClass(): string {
    return `status-badge status-${this.statusKey}`;
  }

  get progressBarWidth(): string {
    return `${this.project.progress}%`;
  }

  get circumference(): number {
    return 2 * Math.PI * 52; // r = 52
  }

  get strokeDashoffset(): number {
    return this.circumference - (this.circumference * this.project.progress / 100);
  }
}
