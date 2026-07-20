import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BudgetSummary {
  estimatedBudget: number;
  budgetUsed: number;
  remainingBudget: number;
  labourCost: number;
  materialCost: number;
  machineryCost: number;
  currencyCode?: string;
}

@Component({
  selector: 'app-budget-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './budget-summary.html',
  styleUrl: './budget-summary.css',
})
export class BudgetSummaryComponent {
  @Input() budget: BudgetSummary | null = null;

  get currencyCode(): string {
    return this.budget?.currencyCode ?? 'INR';
  }

  get budgetUsage(): number {
    if (!this.budget?.estimatedBudget) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(0, (this.budget.budgetUsed / this.budget.estimatedBudget) * 100),
    );
  }

  get totalCost(): number {
    if (!this.budget) {
      return 0;
    }

    return this.budget.labourCost + this.budget.materialCost + this.budget.machineryCost;
  }

  costPercentage(cost: number): number {
    if (!this.totalCost) {
      return 0;
    }

    return Math.round((cost / this.totalCost) * 100);
  }
}
