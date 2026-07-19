import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface KpiData {
  totalBudget: number;
  budgetUsed: number;
  workers: number;
  machinery: number;
  tasksCompleted: number;
  tasksPending: number;
  milestonesCompleted: number;
  daysRemaining: number;
}

interface KpiCard {
  label: string;
  value: string;
  icon: string;
  accentFrom: string;
  accentTo: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
}

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-cards.html',
  styleUrl: './kpi-cards.css',
})
export class KpiCardsComponent {

  @Input() kpiData: KpiData = {
    totalBudget: 0,
    budgetUsed: 0,
    workers: 0,
    machinery: 0,
    tasksCompleted: 0,
    tasksPending: 0,
    milestonesCompleted: 0,
    daysRemaining: 0,
  };

  get cards(): KpiCard[] {
    const d = this.kpiData;
    const budgetPercent = d.totalBudget > 0
      ? Math.round((d.budgetUsed / d.totalBudget) * 100)
      : 0;
    const totalTasks = d.tasksCompleted + d.tasksPending;
    const taskPercent = totalTasks > 0
      ? Math.round((d.tasksCompleted / totalTasks) * 100)
      : 0;

    return [
      {
        label: 'Total Budget',
        value: this.formatCurrency(d.totalBudget),
        icon: '💰',
        accentFrom: '#2563eb',
        accentTo: '#3b82f6',
        trend: 'Sanctioned',
        trendDirection: 'neutral',
      },
      {
        label: 'Budget Used',
        value: this.formatCurrency(d.budgetUsed),
        icon: '📊',
        accentFrom: '#059669',
        accentTo: '#10b981',
        trend: `${budgetPercent}% utilized`,
        trendDirection: budgetPercent > 80 ? 'down' : 'up',
      },
      {
        label: 'Workers',
        value: d.workers.toLocaleString('en-IN'),
        icon: '👷',
        accentFrom: '#7c3aed',
        accentTo: '#8b5cf6',
        trend: 'On site today',
        trendDirection: 'up',
      },
      {
        label: 'Machinery',
        value: d.machinery.toLocaleString('en-IN'),
        icon: '🏗️',
        accentFrom: '#ea580c',
        accentTo: '#f97316',
        trend: 'Units deployed',
        trendDirection: 'neutral',
      },
      {
        label: 'Tasks Completed',
        value: d.tasksCompleted.toLocaleString('en-IN'),
        icon: '✅',
        accentFrom: '#16a34a',
        accentTo: '#22c55e',
        trend: `${taskPercent}% of total`,
        trendDirection: 'up',
      },
      {
        label: 'Tasks Pending',
        value: d.tasksPending.toLocaleString('en-IN'),
        icon: '⏳',
        accentFrom: '#d97706',
        accentTo: '#f59e0b',
        trend: `${totalTasks} total tasks`,
        trendDirection: d.tasksPending > d.tasksCompleted ? 'down' : 'neutral',
      },
      {
        label: 'Milestones Completed',
        value: d.milestonesCompleted.toLocaleString('en-IN'),
        icon: '🏁',
        accentFrom: '#0891b2',
        accentTo: '#06b6d4',
        trend: 'Achieved',
        trendDirection: 'up',
      },
      {
        label: 'Days Remaining',
        value: d.daysRemaining.toLocaleString('en-IN'),
        icon: '📅',
        accentFrom: '#dc2626',
        accentTo: '#ef4444',
        trend: 'To deadline',
        trendDirection: d.daysRemaining < 90 ? 'down' : 'neutral',
      },
    ];
  }

  private formatCurrency(value: number): string {
    if (value >= 10000000) {
      return '₹' + (value / 10000000).toFixed(1) + ' Cr';
    }
    if (value >= 100000) {
      return '₹' + (value / 100000).toFixed(1) + ' L';
    }
    return '₹' + value.toLocaleString('en-IN');
  }
}
