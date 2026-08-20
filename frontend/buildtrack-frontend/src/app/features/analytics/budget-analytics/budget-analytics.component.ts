import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Expense, ExpenseCategory, ProjectBudget } from '../models/analytics.model';
import { AnalyticsDataService, ProjectCostBreakdown } from '../analytics-data.service';
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
  @ViewChild('projectChart')  projectChartRef!: ElementRef;
  @ViewChild('labourChart')   labourChartRef!: ElementRef;
  @ViewChild('materialChart') materialChartRef!: ElementRef;

  categoryChart: any;
  projectChart: any;
  labourChart: any;
  materialChart: any;

  budgets: ProjectBudget[] = [];
  categoryBreakdown: { category: ExpenseCategory; amount: number; percent: number }[] = [];
  projectCosts: ProjectCostBreakdown[] = [];

  totalApproved = 0;
  totalSpent = 0;
  totalRemaining = 0;
  usedPercent = 0;
  totalLabour = 0;
  totalMaterial = 0;

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
    this.data.projectCosts$.subscribe(costs => {
      this.projectCosts = costs;
      this.totalLabour   = costs.reduce((s, c) => s + c.labourCost, 0);
      this.totalMaterial = costs.reduce((s, c) => s + c.materialCost, 0);
      this.updateCharts();
    });
    this.computeStats();
  }

  ngAfterViewInit() {
    this.initCharts();
  }

  private chartOptions(extraScales = false): any {
    const base: any = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: 'rgba(255,255,255,0.75)', font: { family: 'Inter', size: 12 }, padding: 16 } },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.95)',
          titleFont: { family: 'Inter', size: 13 },
          bodyFont: { family: 'Inter', size: 12 },
          padding: 10, cornerRadius: 8,
          borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
        },
      },
    };
    if (extraScales) {
      base.scales = {
        x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.6)', font: { family: 'Inter', size: 11 }, maxRotation: 30 } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.6)', font: { family: 'Inter', size: 11 }, padding: 8 } },
      };
    }
    return base;
  }

  private initCharts() {
    // 1. Spend by Category (Doughnut)
    if (this.categoryChartRef?.nativeElement) {
      this.categoryChart = new Chart(this.categoryChartRef.nativeElement, {
        type: 'doughnut',
        data: { labels: [], datasets: [{ data: [], backgroundColor: ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ef4444', '#06b6d4'], borderWidth: 0, hoverOffset: 6 }] },
        options: { ...this.chartOptions(), cutout: '68%', plugins: { ...this.chartOptions().plugins, legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.75)', font: { family: 'Inter', size: 12 }, padding: 16 } } } },
      });
    }

    // 2. Budget vs Spent per Project (grouped bar)
    if (this.projectChartRef?.nativeElement) {
      this.projectChart = new Chart(this.projectChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [
            { label: 'Approved Budget', data: [], backgroundColor: 'rgba(59,130,246,0.8)', borderRadius: 6 },
            { label: 'Spent', data: [], backgroundColor: 'rgba(16,185,129,0.8)', borderRadius: 6 },
          ],
        },
        options: this.chartOptions(true),
      });
    }

    // 3. Labour Cost per Project (horizontal bar)
    if (this.labourChartRef?.nativeElement) {
      const ctx = this.labourChartRef.nativeElement.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 400, 0);
      grad.addColorStop(0, 'rgba(139,92,246,0.9)');
      grad.addColorStop(1, 'rgba(236,72,153,0.4)');
      this.labourChart = new Chart(this.labourChartRef.nativeElement, {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Labour Cost (₹)', data: [], backgroundColor: grad, borderRadius: 6 }] },
        options: { ...this.chartOptions(true), indexAxis: 'y' as any },
      });
    }

    // 4. Material Cost per Project (horizontal bar)
    if (this.materialChartRef?.nativeElement) {
      const ctx2 = this.materialChartRef.nativeElement.getContext('2d');
      const grad2 = ctx2.createLinearGradient(0, 0, 400, 0);
      grad2.addColorStop(0, 'rgba(6,182,212,0.9)');
      grad2.addColorStop(1, 'rgba(16,185,129,0.3)');
      this.materialChart = new Chart(this.materialChartRef.nativeElement, {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Inventory/Material Cost (₹)', data: [], backgroundColor: grad2, borderRadius: 6 }] },
        options: { ...this.chartOptions(true), indexAxis: 'y' as any },
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
    if (this.labourChart && this.projectCosts.length > 0) {
      this.labourChart.data.labels = this.projectCosts.map(c => c.projectName);
      this.labourChart.data.datasets[0].data = this.projectCosts.map(c => c.labourCost);
      this.labourChart.update();
    }
    if (this.materialChart && this.projectCosts.length > 0) {
      this.materialChart.data.labels = this.projectCosts.map(c => c.projectName);
      this.materialChart.data.datasets[0].data = this.projectCosts.map(c => c.materialCost);
      this.materialChart.update();
    }
  }

  private computeStats() {
    this.totalApproved  = this.data.totalApprovedBudget();
    this.totalSpent     = this.data.totalSpent();
    this.totalRemaining = Math.max(0, this.totalApproved - this.totalSpent);
    this.usedPercent    = this.totalApproved ? Math.round((this.totalSpent / this.totalApproved) * 100) : 0;

    const byCategory = this.data.expensesByCategory();
    const max = byCategory.length ? byCategory[0].amount : 1;
    this.categoryBreakdown = byCategory.map(c => ({ ...c, percent: Math.round((c.amount / max) * 100) }));
  }

  spentFor(project: string): number { return this.data.spentForProject(project); }

  usedPercentFor(budget: ProjectBudget): number {
    const spent = this.spentFor(budget.project);
    return budget.approvedBudget ? Math.min(100, Math.round((spent / budget.approvedBudget) * 100)) : 0;
  }

  statusClass(status: ProjectBudget['budgetStatus']) {
    return { Planned: 'orange', Approved: 'blue', Closed: 'green' }[status];
  }

  goBack(): void { this.location.back(); }
}
