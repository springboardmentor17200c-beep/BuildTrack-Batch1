import { Injectable } from '@angular/core';
import { DashboardData, BudgetAnalytics, ProgressAnalytics, ResourceAnalytics, ProcurementAnalytics } from '../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  
  getMockDashboardData(): DashboardData {
    return {
      budget: this.getMockBudgetData(),
      progress: this.getMockProgressData(),
      resources: this.getMockResourceData(),
      procurement: this.getMockProcurementData()
    };
  }

  getMockBudgetData(): BudgetAnalytics {
    return {
      totalBudget: 2500000,
      totalSpent: 1625000,
      remainingBudget: 875000,
      utilizationPercentage: 65,
      costVariance: -125000,
      burnRate: 125000,
      categories: [
        { name: 'Materials', planned: 800000, actual: 750000, variance: 50000, status: 'on-track' },
        { name: 'Labor', planned: 900000, actual: 950000, variance: -50000, status: 'over-budget' },
        { name: 'Equipment', planned: 500000, actual: 480000, variance: 20000, status: 'on-track' },
        { name: 'Overhead', planned: 300000, actual: 320000, variance: -20000, status: 'over-budget' }
      ],
      monthlyTrend: [
        { month: 'Jan', value: 180000 },
        { month: 'Feb', value: 220000 },
        { month: 'Mar', value: 250000 },
        { month: 'Apr', value: 280000 },
        { month: 'May', value: 260000 },
        { month: 'Jun', value: 315000 }
      ],
      phaseBreakdown: [
        { name: 'Foundation', planned: 400000, actual: 380000 },
        { name: 'Structure', planned: 600000, actual: 620000 },
        { name: 'Interior', planned: 500000, actual: 480000 },
        { name: 'Finishing', planned: 400000, actual: 390000 }
      ],
      recentTransactions: [
        { id: 1, description: 'Steel purchase', amount: 45000, date: new Date('2026-07-08'), category: 'Materials' },
        { id: 2, description: 'Labor payment', amount: 32000, date: new Date('2026-07-07'), category: 'Labor' },
        { id: 3, description: 'Equipment rental', amount: 15000, date: new Date('2026-07-06'), category: 'Equipment' },
        { id: 4, description: 'Permit fees', amount: 8000, date: new Date('2026-07-05'), category: 'Overhead' }
      ]
    };
  }

  getMockProgressData(): ProgressAnalytics {
    return {
      overallProgress: 65,
      totalTasks: 200,
      completedTasks: 130,
      totalMilestones: 8,
      achievedMilestones: 5,
      estimatedCompletion: new Date('2026-10-15'),
      daysRemaining: 97,
      phases: [
        { name: 'Foundation', progress: 100, startDate: new Date('2026-01-01'), endDate: new Date('2026-02-15'), status: 'completed' },
        { name: 'Structure', progress: 85, startDate: new Date('2026-02-16'), endDate: new Date('2026-04-30'), status: 'on-track' },
        { name: 'Interior', progress: 60, startDate: new Date('2026-05-01'), endDate: new Date('2026-07-15'), status: 'on-track' },
        { name: 'Finishing', progress: 30, startDate: new Date('2026-07-16'), endDate: new Date('2026-09-30'), status: 'at-risk' }
      ],
      taskCategories: [
        { name: 'Design', total: 30, completed: 28 },
        { name: 'Construction', total: 80, completed: 52 },
        { name: 'Electrical', total: 40, completed: 22 },
        { name: 'Plumbing', total: 30, completed: 18 },
        { name: 'Finishing', total: 20, completed: 10 }
      ],
      weeklyTrend: [
        { week: 'Week 1', value: 15 },
        { week: 'Week 2', value: 18 },
        { week: 'Week 3', value: 22 },
        { week: 'Week 4', value: 28 },
        { week: 'Week 5', value: 32 },
        { week: 'Week 6', value: 38 }
      ],
      risks: [
        { id: 1, description: 'Weather delays', severity: 'medium', probability: 0.6, impact: 0.7 },
        { id: 2, description: 'Supply chain issues', severity: 'high', probability: 0.4, impact: 0.9 },
        { id: 3, description: 'Labor shortage', severity: 'medium', probability: 0.5, impact: 0.6 }
      ]
    };
  }

  getMockResourceData(): ResourceAnalytics {
    return {
      totalResources: 150,
      availableResources: 45,
      allocatedResources: 85,
      maintenanceResources: 20,
      utilizationRate: 56.7,
      resourceEfficiency: 82,
      resourceTypes: [
        { name: 'Heavy Equipment', count: 30, utilization: 75 },
        { name: 'Tools', count: 60, utilization: 50 },
        { name: 'Vehicles', count: 25, utilization: 68 },
        { name: 'Safety Equipment', count: 35, utilization: 40 }
      ],
      weeklyUtilization: [
        { week: 'Week 1', value: 45 },
        { week: 'Week 2', value: 48 },
        { week: 'Week 3', value: 52 },
        { week: 'Week 4', value: 58 },
        { week: 'Week 5', value: 55 },
        { week: 'Week 6', value: 60 }
      ],
      departmentUsage: [
        { name: 'Construction', usage: 40, allocated: 60 },
        { name: 'Finishing', usage: 25, allocated: 35 },
        { name: 'Electrical', usage: 20, allocated: 25 },
        { name: 'Plumbing', usage: 15, allocated: 20 }
      ],
      alerts: [
        { id: 1, type: 'Maintenance', message: 'Excavator due for maintenance', severity: 'warning' },
        { id: 2, type: 'Low Stock', message: 'Safety helmets low stock', severity: 'danger' },
        { id: 3, type: 'Overused', message: 'Concrete mixer overutilized', severity: 'warning' }
      ]
    };
  }

  getMockProcurementData(): ProcurementAnalytics {
    return {
      totalOrders: 75,
      pendingOrders: 20,
      completedOrders: 45,
      overdueOrders: 10,
      totalCost: 850000,
      averageCycleTime: 12,
      onTimeDeliveryRate: 85,
      suppliers: [
        { name: 'ABC Steel', orders: 25, onTimeDelivery: 90, averageCost: 32000, rating: 4.5 },
        { name: 'XYZ Cement', orders: 20, onTimeDelivery: 85, averageCost: 28000, rating: 4.0 },
        { name: 'PQR Tools', orders: 15, onTimeDelivery: 95, averageCost: 15000, rating: 4.8 },
        { name: 'LMN Electronics', orders: 15, onTimeDelivery: 70, averageCost: 22000, rating: 3.5 }
      ],
      monthlyTrend: [
        { month: 'Jan', value: 120000 },
        { month: 'Feb', value: 140000 },
        { month: 'Mar', value: 160000 },
        { month: 'Apr', value: 180000 },
        { month: 'May', value: 150000 },
        { month: 'Jun', value: 100000 }
      ],
      orderStatus: {
        pending: 20,
        approved: 15,
        ordered: 25,
        received: 45,
        cancelled: 5
      }
    };
  }
}