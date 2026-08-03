import { Component } from '@angular/core';
import { AnalyticsDashboardComponent } from './models/components/analytics/analytics-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,  // Make it standalone
  imports: [AnalyticsDashboardComponent],  // Import components here
  template: `
    <div class="app-container">
      <app-analytics-dashboard></app-analytics-dashboard>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f5f7fa;
    }
  `]
})
export class AppComponent {
  title = 'BuildTrack Analytics';
}