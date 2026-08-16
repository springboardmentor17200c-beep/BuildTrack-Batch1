import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Expense, ExpenseCategory, ProjectBudget } from '../models/analytics.model';
import { AnalyticsDataService } from '../analytics-data.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-budget-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './budget-analytics.component.html',
  styleUrls: ['./budget-analytics.component.css'],
})
export class BudgetAnalyticsComponent implements OnInit {
  budgets: ProjectBudget[] = [];
  categoryBreakdown: { category: ExpenseCategory; amount: number; percent: number }[] = [];

  totalApproved = 0;
  totalSpent = 0;
  totalRemaining = 0;
  usedPercent = 0;

  // Chart configuration
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'right' },
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [ { data: [] } ]
  };
  public pieChartType: ChartType = 'pie';

  constructor(private data: AnalyticsDataService, private location: Location) {}

  ngOnInit(): void {
    this.data.budgets$.subscribe(b => (this.budgets = b));
    this.data.expenses$.subscribe(() => this.computeStats());
    this.computeStats();
  }

  private computeStats() {
    this.totalApproved = this.data.totalApprovedBudget();
    this.totalSpent = this.data.totalSpent();
    this.totalRemaining = Math.max(0, this.totalApproved - this.totalSpent);
    this.usedPercent = this.totalApproved ? Math.round((this.totalSpent / this.totalApproved) * 100) : 0;

    const byCategory = this.data.expensesByCategory();
    const max = byCategory.length ? byCategory[0].amount : 1;
    this.categoryBreakdown = byCategory.map(c => ({ ...c, percent: Math.round((c.amount / max) * 100) }));

    // Update chart
    this.pieChartData = {
      labels: byCategory.map(c => c.category),
      datasets: [{
        data: byCategory.map(c => c.amount),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b']
      }]
    };
  }

  spentFor(project: string): number {
    return this.data.spentForProject(project);
  }

  usedPercentFor(budget: ProjectBudget): number {
    const spent = this.spentFor(budget.project);
    return budget.approvedBudget ? Math.min(100, Math.round((spent / budget.approvedBudget) * 100)) : 0;
  }

  statusClass(status: ProjectBudget['budgetStatus']) {
    return { Planned: 'orange', Approved: 'blue', Closed: 'green' }[status];
  }

  goBack(): void {
    this.location.back();
  }
}
