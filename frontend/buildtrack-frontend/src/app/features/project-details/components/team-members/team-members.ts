import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TeamMember {
  name: string;
  avatar: string;
  role: string;
  phone: string;
  assignedWork: string;
  status: 'active' | 'on-leave' | 'idle';
}

@Component({
  selector: 'app-team-members',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-members.html',
  styleUrl: './team-members.css',
})
export class TeamMembersComponent {
  @Input() members: TeamMember[] = [];

  get activeCount(): number {
    return this.members.filter((member) => member.status === 'active').length;
  }

  get onLeaveCount(): number {
    return this.members.filter((member) => member.status === 'on-leave').length;
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  statusLabel(status: TeamMember['status']): string {
    const labels: Record<TeamMember['status'], string> = {
      active: 'Active',
      'on-leave': 'On Leave',
      idle: 'Idle',
    };

    return labels[status];
  }
}