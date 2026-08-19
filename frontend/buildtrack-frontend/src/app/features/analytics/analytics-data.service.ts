import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  ProjectBudget, Expense, ProjectProgressSummary,
  PurchaseOrderSummary, VendorSummary, ExpenseCategory,
} from './models/analytics.model';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'buildtrack_access_token';

// Backend response shapes
interface ApiProgressRow {
  project_id: number;
  project: string;
  category: string;
  status: string;
  completion_percentage: number;
  start_date: string;
  expected_end_date: string;
  manager: string;
  total_milestones: number;
  completed_milestones: number;
}

interface ApiBudgetRow {
  project_id: number;
  project_name: string;
  allocated_budget: number;
  labour_cost: number;
  material_cost: number;
  total_spent: number;
  remaining: number;
  status: string;
}

interface ApiPO {
  purchase_order_id: string;
  project: string;
  vendor: string;
  order_date: string;
  expected_delivery_date: string;
  total_amount: number;
  order_status: string;
}

interface ApiVendor {
  vendor_id: string;
  vendor_name: string;
  total_orders: number;
  total_spend: number;
  pending_invoices: number;
}

interface ApiProcurement {
  purchase_orders: ApiPO[];
  vendors: ApiVendor[];
}

interface ApiSummary {
  total_projects: number;
  in_progress_projects: number;
  avg_completion_percent: number;
  total_vendors: number;
  total_procurement_requests: number;
}

export interface ProjectCostBreakdown {
  projectId: number;
  projectName: string;
  allocatedBudget: number;
  labourCost: number;
  materialCost: number;
  totalSpent: number;
  remaining: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsDataService {
  private readonly base = `${environment.apiUrl}/analytics`;

  private budgets$$       = new BehaviorSubject<ProjectBudget[]>([]);
  private expenses$$      = new BehaviorSubject<Expense[]>([]);
  private progress$$      = new BehaviorSubject<ProjectProgressSummary[]>([]);
  private purchaseOrders$$= new BehaviorSubject<PurchaseOrderSummary[]>([]);
  private vendors$$       = new BehaviorSubject<VendorSummary[]>([]);
  private summary$$       = new BehaviorSubject<ApiSummary | null>(null);
  private projectCosts$$  = new BehaviorSubject<ProjectCostBreakdown[]>([]);

  budgets$       = this.budgets$$.asObservable();
  expenses$      = this.expenses$$.asObservable();
  progress$      = this.progress$$.asObservable();
  purchaseOrders$= this.purchaseOrders$$.asObservable();
  vendors$       = this.vendors$$.asObservable();
  summary$       = this.summary$$.asObservable();
  projectCosts$  = this.projectCosts$$.asObservable();

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem(TOKEN_KEY) ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private err<T>(fallback: T) {
    return (e: any): Observable<T> => {
      console.error('[AnalyticsDataService]', e?.error?.detail ?? e?.message ?? e);
      return of(fallback);
    };
  }

  loadAll() {
    forkJoin({
      progress:    this.http.get<ApiProgressRow[]>(`${this.base}/progress`, { headers: this.headers() }).pipe(catchError(this.err([]))),
      procurement: this.http.get<ApiProcurement>(`${this.base}/procurement`, { headers: this.headers() }).pipe(catchError(this.err({ purchase_orders: [], vendors: [] }))),
      summary:     this.http.get<ApiSummary>(`${this.base}/summary`, { headers: this.headers() }).pipe(catchError(this.err(null))),
      budgetData:  this.http.get<ApiBudgetRow[]>(`${this.base}/budget`, { headers: this.headers() }).pipe(catchError(this.err([]))),
    }).subscribe(({ progress, procurement, summary, budgetData }) => {
      // Map progress
      this.progress$$.next(progress.map(r => ({
        projectId:  `P-${r.project_id}`,
        project:    r.project,
        category:   r.category,
        status:     r.status as any,
        completionPercentage: r.completion_percentage,
        startDate:  r.start_date,
        expectedEndDate: r.expected_end_date,
      })));

      // Map procurement
      const mappedPOs = procurement.purchase_orders.map(po => ({
        purchaseOrderId: po.purchase_order_id,
        project:         po.project,
        vendor:          po.vendor,
        orderDate:       po.order_date,
        expectedDeliveryDate: po.expected_delivery_date,
        totalAmount:     po.total_amount,
        orderStatus:     po.order_status as any,
      }));
      this.purchaseOrders$$.next(mappedPOs);

      this.vendors$$.next(procurement.vendors.map(v => ({
        vendorId:       v.vendor_id,
        vendorName:     v.vendor_name,
        totalOrders:    v.total_orders,
        totalSpend:     v.total_spend,
        pendingInvoices:v.pending_invoices,
      })));

      // Map real budget data from backend
      const costBreakdowns: ProjectCostBreakdown[] = budgetData.map(b => ({
        projectId: b.project_id,
        projectName: b.project_name,
        allocatedBudget: b.allocated_budget,
        labourCost: b.labour_cost,
        materialCost: b.material_cost,
        totalSpent: b.total_spent,
        remaining: b.remaining,
        status: b.status,
      }));
      this.projectCosts$$.next(costBreakdowns);

      // Map into ProjectBudget using real allocated_budget
      const realBudgets: ProjectBudget[] = budgetData.map(b => ({
        budgetId: `B-${b.project_id}`,
        project: b.project_name,
        estimatedCost: b.allocated_budget,
        approvedBudget: b.allocated_budget,
        budgetStatus: b.status === 'Completed' ? 'Closed' : (b.allocated_budget > 0 ? 'Approved' : 'Planned'),
      }));
      this.budgets$$.next(realBudgets);

      // Build expenses from real data: material + labour per project
      const realExpenses: Expense[] = [];
      budgetData.forEach(b => {
        const budgetId = `B-${b.project_id}`;
        if (b.material_cost > 0) {
          realExpenses.push({
            expenseId: `EM-${b.project_id}`,
            budgetId,
            project: b.project_name,
            category: 'Material Cost',
            title: 'Procurement Materials',
            amount: b.material_cost,
            expenseDate: new Date().toISOString().split('T')[0],
          });
        }
        if (b.labour_cost > 0) {
          realExpenses.push({
            expenseId: `EL-${b.project_id}`,
            budgetId,
            project: b.project_name,
            category: 'Labor Cost',
            title: 'Workforce Payroll',
            amount: b.labour_cost,
            expenseDate: new Date().toISOString().split('T')[0],
          });
        }
      });
      this.expenses$$.next(realExpenses);

      if (summary) this.summary$$.next(summary);
    });
  }

  // ── Aggregation helpers ─────────────────────────────────────────────
  totalApprovedBudget(): number {
    return this.budgets$$.value.reduce((s, b) => s + b.approvedBudget, 0);
  }

  totalSpent(): number {
    return this.expenses$$.value.reduce((s, e) => s + e.amount, 0);
  }

  spentForProject(project: string): number {
    return this.projectCosts$$.value.find(p => p.projectName === project)?.totalSpent ?? 0;
  }

  expensesByCategory(): { category: ExpenseCategory; amount: number }[] {
    const cats = Array.from(new Set(this.expenses$$.value.map(e => e.category)));
    return cats.map(category => ({
      category,
      amount: this.expenses$$.value.filter(e => e.category === category).reduce((s, e) => s + e.amount, 0),
    })).sort((a, b) => b.amount - a.amount);
  }

  totalProcurementValue(): number {
    return this.purchaseOrders$$.value.reduce((s, po) => s + po.totalAmount, 0);
  }

  totalPendingInvoices(): number {
    return this.vendors$$.value.reduce((s, v) => s + v.pendingInvoices, 0);
  }

  orderStatusBreakdown(): { status: PurchaseOrderSummary['orderStatus']; count: number }[] {
    const statuses: PurchaseOrderSummary['orderStatus'][] = ['Pending', 'Confirmed', 'Delivered', 'Cancelled'];
    return statuses.map(status => ({
      status,
      count: this.purchaseOrders$$.value.filter(po => po.orderStatus === status).length,
    }));
  }

  get summaryKpis() { return this.summary$$.value; }
}
