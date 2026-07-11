// Shared types used across the Analytics module.
// Field names mirror the BuildTrack database schema tables:
//   budgets, expense_categories, expenses, project_statuses, progress_reports,
//   purchase_orders, vendors, invoices
//
// NOTE: there is no dedicated "analytics" table in the schema — analytics is
// a computed/aggregated view over these operational tables, the same way
// the Analytics Service is described in the system architecture diagram
// (Dashboard Analytics, KPIs & Metrics, Budget Analytics, Resource Analytics,
// Performance Insights). Everything here is derived, not stored as-is.

export type BudgetStatus = 'Planned' | 'Approved' | 'Closed';

// Maps to the `budgets` table (one row per project).
export interface ProjectBudget {
  budgetId: string;
  project: string;
  estimatedCost: number;
  approvedBudget: number;
  budgetStatus: BudgetStatus;
}

// Maps to `expense_categories` + `expenses`.
export type ExpenseCategory =
  | 'Labor Cost'
  | 'Material Cost'
  | 'Equipment Cost'
  | 'Transportation Cost'
  | 'Maintenance Cost'
  | 'Administrative Cost';

export interface Expense {
  expenseId: string;
  budgetId: string;
  project: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  expenseDate: string; // ISO date
}

// Maps to `project_statuses` + aggregated `progress_reports`.
export type ProjectLifecycleStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed';

export interface ProjectProgressSummary {
  projectId: string;
  project: string;
  category: string; // Residential, Commercial, Industrial, Infrastructure, Government
  status: ProjectLifecycleStatus;
  completionPercentage: number; // derived from the latest progress_reports rows / milestones
  startDate: string;
  expectedEndDate: string;
}

// Maps to `purchase_orders`.
export type OrderStatus = 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';

export interface PurchaseOrderSummary {
  purchaseOrderId: string;
  project: string;
  vendor: string;
  orderDate: string;
  expectedDeliveryDate: string;
  totalAmount: number;
  orderStatus: OrderStatus;
}

// Maps to `vendors`, aggregated with purchase_orders + invoices.
export interface VendorSummary {
  vendorId: string;
  vendorName: string;
  totalOrders: number;
  totalSpend: number;
  pendingInvoices: number;
}
