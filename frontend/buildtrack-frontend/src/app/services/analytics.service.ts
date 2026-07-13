import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { DashboardData } from '../models/analytics.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(private mockDataService: MockDataService) {}

  getDashboardData(): Observable<DashboardData> {
    // Simulate API call with delay
    return of(this.mockDataService.getMockDashboardData()).pipe(delay(800));
  }

  exportReport(tab: string, type: 'pdf' | 'excel'): Observable<Blob> {
    // Simulate export
    const content = this.generateExportContent(tab);
    const blob = new Blob([content], { 
      type: type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    return of(blob).pipe(delay(500));
  }

  private generateExportContent(tab: string): string {
    return `Analytics Report - ${tab}\nGenerated: ${new Date().toISOString()}\n\nThis is a simulated export.`;
  }
}