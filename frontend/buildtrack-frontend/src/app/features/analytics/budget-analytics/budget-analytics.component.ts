import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Expense, ExpenseCategory, ProjectBudget } from '../models/analytics.model';
import { AnalyticsDataService } from '../analytics-data.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-budget-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './budget-analytics.component.html',
  styleUrls: ['./budget-analytics.component.css'],
})
export class BudgetAnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;
  @ViewChild('projectChart') projectChartRef!: ElementRef;

  categoryChart: any;
  projectChart: any;

  budgets: ProjectBudget[] = [];
  categoryBreakdown: { category: ExpenseCategory; amount: number; percent: number }[] = [];

  totalApproved = 0;
  totalSpent = 0;
  totalRemaining = 0;
  usedPercent = 0;

  constructor(private data: AnalyticsDataService, private location: Location) {}

  ngOnInit(): void {
    this.data.budgets$.subscribe(b => {
      this.budgets = b;
      this.updateCharts();
    });
    this.data.expenses$.subscribe(() => {
      this.computeStats();
      this.updateCharts();
    });
    this.computeStats();
  }

  ngAfterViewInit() {
    this.initCharts();
  }

  private initCharts() {
    const ctxCat = this.categoryChartRef?.nativeElement;
    if (ctxCat) {
      this.categoryChart = new Chart(ctxCat, {
        type: 'doughnut',
        data: { labels: [], datasets: [{ data: [], backgroundColor: ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ef4444'] }] },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    const ctxProj = this.projectChartRef?.nativeElement;
    if (ctxProj) {
      this.projectChart = new Chart(ctxProj, {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Approved Budget', data: [], backgroundColor: '#3b82f6' }, { label: 'Spent', data: [], backgroundColor: '#10b981' }] },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
    
    this.updateCharts();
  }

  private updateCharts() {
    if (this.categoryChart && this.categoryBreakdown.length > 0) {
      this.categoryChart.data.labels = this.categoryBreakdown.map(c => c.category);
      this.categoryChart.data.datasets[0].data = this.categoryBreakdown.map(c => c.amount);
      this.categoryChart.update();
    }

    if (this.projectChart && this.budgets.length > 0) {
      this.projectChart.data.labels = this.budgets.map(b => b.project);
      this.projectChart.data.datasets[0].data = this.budgets.map(b => b.approvedBudget);
      this.projectChart.data.datasets[1].data = this.budgets.map(b => this.spentFor(b.project));
      this.projectChart.update();
    }
  }

  private computeStats() {
    this.totalApproved = this.data.totalApprovedBudget();
    this.totalSpent = this.data.totalSpent();
    this.totalRemaining = Math.max(0, this.totalApproved - this.totalSpent);
    this.usedPercent = this.totalApproved ? Math.round((this.totalSpent / this.totalApproved) * 100) : 0;

    const byCategory = this.data.expensesByCategory();
    const max = byCategory.length ? byCategory[0].amount : 1;
    this.categoryBreakdown = byCategory.map(c => ({ ...c, percent: Math.round((c.amount / max) * 100) }));
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
