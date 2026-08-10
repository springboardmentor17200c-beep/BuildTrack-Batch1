import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, catchError, map } from 'rxjs';
import { 
  Report, 
  ReportFilter, 
  ProgressReportData, 
  ResourceReportData, 
  BudgetReportData, 
  WorkforceReportData, 
  ProcurementReportData 
} from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:8000/reports';

  private reports: Report[] = [
    {
      id: 'rep-001',
      title: 'Project Progress Report - Q3 2026',
      type: 'progress',
      generatedDate: new Date('2026-07-01'),
      status: 'generated',
      format: 'both',
      description: 'Comprehensive progress report for Q3 2026',
      data: this.createProgressReportData({})
    },
    {
      id: 'rep-002',
      title: 'Budget Utilization Report - June 2026',
      type: 'budget',
      generatedDate: new Date('2026-07-05'),
      status: 'generated',
      format: 'pdf',
      description: 'Budget analysis and utilization report for June',
      data: this.createBudgetReportData({})
    },
    {
      id: 'rep-003',
      title: 'Resource Utilization Report',
      type: 'resource',
      generatedDate: new Date('2026-07-10'),
      status: 'draft',
      format: 'excel',
      description: 'Resource allocation and utilization analysis',
      data: this.createResourceReportData({})
    },
    {
      id: 'rep-004',
      title: 'Workforce Performance Report',
      type: 'workforce',
      generatedDate: new Date('2026-07-12'),
      status: 'generated',
      format: 'both',
      description: 'Employee attendance and productivity report',
      data: this.createWorkforceReportData({})
    },
    {
      id: 'rep-005',
      title: 'Procurement Summary Report',
      type: 'procurement',
      generatedDate: new Date('2026-07-15'),
      status: 'scheduled',
      format: 'pdf',
      description: 'Procurement activities and supplier performance',
      data: this.createProcurementReportData({})
    }
  ];

  constructor(private http: HttpClient) {}

  getReports(): Observable<Report[]> {
    return this.http.get<Report[]>(this.apiUrl).pipe(
      catchError(() => of([...this.reports]).pipe(delay(300)))
    );
  }

  getReportById(id: string): Observable<Report> {
    const report = this.reports.find(r => r.id === id) || this.reports[0];
    return of({ ...report }).pipe(delay(200));
  }

  generateReport(type: string, filter: ReportFilter): Observable<Report> {
    const data = this.getReportDataByType(type, filter);
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    const title = `${formattedType} Report - ${new Date().toLocaleDateString()}`;

    return this.http.post<Report>(this.apiUrl, { type, title, filter }).pipe(
      map(apiReport => ({
        ...apiReport,
        data: data
      })),
      catchError(() => {
        const newReport: Report = {
          id: `rep-${Date.now()}`,
          title: title,
          type: type as any,
          generatedDate: new Date(),
          status: 'generated',
          format: 'both',
          description: `Auto-generated ${type} report with active filters`,
          data: data
        };
        this.reports.unshift(newReport);
        return of(newReport).pipe(delay(400));
      })
    );
  }

  generateProgressReport(filter: ReportFilter): Observable<ProgressReportData> {
    return of(this.createProgressReportData(filter)).pipe(delay(400));
  }

  generateResourceReport(filter: ReportFilter): Observable<ResourceReportData> {
    return of(this.createResourceReportData(filter)).pipe(delay(400));
  }

  generateBudgetReport(filter: ReportFilter): Observable<BudgetReportData> {
    return of(this.createBudgetReportData(filter)).pipe(delay(400));
  }

  generateWorkforceReport(filter: ReportFilter): Observable<WorkforceReportData> {
    return of(this.createWorkforceReportData(filter)).pipe(delay(400));
  }

  generateProcurementReport(filter: ReportFilter): Observable<ProcurementReportData> {
    return of(this.createProcurementReportData(filter)).pipe(delay(400));
  }

  exportReportToPDF(reportId: string): Observable<Blob> {
    const report = this.reports.find(r => r.id === reportId) || this.reports[0];
    const content = this.generatePDFContent(report);
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    return of(blob).pipe(delay(400));
  }

  exportReportToExcel(reportId: string): Observable<Blob> {
    const report = this.reports.find(r => r.id === reportId) || this.reports[0];
    const content = this.generateExcelContent(report);
    const blob = new Blob([content], { 
      type: 'text/csv;charset=utf-8;' 
    });
    return of(blob).pipe(delay(400));
  }

  deleteReport(id: string): Observable<boolean> {
    this.reports = this.reports.filter(r => r.id !== id);
    return of(true).pipe(delay(300));
  }

  scheduleReport(report: Report, schedule: any): Observable<Report> {
    const existing = this.reports.find(r => r.id === report.id);
    if (existing) {
      existing.status = 'scheduled';
      return of({ ...existing }).pipe(delay(300));
    }
    const scheduledReport: Report = { ...report, status: 'scheduled' };
    this.reports.push(scheduledReport);
    return of(scheduledReport).pipe(delay(300));
  }

  private getReportDataByType(type: string, filter: ReportFilter): any {
    switch (type) {
      case 'progress': return this.createProgressReportData(filter);
      case 'resource': return this.createResourceReportData(filter);
      case 'budget': return this.createBudgetReportData(filter);
      case 'workforce': return this.createWorkforceReportData(filter);
      case 'procurement': return this.createProcurementReportData(filter);
      default: return {};
    }
  }

  private createProgressReportData(filter: Partial<ReportFilter>): ProgressReportData {
    let risks = [
      { id: 'r1', description: 'Weather delays', severity: 'medium' as const, impact: 0.7, probability: 0.6, mitigation: 'Weather monitoring and flexible scheduling' },
      { id: 'r2', description: 'Supply chain issues', severity: 'high' as const, impact: 0.9, probability: 0.4, mitigation: 'Alternative suppliers identified' },
      { id: 'r3', description: 'Labor shortage', severity: 'medium' as const, impact: 0.6, probability: 0.5, mitigation: 'Training programs and recruitment' }
    ];

    return {
      projectName: 'BuildTrack Construction Project',
      overallProgress: 65,
      phaseProgress: [
        { name: 'Foundation', progress: 100, startDate: new Date('2026-01-01'), endDate: new Date('2026-02-15'), status: 'completed' },
        { name: 'Structure', progress: 85, startDate: new Date('2026-02-16'), endDate: new Date('2026-04-30'), status: 'on-track' },
        { name: 'Interior', progress: 60, startDate: new Date('2026-05-01'), endDate: new Date('2026-07-15'), status: 'on-track' },
        { name: 'Finishing', progress: 30, startDate: new Date('2026-07-16'), endDate: new Date('2026-09-30'), status: 'at-risk' }
      ],
      tasksCompleted: 130,
      tasksTotal: 200,
      milestonesAchieved: 5,
      milestonesTotal: 8,
      timelineStatus: 'On Track',
      risks: risks,
      weeklyProgress: [
        { week: 'Week 1', planned: 15, actual: 15, variance: 0 },
        { week: 'Week 2', planned: 18, actual: 17, variance: -1 },
        { week: 'Week 3', planned: 22, actual: 22, variance: 0 },
        { week: 'Week 4', planned: 28, actual: 27, variance: -1 },
        { week: 'Week 5', planned: 32, actual: 33, variance: 1 },
        { week: 'Week 6', planned: 38, actual: 38, variance: 0 }
      ],
      completionForecast: 'October 15, 2026 (On Schedule)',
      delayedTasks: [
        { id: 't1', name: 'Electrical Wiring', delayedDays: 5, reason: 'Material delay', impact: 'Minor schedule impact' },
        { id: 't2', name: 'Plumbing Installation', delayedDays: 3, reason: 'Weather', impact: 'Schedule adjustment needed' }
      ]
    };
  }

  private createResourceReportData(filter: Partial<ReportFilter>): ResourceReportData {
    let resourcesByType = [
      { type: 'Heavy Equipment', count: 30, utilization: 75, status: 'Active' },
      { type: 'Tools', count: 60, utilization: 50, status: 'Active' },
      { type: 'Vehicles', count: 25, utilization: 68, status: 'Active' },
      { type: 'Safety Equipment', count: 35, utilization: 40, status: 'Maintenance' }
    ];

    if (filter.category && filter.category !== 'all') {
      resourcesByType = resourcesByType.filter(r => r.type.toLowerCase().includes(filter.category!.toLowerCase()));
    }

    return {
      totalResources: 150,
      resourcesByType: resourcesByType,
      utilizationRate: 56.7,
      availableResources: 45,
      allocatedResources: 85,
      resourceEfficiency: 82,
      topUsedResources: [
        { name: 'Excavator', usage: 85, availability: 90, efficiency: 88 },
        { name: 'Crane', usage: 75, availability: 85, efficiency: 82 },
        { name: 'Concrete Mixer', usage: 70, availability: 80, efficiency: 76 }
      ],
      maintenanceSchedule: [
        { resource: 'Excavator', lastMaintenance: new Date('2026-06-15'), nextMaintenance: new Date('2026-08-15'), status: 'Scheduled' },
        { resource: 'Crane', lastMaintenance: new Date('2026-06-20'), nextMaintenance: new Date('2026-08-20'), status: 'Scheduled' },
        { resource: 'Generator', lastMaintenance: new Date('2026-07-01'), nextMaintenance: new Date('2026-09-01'), status: 'Due Soon' }
      ],
      resourceAllocation: [
        { project: 'Project Alpha', resources: 45, utilization: 78 },
        { project: 'Project Beta', resources: 30, utilization: 65 },
        { project: 'Project Gamma', resources: 25, utilization: 55 }
      ]
    };
  }

  private createBudgetReportData(filter: Partial<ReportFilter>): BudgetReportData {
    return {
      totalBudget: 2500000,
      totalSpent: 1625000,
      remainingBudget: 875000,
      budgetUtilization: 65,
      categoryBreakdown: [
        { category: 'Materials', planned: 800000, actual: 750000, variance: 50000, percentage: 30 },
        { category: 'Labor', planned: 900000, actual: 950000, variance: -50000, percentage: 38 },
        { category: 'Equipment', planned: 500000, actual: 480000, variance: 20000, percentage: 19 },
        { category: 'Overhead', planned: 300000, actual: 320000, variance: -20000, percentage: 13 }
      ],
      monthlySpending: [
        { month: 'Jan', amount: 180000, forecast: 190000, variance: -10000 },
        { month: 'Feb', amount: 220000, forecast: 210000, variance: 10000 },
        { month: 'Mar', amount: 250000, forecast: 260000, variance: -10000 },
        { month: 'Apr', amount: 280000, forecast: 270000, variance: 10000 },
        { month: 'May', amount: 260000, forecast: 280000, variance: -20000 },
        { month: 'Jun', amount: 315000, forecast: 300000, variance: 15000 }
      ],
      costVariance: -125000,
      budgetStatus: 'Over Budget by 5%',
      topExpenses: [
        { id: 'e1', description: 'Steel Purchase', amount: 45000, date: new Date('2026-07-08'), category: 'Materials', vendor: 'ABC Steel' },
        { id: 'e2', description: 'Labor Payment', amount: 32000, date: new Date('2026-07-07'), category: 'Labor', vendor: 'Staff' },
        { id: 'e3', description: 'Equipment Rental', amount: 15000, date: new Date('2026-07-06'), category: 'Equipment', vendor: 'Rental Co' }
      ],
      budgetForecast: [
        { month: 'Jul', projected: 320000, actual: 315000, variance: 5000 },
        { month: 'Aug', projected: 310000, actual: 0, variance: 0 },
        { month: 'Sep', projected: 290000, actual: 0, variance: 0 }
      ]
    };
  }

  private createWorkforceReportData(filter: Partial<ReportFilter>): WorkforceReportData {
    let departments = [
      { name: 'Construction', employees: 45, attendance: 92, productivity: 85, overtime: 120 },
      { name: 'Finishing', employees: 30, attendance: 88, productivity: 78, overtime: 80 },
      { name: 'Electrical', employees: 20, attendance: 90, productivity: 82, overtime: 60 },
      { name: 'Plumbing', employees: 15, attendance: 85, productivity: 75, overtime: 45 },
      { name: 'Management', employees: 10, attendance: 95, productivity: 90, overtime: 30 }
    ];

    if (filter.department && filter.department !== 'all') {
      departments = departments.filter(d => d.name.toLowerCase() === filter.department!.toLowerCase());
    }

    return {
      totalEmployees: departments.reduce((acc, d) => acc + d.employees, 0),
      departments: departments,
      attendanceRate: 90,
      overtime: departments.reduce((acc, d) => acc + d.overtime, 0),
      payrollTotal: 180000,
      employeeDistribution: [
        { role: 'Engineers', count: 25, percentage: 20.8 },
        { role: 'Technicians', count: 35, percentage: 29.2 },
        { role: 'Operators', count: 30, percentage: 25 },
        { role: 'Supervisors', count: 15, percentage: 12.5 },
        { role: 'Support Staff', count: 15, percentage: 12.5 }
      ],
      attendanceTrend: [
        { date: new Date('2026-07-01'), present: 108, absent: 12, percentage: 90 },
        { date: new Date('2026-07-02'), present: 110, absent: 10, percentage: 92 },
        { date: new Date('2026-07-03'), present: 105, absent: 15, percentage: 88 },
        { date: new Date('2026-07-04'), present: 112, absent: 8, percentage: 93 },
        { date: new Date('2026-07-05'), present: 109, absent: 11, percentage: 91 }
      ],
      shiftSchedule: [
        { shift: 'Morning', employees: 50, startTime: '06:00', endTime: '14:00' },
        { shift: 'Afternoon', employees: 40, startTime: '14:00', endTime: '22:00' },
        { shift: 'Night', employees: 30, startTime: '22:00', endTime: '06:00' }
      ],
      trainingStatus: [
        { type: 'Safety Training', completed: 80, pending: 40, total: 120 },
        { type: 'Technical Skills', completed: 60, pending: 60, total: 120 },
        { type: 'Leadership', completed: 30, pending: 90, total: 120 }
      ]
    };
  }

  private createProcurementReportData(filter: Partial<ReportFilter>): ProcurementReportData {
    let suppliers = [
      { supplier: 'ABC Steel', orders: 25, delivered: 23, onTime: 90, rating: 4.5, cost: 800000 },
      { supplier: 'XYZ Cement', orders: 20, delivered: 18, onTime: 85, rating: 4.0, cost: 560000 },
      { supplier: 'PQR Tools', orders: 15, delivered: 14, onTime: 95, rating: 4.8, cost: 225000 },
      { supplier: 'LMN Electronics', orders: 15, delivered: 12, onTime: 70, rating: 3.5, cost: 330000 }
    ];

    if (filter.supplier && filter.supplier !== 'all') {
      suppliers = suppliers.filter(s => s.supplier.toLowerCase().replace(/[^a-z0-9]/g, '').includes(filter.supplier!.toLowerCase().replace(/[^a-z0-9]/g, '')));
    }

    return {
      totalOrders: 75,
      orderStatus: [
        { status: 'Pending', count: 20, percentage: 26.7 },
        { status: 'Approved', count: 15, percentage: 20 },
        { status: 'Ordered', count: 25, percentage: 33.3 },
        { status: 'Received', count: 45, percentage: 60 },
        { status: 'Cancelled', count: 5, percentage: 6.7 }
      ],
      totalSpent: 850000,
      supplierPerformance: suppliers,
      deliveryTimeline: [
        { order: 'PO-001', orderDate: new Date('2026-07-01'), expectedDate: new Date('2026-07-15'), actualDate: new Date('2026-07-14'), status: 'Delivered' },
        { order: 'PO-002', orderDate: new Date('2026-07-05'), expectedDate: new Date('2026-07-20'), actualDate: new Date('2026-07-18'), status: 'Delivered' },
        { order: 'PO-003', orderDate: new Date('2026-07-10'), expectedDate: new Date('2026-07-25'), actualDate: new Date(), status: 'Pending' }
      ],
      procurementCategories: [
        { name: 'Steel', count: 25, value: 250000, percentage: 29.4 },
        { name: 'Cement', count: 20, value: 180000, percentage: 21.2 },
        { name: 'Tools', count: 15, value: 120000, percentage: 14.1 },
        { name: 'Electronics', count: 10, value: 150000, percentage: 17.6 },
        { name: 'Other', count: 5, value: 150000, percentage: 17.6 }
      ],
      pendingOrders: [
        { id: 'PO-004', supplier: 'ABC Steel', orderDate: new Date('2026-07-12'), expectedDate: new Date('2026-07-26'), overdue: 0, value: 45000 },
        { id: 'PO-005', supplier: 'XYZ Cement', orderDate: new Date('2026-07-15'), expectedDate: new Date('2026-07-29'), overdue: 0, value: 32000 },
        { id: 'PO-006', supplier: 'PQR Tools', orderDate: new Date('2026-07-18'), expectedDate: new Date('2026-08-01'), overdue: 0, value: 15000 }
      ],
      costSavings: [
        { category: 'Steel', plannedCost: 280000, actualCost: 250000, savings: 30000, percentage: 10.7 },
        { category: 'Cement', plannedCost: 200000, actualCost: 180000, savings: 20000, percentage: 10 },
        { category: 'Tools', plannedCost: 130000, actualCost: 120000, savings: 10000, percentage: 7.7 }
      ]
    };
  }

  private generatePDFContent(report: Report): string {
    const dateStr = report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : new Date().toLocaleDateString();
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${report.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 30px; color: #333; }
    h1 { color: #1a237e; border-bottom: 2px solid #1a237e; padding-bottom: 8px; }
    .meta { margin-bottom: 20px; background: #f5f5f5; padding: 12px; border-radius: 6px; }
    .meta p { margin: 4px 0; font-size: 14px; }
    .section { margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
    th { background: #e8eaf6; color: #1a237e; }
  </style>
</head>
<body>
  <h1>BuildTrack - ${report.title}</h1>
  <div class="meta">
    <p><strong>Report ID:</strong> ${report.id}</p>
    <p><strong>Type:</strong> ${report.type.toUpperCase()}</p>
    <p><strong>Generated Date:</strong> ${dateStr}</p>
    <p><strong>Status:</strong> ${report.status}</p>
    <p><strong>Description:</strong> ${report.description}</p>
  </div>
  <div class="section">
    <h2>Report Data Summary</h2>
    <p>${JSON.stringify(report.data, null, 2)}</p>
  </div>
</body>
</html>`;
  }

  private generateExcelContent(report: Report): string {
    const dateStr = report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : new Date().toLocaleDateString();
    let csv = `"Report ID","${report.id}"\n`;
    csv += `"Report Title","${report.title}"\n`;
    csv += `"Type","${report.type}"\n`;
    csv += `"Generated Date","${dateStr}"\n`;
    csv += `"Status","${report.status}"\n\n`;

    if (report.type === 'budget' && report.data?.categoryBreakdown) {
      csv += `"Category","Planned","Actual","Variance","Percentage"\n`;
      report.data.categoryBreakdown.forEach((c: any) => {
        csv += `"${c.category}","${c.planned}","${c.actual}","${c.variance}","${c.percentage}%"\n`;
      });
    } else if (report.type === 'workforce' && report.data?.departments) {
      csv += `"Department","Employees","Attendance %","Productivity %","Overtime Hours"\n`;
      report.data.departments.forEach((d: any) => {
        csv += `"${d.name}","${d.employees}","${d.attendance}%","${d.productivity}%","${d.overtime}"\n`;
      });
    } else if (report.type === 'resource' && report.data?.resourcesByType) {
      csv += `"Type","Count","Utilization %","Status"\n`;
      report.data.resourcesByType.forEach((r: any) => {
        csv += `"${r.type}","${r.count}","${r.utilization}%","${r.status}"\n`;
      });
    } else if (report.type === 'procurement' && report.data?.supplierPerformance) {
      csv += `"Supplier","Orders","Delivered","OnTime %","Rating","Cost"\n`;
      report.data.supplierPerformance.forEach((s: any) => {
        csv += `"${s.supplier}","${s.orders}","${s.delivered}","${s.onTime}%","${s.rating}","${s.cost}"\n`;
      });
    } else if (report.type === 'progress' && report.data?.phaseProgress) {
      csv += `"Phase","Progress %","Status"\n`;
      report.data.phaseProgress.forEach((p: any) => {
        csv += `"${p.name}","${p.progress}%","${p.status}"\n`;
      });
    } else {
      csv += `"Data Key","Value"\n`;
      Object.keys(report.data || {}).forEach(k => {
        csv += `"${k}","${JSON.stringify(report.data[k])}"\n`;
      });
    }

    return csv;
  }
}
