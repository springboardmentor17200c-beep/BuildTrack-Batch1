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
    return this.members.filter(m => m.status === 'active').length;
  }

  get onLeaveCount(): number {
    return this.members.filter(m => m.status === 'on-leave').length;
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map(w => w.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'active':   return 'Active';
      case 'on-leave': return 'On Leave';
      case 'idle':     return 'Idle';
      default:         return status;
    }
  }

  statusIcon(status: string): string {
    switch (status) {
      case 'active':   return '🟢';
      case 'on-leave': return '🟡';
      case 'idle':     return '⚪';
      default:         return '⚪';
    }
  }
}
