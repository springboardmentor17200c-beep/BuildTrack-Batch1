import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, delay, catchError, map } from 'rxjs';
import { switchMap, forkJoin } from 'rxjs';
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

  private reports: Report[] = [];

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('buildtrack_access_token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getReports(): Observable<Report[]> {
    return of(this.reports).pipe(delay(200));
  }

  getReportById(id: string): Observable<Report> {
    const report = this.reports.find(r => r.id === id) || this.reports[0];
    return of({ ...report }).pipe(delay(200));
  }

  generateReport(type: string, filter: ReportFilter): Observable<Report> {
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    const title = `${formattedType} Report - ${new Date().toLocaleDateString()}`;

    return this.getReportDataByType(type, filter).pipe(
      switchMap(data => {
        return this.http.post<Report>(this.apiUrl, { type, title, filter }, { headers: this.headers() }).pipe(
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
      })
    );
  }

  generateProgressReport(filter: ReportFilter): Observable<ProgressReportData> {
    return this.fetchProgressReportData(filter);
  }

  generateResourceReport(filter: ReportFilter): Observable<ResourceReportData> {
    return of(this.createResourceReportData(filter)).pipe(delay(400));
  }

  generateBudgetReport(filter: ReportFilter): Observable<BudgetReportData> {
    return this.fetchBudgetReportData(filter);
  }

  generateWorkforceReport(filter: ReportFilter): Observable<WorkforceReportData> {
    return of(this.createWorkforceReportData(filter)).pipe(delay(400));
  }

  generateProcurementReport(filter: ReportFilter): Observable<ProcurementReportData> {
    return this.fetchProcurementReportData(filter);
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

  private getReportDataByType(type: string, filter: ReportFilter): Observable<any> {
    switch (type) {
      case 'progress': return this.fetchProgressReportData(filter);
      case 'budget': return this.fetchBudgetReportData(filter);
      case 'procurement': return this.fetchProcurementReportData(filter);
      case 'resource': return of(this.createResourceReportData(filter));
      case 'workforce': return of(this.createWorkforceReportData(filter));
      default: return of({});
    }
  }

  private fetchProgressReportData(filter: Partial<ReportFilter>): Observable<ProgressReportData> {
    return this.http.get<any[]>('http://localhost:8000/analytics/progress', { headers: this.headers() }).pipe(
      map(data => {
        const completed = data.filter(d => d.status === 'Completed').length;
        const total = data.length;
        const avg = total ? data.reduce((s, d) => s + d.completion_percentage, 0) / total : 0;
        return {
          projectName: 'All BuildTrack Projects',
          overallProgress: Math.round(avg),
          phaseProgress: data.map(d => ({
            name: d.project,
            progress: d.completion_percentage,
            startDate: new Date(d.start_date || Date.now()),
            endDate: new Date(d.expected_end_date || Date.now()),
            status: d.completion_percentage === 100 ? 'completed' : (d.completion_percentage < 30 ? 'at-risk' : 'on-track')
          })),
          tasksCompleted: completed,
          tasksTotal: total,
          milestonesAchieved: 0,
          milestonesTotal: 0,
          timelineStatus: 'On Track',
          risks: [],
          weeklyProgress: [],
          completionForecast: '',
          delayedTasks: []
        };
      }),
      catchError(() => of(this.createProgressReportData(filter)))
    );
  }

  private fetchBudgetReportData(filter: Partial<ReportFilter>): Observable<BudgetReportData> {
    return this.http.get<any[]>('http://localhost:8000/analytics/budget', { headers: this.headers() }).pipe(
      map(data => {
        const totalBudget = data.reduce((s, d) => s + d.allocated_budget, 0);
        const totalSpent = data.reduce((s, d) => s + d.total_spent, 0);
        const remainingBudget = totalBudget - totalSpent;
        const budgetUtilization = totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0;
        const totalLabour = data.reduce((s, d) => s + d.labour_cost, 0);
        const totalMaterial = data.reduce((s, d) => s + d.material_cost, 0);
        return {
          totalBudget,
          totalSpent,
          remainingBudget,
          budgetUtilization,
          categoryBreakdown: [
            { category: 'Labour', planned: totalBudget * 0.4, actual: totalLabour, variance: (totalBudget * 0.4) - totalLabour, percentage: totalSpent ? Math.round((totalLabour / totalSpent) * 100) : 0 },
            { category: 'Materials', planned: totalBudget * 0.6, actual: totalMaterial, variance: (totalBudget * 0.6) - totalMaterial, percentage: totalSpent ? Math.round((totalMaterial / totalSpent) * 100) : 0 }
          ],
          monthlySpending: [],
          costVariance: totalBudget - totalSpent,
          budgetStatus: 'On Track', topExpenses: [], budgetForecast: [],
          projectBudgets: data.map(d => ({
            project: d.project_name,
            allocated: d.allocated_budget,
            spent: d.total_spent,
            variance: d.remaining
          }))
        } as any;
      }),
      catchError(() => of(this.createBudgetReportData(filter)))
    );
  }

  private fetchProcurementReportData(filter: Partial<ReportFilter>): Observable<ProcurementReportData> {
    return this.http.get<any>('http://localhost:8000/analytics/procurement', { headers: this.headers() }).pipe(
      map(data => {
        const pos = data.purchase_orders || [];
        const vendors = data.vendors || [];
        const totalValue = pos.reduce((s: number, po: any) => s + po.total_amount, 0);
        return {
          totalOrders: pos.length,
          totalValue,
          activeVendors: vendors.length,
          delayedOrders: pos.filter((po: any) => po.order_status === 'Pending').length,
          orderStatus: [
            { status: 'Delivered', count: pos.filter((po: any) => po.order_status === 'Delivered').length },
            { status: 'Pending', count: pos.filter((po: any) => po.order_status === 'Pending').length },
            { status: 'Confirmed', count: pos.filter((po: any) => po.order_status === 'Confirmed').length }
          ],
          vendorPerformance: vendors.map((v: any) => ({
            vendor: v.vendor_name,
            orders: v.total_orders,
            value: v.total_spend,
            rating: 4.5
          })),
          totalSpent: totalValue, supplierPerformance: [], deliveryTimeline: [], procurementCategories: [], itemsReceived: 0, averageLeadTime: 0,
          recentOrders: pos.slice(0, 5).map((po: any) => ({
            id: po.purchase_order_id,
            item: po.project,
            vendor: po.vendor,
            date: new Date(po.order_date),
            value: po.total_amount,
            status: po.order_status
          }))
        } as any;
      }),
      catchError(() => of(this.createProcurementReportData(filter)))
    );
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
    const dateStr = report.generatedDate ? new Date(report.generatedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString();
    const data = report.data || {};
    const reportTypeFormatted = (report.type || 'general').toUpperCase();

    // Helper functions for formatting values
    const fmtCurr = (val: number | undefined) => val != null ? '₹' + Number(val).toLocaleString('en-IN') : '₹0';
    const fmtNum = (val: number | undefined) => val != null ? Number(val).toLocaleString() : '0';
    const fmtPct = (val: number | undefined) => val != null ? Number(val).toFixed(1) + '%' : '0%';
    const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

    // Generate specific tables and KPI metrics based on report type
    let kpiCardsHtml = '';
    let reportTablesHtml = '';

    if (report.type === 'resource') {
      kpiCardsHtml = `
        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Total Assets</span>
            <span class="kpi-val">${fmtNum(data.totalResources || 150)}</span>
            <span class="kpi-sub">Company fleet & equipment</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Utilization Rate</span>
            <span class="kpi-val green">${fmtPct(data.utilizationRate || 56.7)}</span>
            <span class="kpi-sub">Active fleet deployment</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Available Assets</span>
            <span class="kpi-val blue">${fmtNum(data.availableResources || 45)}</span>
            <span class="kpi-sub">Ready for assignment</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Fleet Efficiency</span>
            <span class="kpi-val purple">${fmtPct(data.resourceEfficiency || 82)}</span>
            <span class="kpi-sub">Operational efficiency score</span>
          </div>
        </div>
      `;

      const typeRows = (data.resourcesByType || []).map((r: any) => `
        <tr>
          <td style="font-weight: 600;">${r.type}</td>
          <td class="text-right">${r.count}</td>
          <td class="text-right">${r.utilization}%</td>
          <td><span class="badge ${r.status === 'Active' ? 'badge-green' : 'badge-amber'}">${r.status}</span></td>
        </tr>
      `).join('');

      const topRows = (data.topUsedResources || []).map((r: any) => `
        <tr>
          <td style="font-weight: 600;">${r.name}</td>
          <td class="text-right">${r.usage}%</td>
          <td class="text-right">${r.availability}%</td>
          <td class="text-right">${r.efficiency}%</td>
        </tr>
      `).join('');

      const maintRows = (data.maintenanceSchedule || []).map((m: any) => `
        <tr>
          <td style="font-weight: 600;">${m.resource}</td>
          <td>${fmtDate(m.lastMaintenance)}</td>
          <td>${fmtDate(m.nextMaintenance)}</td>
          <td><span class="badge ${m.status === 'Scheduled' ? 'badge-blue' : 'badge-amber'}">${m.status}</span></td>
        </tr>
      `).join('');

      reportTablesHtml = `
        <div class="section-block">
          <h3 class="section-title">Equipment Categories & Fleet Utilization</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Category / Type</th>
                <th class="text-right">Asset Count</th>
                <th class="text-right">Utilization Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${typeRows || '<tr><td colspan="4">No category data available</td></tr>'}</tbody>
          </table>
        </div>

        <div class="section-block">
          <h3 class="section-title">Top Utilized Fleet Assets</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Equipment Name</th>
                <th class="text-right">Usage Rate</th>
                <th class="text-right">Availability</th>
                <th class="text-right">Efficiency Score</th>
              </tr>
            </thead>
            <tbody>${topRows || '<tr><td colspan="4">No asset data available</td></tr>'}</tbody>
          </table>
        </div>

        <div class="section-block">
          <h3 class="section-title">Fleet Maintenance Schedule</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Last Service Date</th>
                <th>Next Scheduled Service</th>
                <th>Service Status</th>
              </tr>
            </thead>
            <tbody>${maintRows || '<tr><td colspan="4">No maintenance scheduled</td></tr>'}</tbody>
          </table>
        </div>
      `;
    } else if (report.type === 'budget') {
      kpiCardsHtml = `
        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Approved Budget</span>
            <span class="kpi-val">${fmtCurr(data.totalBudget || 2500000)}</span>
            <span class="kpi-sub">Total project allocation</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Total Spent</span>
            <span class="kpi-val blue">${fmtCurr(data.totalSpent || 1625000)}</span>
            <span class="kpi-sub">Actual incurred expenditure</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Remaining Budget</span>
            <span class="kpi-val green">${fmtCurr(data.remainingBudget || 875000)}</span>
            <span class="kpi-sub">Available capital balance</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Budget Utilization</span>
            <span class="kpi-val purple">${fmtPct(data.budgetUtilization || 65)}</span>
            <span class="kpi-sub">${data.budgetStatus || 'On Track'}</span>
          </div>
        </div>
      `;

      const catRows = (data.categoryBreakdown || []).map((c: any) => `
        <tr>
          <td style="font-weight: 600;">${c.category}</td>
          <td class="text-right">${fmtCurr(c.planned)}</td>
          <td class="text-right">${fmtCurr(c.actual)}</td>
          <td class="text-right ${c.variance < 0 ? 'text-red' : 'text-green'}">${fmtCurr(c.variance)}</td>
          <td class="text-right">${c.percentage}%</td>
        </tr>
      `).join('');

      const expRows = (data.topExpenses || []).map((e: any) => `
        <tr>
          <td style="font-weight: 600;">${e.description}</td>
          <td>${e.category}</td>
          <td>${e.vendor || 'N/A'}</td>
          <td>${fmtDate(e.date)}</td>
          <td class="text-right style-bold">${fmtCurr(e.amount)}</td>
        </tr>
      `).join('');

      reportTablesHtml = `
        <div class="section-block">
          <h3 class="section-title">Cost Category Breakdown</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Category</th>
                <th class="text-right">Planned Budget</th>
                <th class="text-right">Actual Spend</th>
                <th class="text-right">Variance</th>
                <th class="text-right">Allocation %</th>
              </tr>
            </thead>
            <tbody>${catRows || '<tr><td colspan="5">No cost data available</td></tr>'}</tbody>
          </table>
        </div>

        <div class="section-block">
          <h3 class="section-title">Recent Major Expenditure</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Expense Item</th>
                <th>Category</th>
                <th>Vendor / Contractor</th>
                <th>Date</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>${expRows || '<tr><td colspan="5">No expenses recorded</td></tr>'}</tbody>
          </table>
        </div>
      `;
    } else if (report.type === 'progress') {
      kpiCardsHtml = `
        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Overall Progress</span>
            <span class="kpi-val green">${fmtPct(data.overallProgress || 65)}</span>
            <span class="kpi-sub">Weighted completion</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Tasks Completed</span>
            <span class="kpi-val blue">${data.tasksCompleted || 130} / ${data.tasksTotal || 200}</span>
            <span class="kpi-sub">Work items finished</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Milestones Achieved</span>
            <span class="kpi-val purple">${data.milestonesAchieved || 5} / ${data.milestonesTotal || 8}</span>
            <span class="kpi-sub">Project milestones</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Schedule Status</span>
            <span class="kpi-val">${data.timelineStatus || 'On Track'}</span>
            <span class="kpi-sub">Target: ${data.completionForecast || 'Oct 2026'}</span>
          </div>
        </div>
      `;

      const phaseRows = (data.phaseProgress || []).map((p: any) => `
        <tr>
          <td style="font-weight: 600;">${p.name}</td>
          <td class="text-right">${p.progress}%</td>
          <td>${fmtDate(p.startDate)}</td>
          <td>${fmtDate(p.endDate)}</td>
          <td><span class="badge ${p.status === 'completed' ? 'badge-green' : p.status === 'at-risk' ? 'badge-red' : 'badge-blue'}">${p.status}</span></td>
        </tr>
      `).join('');

      const riskRows = (data.risks || []).map((r: any) => `
        <tr>
          <td style="font-weight: 600;">${r.description}</td>
          <td><span class="badge ${r.severity === 'high' ? 'badge-red' : 'badge-amber'}">${r.severity}</span></td>
          <td>${r.mitigation}</td>
        </tr>
      `).join('');

      reportTablesHtml = `
        <div class="section-block">
          <h3 class="section-title">Construction Phases & Milestone Progress</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Phase Name</th>
                <th class="text-right">Completion %</th>
                <th>Start Date</th>
                <th>Target Completion</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${phaseRows || '<tr><td colspan="5">No phase progress data available</td></tr>'}</tbody>
          </table>
        </div>

        <div class="section-block">
          <h3 class="section-title">Risk Assessment & Mitigation Strategy</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Identified Risk Description</th>
                <th>Severity</th>
                <th>Mitigation Action Plan</th>
              </tr>
            </thead>
            <tbody>${riskRows || '<tr><td colspan="3">No active risks logged</td></tr>'}</tbody>
          </table>
        </div>
      `;
    } else if (report.type === 'workforce') {
      kpiCardsHtml = `
        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Active Workforce</span>
            <span class="kpi-val">${data.totalEmployees || 120}</span>
            <span class="kpi-sub">Total site personnel</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Attendance Rate</span>
            <span class="kpi-val green">${fmtPct(data.attendanceRate || 90)}</span>
            <span class="kpi-sub">Daily site presence</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Overtime Hours</span>
            <span class="kpi-val amber">${fmtNum(data.overtime || 335)} hrs</span>
            <span class="kpi-sub">Monthly overtime count</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Monthly Payroll</span>
            <span class="kpi-val blue">${fmtCurr(data.payrollTotal || 180000)}</span>
            <span class="kpi-sub">Labor expenditure</span>
          </div>
        </div>
      `;

      const deptRows = (data.departments || []).map((d: any) => `
        <tr>
          <td style="font-weight: 600;">${d.name}</td>
          <td class="text-right">${d.employees}</td>
          <td class="text-right">${d.attendance}%</td>
          <td class="text-right">${d.productivity}%</td>
          <td class="text-right">${d.overtime} hrs</td>
        </tr>
      `).join('');

      reportTablesHtml = `
        <div class="section-block">
          <h3 class="section-title">Departmental Performance & Workforce Distribution</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Department</th>
                <th class="text-right">Staff Count</th>
                <th class="text-right">Attendance %</th>
                <th class="text-right">Productivity Score</th>
                <th class="text-right">Overtime Hours</th>
              </tr>
            </thead>
            <tbody>${deptRows || '<tr><td colspan="5">No department data available</td></tr>'}</tbody>
          </table>
        </div>
      `;
    } else if (report.type === 'procurement') {
      kpiCardsHtml = `
        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Total Orders</span>
            <span class="kpi-val">${data.totalOrders || 75}</span>
            <span class="kpi-sub">Issued purchase orders</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Total Spend</span>
            <span class="kpi-val blue">${fmtCurr(data.totalSpent || 850000)}</span>
            <span class="kpi-sub">Material procurement cost</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Active Suppliers</span>
            <span class="kpi-val purple">4</span>
            <span class="kpi-sub">Verified vendors</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">On-Time Delivery</span>
            <span class="kpi-val green">88.5%</span>
            <span class="kpi-sub">Fulfillment reliability</span>
          </div>
        </div>
      `;

      const supRows = (data.supplierPerformance || []).map((s: any) => `
        <tr>
          <td style="font-weight: 600;">${s.supplier}</td>
          <td class="text-right">${s.orders}</td>
          <td class="text-right">${s.delivered}</td>
          <td class="text-right">${s.onTime}%</td>
          <td class="text-right">⭐ ${s.rating}</td>
          <td class="text-right style-bold">${fmtCurr(s.cost)}</td>
        </tr>
      `).join('');

      reportTablesHtml = `
        <div class="section-block">
          <h3 class="section-title">Supplier Performance & Fulfillment Summary</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Supplier / Vendor</th>
                <th class="text-right">Orders Placed</th>
                <th class="text-right">Orders Delivered</th>
                <th class="text-right">On-Time %</th>
                <th class="text-right">Rating</th>
                <th class="text-right">Total Order Value</th>
              </tr>
            </thead>
            <tbody>${supRows || '<tr><td colspan="6">No supplier performance data available</td></tr>'}</tbody>
          </table>
        </div>
      `;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${report.title}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 24px;
      color: #1e293b;
      background: #ffffff;
      font-size: 13px;
      line-height: 1.5;
    }
    
    /* Header Banner */
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin: 0 0 4px 0;
    }
    .brand-title span { color: #2563eb; }
    .report-name {
      font-size: 16px;
      font-weight: 600;
      color: #475569;
      margin: 0;
    }
    .header-meta {
      text-align: right;
      font-size: 12px;
      color: #64748b;
    }
    .badge-hdr {
      display: inline-block;
      padding: 4px 10px;
      background: #eff6ff;
      color: #1d4ed8;
      font-weight: 700;
      font-size: 11px;
      border-radius: 4px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    /* Executive Meta Bar */
    .meta-bar {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 24px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .meta-item label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .meta-item span {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
    }

    /* KPI Cards Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 28px;
    }
    .kpi-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .kpi-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 6px;
    }
    .kpi-val {
      display: block;
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;

      &.blue { color: #2563eb; }
      &.green { color: #16a34a; }
      &.purple { color: #9333ea; }
      &.amber { color: #d97706; }
    }
    .kpi-sub {
      display: block;
      font-size: 11px;
      color: #94a3b8;
      margin-top: 4px;
    }

    /* Section Blocks */
    .section-block {
      margin-bottom: 28px;
    }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 12px 0;
      padding-bottom: 6px;
      border-bottom: 1px solid #cbd5e1;
    }

    /* Data Tables */
    .report-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
    }
    .report-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 10px 12px;
      border-top: 1px solid #cbd5e1;
      border-bottom: 2px solid #cbd5e1;
      text-transform: uppercase;
      font-size: 11px;
    }
    .report-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    .report-table tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .text-right { text-align: right; }
    .style-bold { font-weight: 700; color: #0f172a; }
    .text-green { color: #16a34a; font-weight: 600; }
    .text-red { color: #dc2626; font-weight: 600; }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;

      &.badge-green { background: #dcfce7; color: #15803d; }
      &.badge-blue { background: #dbeafe; color: #1d4ed8; }
      &.badge-amber { background: #fef3c7; color: #b45309; }
      &.badge-red { background: #fee2e2; color: #b91c1c; }
    }

    /* Report Footer */
    .report-footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #94a3b8;
    }

    @media print {
      body { padding: 0; }
      .kpi-card, .meta-bar { break-inside: avoid; }
      .report-table tr { break-inside: avoid; }
    }
  </style>
</head>
<body>

  <!-- Report Header -->
  <div class="report-header">
    <div>
      <h1 class="brand-title">Build<span>Track</span></h1>
      <h2 class="report-name">${report.title}</h2>
    </div>
    <div class="header-meta">
      <div class="badge-hdr">${reportTypeFormatted} REPORT</div>
      <div><strong>Date:</strong> ${dateStr}</div>
      <div><strong>Report ID:</strong> ${report.id}</div>
    </div>
  </div>

  <!-- Executive Meta Bar -->
  <div class="meta-bar">
    <div class="meta-item">
      <label>Report Type</label>
      <span>${reportTypeFormatted}</span>
    </div>
    <div class="meta-item">
      <label>Status</label>
      <span style="text-transform: capitalize;">${report.status}</span>
    </div>
    <div class="meta-item">
      <label>Generated Date</label>
      <span>${dateStr}</span>
    </div>
    <div class="meta-item">
      <label>Scope / Filter</label>
      <span>${report.description || 'Full Project Scope'}</span>
    </div>
  </div>

  <!-- KPI Key Metrics Grid -->
  ${kpiCardsHtml}

  <!-- Formatted Data Tables -->
  ${reportTablesHtml}

  <!-- Report Footer -->
  <div class="report-footer">
    <div>Generated automatically by <strong>BuildTrack Construction Management Platform</strong></div>
    <div>Confidential • For Internal Authorized Use Only</div>
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
