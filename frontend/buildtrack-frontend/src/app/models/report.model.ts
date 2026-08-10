export interface Report {
  id: string;
  title: string;
  type: ReportType;
  generatedDate: Date;
  status: ReportStatus;
  format: ReportFormat;
  description: string;
  data: any;
}

export type ReportType = 
  | 'progress' 
  | 'resource' 
  | 'budget' 
  | 'workforce' 
  | 'procurement' 
  | 'custom';

export type ReportStatus = 'draft' | 'generated' | 'scheduled' | 'archived';

export type ReportFormat = 'pdf' | 'excel' | 'both';

export interface ReportFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  projectId?: string;
  department?: string;
  status?: string;
  categories?: string[];
  category?: string;
  supplier?: string;
}

export interface PhaseProgress {
  name: string;
  progress: number;
  startDate: Date;
  endDate: Date;
  status: string;
}

export interface ProgressReportData {
  projectName: string;
  overallProgress: number;
  phaseProgress: PhaseProgress[];
  tasksCompleted: number;
  tasksTotal: number;
  milestonesAchieved: number;
  milestonesTotal: number;
  timelineStatus: string;
  risks: RiskReport[];
  weeklyProgress: WeeklyProgress[];
  completionForecast: string;
  delayedTasks: DelayedTask[];
}

export interface ResourceReportData {
  totalResources: number;
  resourcesByType: ResourceTypeReport[];
  utilizationRate: number;
  availableResources: number;
  allocatedResources: number;
  resourceEfficiency: number;
  topUsedResources: TopResource[];
  maintenanceSchedule: MaintenanceItem[];
  resourceAllocation: ResourceAllocation[];
}

export interface BudgetReportData {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  budgetUtilization: number;
  categoryBreakdown: BudgetCategoryReport[];
  monthlySpending: MonthlySpending[];
  costVariance: number;
  budgetStatus: string;
  topExpenses: ExpenseItem[];
  budgetForecast: BudgetForecast[];
}

export interface WorkforceReportData {
  totalEmployees: number;
  departments: DepartmentReport[];
  attendanceRate: number;
  overtime: number;
  payrollTotal: number;
  employeeDistribution: EmployeeDistribution[];
  attendanceTrend: AttendanceTrend[];
  shiftSchedule: ShiftReport[];
  trainingStatus: TrainingStatus[];
}

export interface ProcurementReportData {
  totalOrders: number;
  orderStatus: OrderStatusReport[];
  totalSpent: number;
  supplierPerformance: SupplierPerformance[];
  deliveryTimeline: DeliveryTimeline[];
  procurementCategories: ProcurementCategory[];
  pendingOrders: PendingOrder[];
  costSavings: CostSavingsReport[];
}

// Supporting Interfaces
export interface RiskReport {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  impact: number;
  probability: number;
  mitigation: string;
}

export interface WeeklyProgress {
  week: string;
  planned: number;
  actual: number;
  variance: number;
}

export interface DelayedTask {
  id: string;
  name: string;
  delayedDays: number;
  reason: string;
  impact: string;
}

export interface ResourceTypeReport {
  type: string;
  count: number;
  utilization: number;
  status: string;
}

export interface TopResource {
  name: string;
  usage: number;
  availability: number;
  efficiency: number;
}

export interface MaintenanceItem {
  resource: string;
  lastMaintenance: Date;
  nextMaintenance: Date;
  status: string;
}

export interface ResourceAllocation {
  project: string;
  resources: number;
  utilization: number;
}

export interface BudgetCategoryReport {
  category: string;
  planned: number;
  actual: number;
  variance: number;
  percentage: number;
}

export interface MonthlySpending {
  month: string;
  amount: number;
  forecast: number;
  variance: number;
}

export interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  vendor: string;
}

export interface BudgetForecast {
  month: string;
  projected: number;
  actual: number;
  variance: number;
}

export interface DepartmentReport {
  name: string;
  employees: number;
  attendance: number;
  productivity: number;
  overtime: number;
}

export interface EmployeeDistribution {
  role: string;
  count: number;
  percentage: number;
}

export interface AttendanceTrend {
  date: Date;
  present: number;
  absent: number;
  percentage: number;
}

export interface ShiftReport {
  shift: string;
  employees: number;
  startTime: string;
  endTime: string;
}

export interface TrainingStatus {
  type: string;
  completed: number;
  pending: number;
  total: number;
}

export interface OrderStatusReport {
  status: string;
  count: number;
  percentage: number;
}

export interface SupplierPerformance {
  supplier: string;
  orders: number;
  delivered: number;
  onTime: number;
  rating: number;
  cost: number;
}

export interface DeliveryTimeline {
  order: string;
  orderDate: Date;
  expectedDate: Date;
  actualDate: Date;
  status: string;
}

export interface ProcurementCategory {
  name: string;
  count: number;
  value: number;
  percentage: number;
}

export interface PendingOrder {
  id: string;
  supplier: string;
  orderDate: Date;
  expectedDate: Date;
  overdue: number;
  value: number;
}

export interface CostSavingsReport {
  category: string;
  plannedCost: number;
  actualCost: number;
  savings: number;
  percentage: number;
}