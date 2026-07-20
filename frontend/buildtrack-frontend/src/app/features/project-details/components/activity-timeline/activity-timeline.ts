import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ProjectActivity {
  time: string;
  user: string;
  action: string;
  description: string;
}

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-timeline.html',
  styleUrl: './activity-timeline.css',
})
export class ActivityTimelineComponent {
  @Input() activities: ProjectActivity[] = [];

  initials(user: string): string {
    return user
      .trim()
      .split(/\s+/)
      .map((name) => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}
