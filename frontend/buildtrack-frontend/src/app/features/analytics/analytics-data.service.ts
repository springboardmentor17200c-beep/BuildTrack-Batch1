import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Expense,
  ExpenseCategory,
  ProjectBudget,
  ProjectProgressSummary,
  PurchaseOrderSummary,
  VendorSummary,
} from './models/analytics.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsDataService {
  private apiUrl = environment.apiUrl;

  private budgets: ProjectBudget[] = [];
  private expenses: Expense[] = [];

  private progress: ProjectProgressSummary[] = [];

  private purchaseOrders: PurchaseOrderSummary[] = [];
  private vendors: VendorSummary[] = [];

  private budgets$$ = new BehaviorSubject<ProjectBudget[]>(this.budgets);
  private expenses$$ = new BehaviorSubject<Expense[]>(this.expenses);
  private progress$$ = new BehaviorSubject<ProjectProgressSummary[]>(this.progress);
  private purchaseOrders$$ = new BehaviorSubject<PurchaseOrderSummary[]>(this.purchaseOrders);
  private vendors$$ = new BehaviorSubject<VendorSummary[]>(this.vendors);

  budgets$ = this.budgets$$.asObservable();
  expenses$ = this.expenses$$.asObservable();
  progress$ = this.progress$$.asObservable();
  purchaseOrders$ = this.purchaseOrders$$.asObservable();
  vendors$ = this.vendors$$.asObservable();

  constructor(private http: HttpClient) {
    this.fetchBudgetAnalytics();
    this.fetchProgressAnalytics();
    this.fetchProcurementAnalytics();
  }

  private fetchBudgetAnalytics() {
    this.http.get<{ budgets: ProjectBudget[], expenses: Expense[] }>(`${this.apiUrl}/analytics/budget`)
      .pipe(
        tap(res => {
          this.budgets = res.budgets;
          this.expenses = res.expenses;
          this.budgets$$.next(this.budgets);
          this.expenses$$.next(this.expenses);
        })
      ).subscribe();
  }

  private fetchProgressAnalytics() {
    this.http.get<{ progress: ProjectProgressSummary[] }>(`${this.apiUrl}/analytics/progress`)
      .pipe(
        tap(res => {
          this.progress = res.progress;
          this.progress$$.next(this.progress);
        })
      ).subscribe();
  }

  private fetchProcurementAnalytics() {
    this.http.get<{ purchaseOrders: PurchaseOrderSummary[], vendors: VendorSummary[] }>(`${this.apiUrl}/analytics/procurement`)
      .pipe(
        tap(res => {
          this.purchaseOrders = res.purchaseOrders;
          this.vendors = res.vendors;
          this.purchaseOrders$$.next(this.purchaseOrders);
          this.vendors$$.next(this.vendors);
        })
      ).subscribe();
  }

  // --- Aggregation helpers (what a backend analytics endpoint would compute) ---

  totalApprovedBudget(): number {
    return this.budgets.reduce((sum, b) => sum + b.approvedBudget, 0);
  }

  totalSpent(): number {
    return this.expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  spentForProject(project: string): number {
    return this.expenses.filter(e => e.project === project).reduce((sum, e) => sum + e.amount, 0);
  }

  expensesByCategory(): { category: ExpenseCategory; amount: number }[] {
    const categories = Array.from(new Set(this.expenses.map(e => e.category)));
    return categories
      .map(category => ({
        category,
        amount: this.expenses.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0),
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  totalProcurementValue(): number {
    return this.purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  }

  totalPendingInvoices(): number {
    return this.vendors.reduce((sum, v) => sum + v.pendingInvoices, 0);
  }

  orderStatusBreakdown(): { status: PurchaseOrderSummary['orderStatus']; count: number }[] {
    const statuses: PurchaseOrderSummary['orderStatus'][] = ['Pending', 'Confirmed', 'Delivered', 'Cancelled'];
    return statuses.map(status => ({
      status,
      count: this.purchaseOrders.filter(po => po.orderStatus === status).length,
    }));
  }
}
