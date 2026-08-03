import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BudgetAnalytics } from '../../../models/analytics.model';
import { KpiCardComponent } from '../shared/kpi-cards.component';
import { BarChartComponent } from '../shared/charts/bar-chart.component';
import { LineChartComponent } from '../shared/charts/line-chart.component';
import { PieChartComponent } from '../shared/charts/pie-chart.component';

@Component({
  selector: 'app-budget-analytics',
  standalone: true,
  imports: [
    CommonModule,
    KpiCardComponent,
    BarChartComponent,
    LineChartComponent,
    PieChartComponent
  ],
  template: `
    <div class="budget-analytics">
      <!-- KPI Cards -->
      <div class="kpi-grid">
        <app-kpi-card 
          title="Total Budget"
          value="{{ data?.totalBudget | currency:'USD':'symbol':'1.0-0' }}"
          icon="attach_money"
          color="primary">
        </app-kpi-card>
        
        <app-kpi-card 
          title="Total Spent"
          value="{{ data?.totalSpent | currency:'USD':'symbol':'1.0-0' }}"
          icon="trending_down"
          color="warning">
        </app-kpi-card>
        
        <app-kpi-card 
          title="Remaining"
          value="{{ data?.remainingBudget | currency:'USD':'symbol':'1.0-0' }}"
          icon="account_balance"
          color="success">
        </app-kpi-card>
        
        <app-kpi-card 
          title="Utilization"
          value="{{ (data?.utilizationPercentage || 0) | number:'1.0-0' }}%"
          icon="pie_chart"
          [color]="(data?.utilizationPercentage || 0) > 80 ? 'danger' : 'success'">
        </app-kpi-card>
      </div>
      
      <!-- Main Charts -->
      <div class="charts-grid">
        <div class="chart-card large">
          <h3>Budget vs Actual</h3>
          <app-bar-chart [data]="budgetVsActualChart"></app-bar-chart>
        </div>
        
        <div class="chart-card medium">
          <h3>Monthly Spending Trend</h3>
          <app-line-chart [data]="monthlyTrendChart"></app-line-chart>
        </div>
        
        <div class="chart-card small">
          <h3>Cost Breakdown</h3>
          <app-pie-chart [data]="costBreakdownChart"></app-pie-chart>
        </div>
      </div>
      
      <!-- Detailed Table -->
      <div class="table-section">
        <h3>Budget Categories</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Planned</th>
              <th>Actual</th>
              <th>Variance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let category of data?.categories">
              <td>{{ category.name }}</td>
              <td>{{ category.planned | currency:'USD':'symbol':'1.0-0' }}</td>
              <td>{{ category.actual | currency:'USD':'symbol':'1.0-0' }}</td>
              <td [class.positive]="category.variance > 0" [class.negative]="category.variance < 0">
                {{ category.variance | currency:'USD':'symbol':'1.0-0' }}
              </td>
              <td>
                <span class="status-badge" [class]="category.status">
                  {{ category.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .budget-analytics {
      padding: 20px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .chart-card.large {
      grid-column: span 2;
    }
    .chart-card.medium {
      grid-column: span 1;
    }
    .chart-card.small {
      grid-column: span 1;
    }
    .chart-card h3 {
      margin: 0 0 20px 0;
      font-size: 16px;
      color: #333;
    }
    .table-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .table-section h3 {
      margin: 0 0 20px 0;
      font-size: 16px;
      color: #333;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th {
      text-align: left;
      padding: 12px;
      background: #f5f5f5;
      font-weight: 600;
      color: #555;
    }
    .data-table td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
    .data-table tr:hover td {
      background: #fafafa;
    }
    .positive {
      color: #4caf50;
    }
    .negative {
      color: #f44336;
    }
    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }
    .status-badge.on-track {
      background: #e8f5e9;
      color: #4caf50;
    }
    .status-badge.over-budget {
      background: #ffebee;
      color: #f44336;
    }
    .status-badge.under-budget {
      background: #e3f2fd;
      color: #2196f3;
    }
    @media (max-width: 768px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
      .chart-card.large {
        grid-column: span 1;
      }
      .chart-card.medium {
        grid-column: span 1;
      }
      .chart-card.small {
        grid-column: span 1;
      }
    }
  `]
})
export class BudgetAnalyticsComponent implements OnInit {
  @Input() data?: BudgetAnalytics;

  budgetVsActualChart: ChartConfiguration['data'] = {
    datasets: [
      { label: 'Planned', data: [], backgroundColor: 'rgba(63, 81, 181, 0.6)' },
      { label: 'Actual', data: [], backgroundColor: 'rgba(255, 152, 0, 0.6)' }
    ],
    labels: []
  };

  monthlyTrendChart: ChartConfiguration['data'] = {
    datasets: [
      { 
        label: 'Monthly Spending', 
        data: [], 
        borderColor: '#3f51b5',
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
        fill: true,
        tension: 0.4
      }
    ],
    labels: []
  };

  costBreakdownChart: ChartConfiguration['data'] = {
    datasets: [
      { 
        data: [],
        backgroundColor: ['#3f51b5', '#ff9800', '#4caf50', '#f44336']
      }
    ],
    labels: []
  };

  ngOnInit() {
    if (this.data) {
      this.updateCharts();
    }
  }

  updateCharts() {
    if (!this.data) return;

    // Budget vs Actual
    this.budgetVsActualChart.datasets[0].data = this.data.categories.map(c => c.planned);
    this.budgetVsActualChart.datasets[1].data = this.data.categories.map(c => c.actual);
    this.budgetVsActualChart.labels = this.data.categories.map(c => c.name);

    // Monthly Trend
    this.monthlyTrendChart.datasets[0].data = this.data.monthlyTrend.map(m => m.value);
    this.monthlyTrendChart.labels = this.data.monthlyTrend.map(m => m.month);

    // Cost Breakdown
    this.costBreakdownChart.datasets[0].data = this.data.categories.map(c => c.actual);
    this.costBreakdownChart.labels = this.data.categories.map(c => c.name);
  }
}