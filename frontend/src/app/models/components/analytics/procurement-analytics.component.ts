import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcurementAnalytics } from '../../../models/analytics.model';

@Component({
  selector: 'app-procurement-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="procurement-analytics">
      <h2>Procurement Analytics</h2>
      <div class="placeholder">
        <p>Procurement analytics component - Coming soon</p>
        <p>Total Orders: {{ data?.totalOrders }}</p>
      </div>
    </div>
  `,
  styles: [`
    .procurement-analytics { padding: 20px; }
    .placeholder { background: #f5f5f5; padding: 40px; border-radius: 8px; text-align: center; }
  `]
})
export class ProcurementAnalyticsComponent {
  @Input() data?: ProcurementAnalytics;
}