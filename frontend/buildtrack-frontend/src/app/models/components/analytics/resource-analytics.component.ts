import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceAnalytics } from '../../../models/analytics.model';

@Component({
  selector: 'app-resource-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="resource-analytics">
      <h2>Resource Analytics</h2>
      <div class="placeholder">
        <p>Resource analytics component - Coming soon</p>
        <p>Total Resources: {{ data?.totalResources }}</p>
      </div>
    </div>
  `,
  styles: [`
    .resource-analytics { padding: 20px; }
    .placeholder { background: #f5f5f5; padding: 40px; border-radius: 8px; text-align: center; }
  `]
})
export class ResourceAnalyticsComponent {
  @Input() data?: ResourceAnalytics;
}