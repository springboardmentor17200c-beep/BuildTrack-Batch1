import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Milestone {
  title: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'delayed';
  completion: number;
}

@Component({
  selector: 'app-milestones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './milestones.html',
  styleUrl: './milestones.css',
})
export class MilestonesComponent {

  @Input() milestones: Milestone[] = [];

  get completedCount(): number {
    return this.milestones.filter(m => m.status === 'completed').length;
  }

  get overallPercent(): number {
    if (this.milestones.length === 0) return 0;
    const sum = this.milestones.reduce((acc, m) => acc + m.completion, 0);
    return Math.round(sum / this.milestones.length);
  }

  statusIcon(status: string): string {
    switch (status) {
      case 'completed':   return '✅';
      case 'in-progress': return '🔄';
      case 'delayed':     return '🚨';
      default:            return '⏳';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'completed':   return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'delayed':     return 'Delayed';
      default:            return 'Upcoming';
    }
  }

  dotClass(status: string): string {
    return `timeline-dot dot-${status}`;
  }

  barClass(status: string): string {
    return `ms-bar-fill bar-${status}`;
  }
}
