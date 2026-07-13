import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressAnalytics } from '../../../models/analytics.model';

@Component({
  selector: 'app-progress-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-analytics">
      <h2>Project Progress Analytics</h2>
      <div class="placeholder">
        <p>Progress analytics component - Coming soon</p>
        <p>Overall Progress: {{ data?.overallProgress }}%</p>
      </div>
    </div>
  `,
  styles: [`
    .progress-analytics { padding: 20px; }
    .placeholder { background: #f5f5f5; padding: 40px; border-radius: 8px; text-align: center; }
  `]
})
export class ProgressAnalyticsComponent {
  @Input() data?: ProgressAnalytics;
}