export interface BudgetAnalytics {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  utilizationPercentage: number;
  costVariance: number;
  burnRate: number;
  categories: BudgetCategory[];
  monthlyTrend: MonthlyData[];
  phaseBreakdown: PhaseData[];
  recentTransactions: Transaction[];
}

export interface BudgetCategory {
  name: string;
  planned: number;
  actual: number;
  variance: number;
  status: 'on-track' | 'over-budget' | 'under-budget';
}

export interface MonthlyData {
  month: string;
  value: number;
}

export interface PhaseData {
  name: string;
  planned: number;
  actual: number;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: Date;
  category: string;
}

export interface ProgressAnalytics {
  overallProgress: number;
  totalTasks: number;
  completedTasks: number;
  totalMilestones: number;
  achievedMilestones: number;
  estimatedCompletion: Date;
  daysRemaining: number;
  phases: PhaseProgress[];
  taskCategories: TaskCategory[];
  weeklyTrend: WeeklyData[];
  risks: Risk[];
}

export interface PhaseProgress {
  name: string;
  progress: number;
  startDate: Date;
  endDate: Date;
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
}

export interface TaskCategory {
  name: string;
  total: number;
  completed: number;
}

export interface WeeklyData {
  week: string;
  value: number;
}

export interface Risk {
  id: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
  probability: number;
  impact: number;
}

export interface ResourceAnalytics {
  totalResources: number;
  availableResources: number;
  allocatedResources: number;
  maintenanceResources: number;
  utilizationRate: number;
  resourceEfficiency: number;
  resourceTypes: ResourceType[];
  weeklyUtilization: WeeklyData[];
  departmentUsage: DepartmentData[];
  alerts: Alert[];
}

export interface ResourceType {
  name: string;
  count: number;
  utilization: number;
}

export interface DepartmentData {
  name: string;
  usage: number;
  allocated: number;
}

export interface Alert {
  id: number;
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'danger';
}

export interface ProcurementAnalytics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  overdueOrders: number;
  totalCost: number;
  averageCycleTime: number;
  onTimeDeliveryRate: number;
  suppliers: SupplierData[];
  monthlyTrend: MonthlyData[];
  orderStatus: StatusDistribution;
}

export interface SupplierData {
  name: string;
  orders: number;
  onTimeDelivery: number;
  averageCost: number;
  rating: number;
}

export interface StatusDistribution {
  pending: number;
  approved: number;
  ordered: number;
  received: number;
  cancelled: number;
}

export interface DashboardData {
  budget: BudgetAnalytics;
  progress: ProgressAnalytics;
  resources: ResourceAnalytics;
  procurement: ProcurementAnalytics;
}