import os

filepath = 'frontend/buildtrack-frontend/src/app/services/report.service.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
content = content.replace("from 'rxjs';", "from 'rxjs';\nimport { switchMap, forkJoin } from 'rxjs';")

# 2. Replace `generateReport`
gen_report_old = """  generateReport(type: string, filter: ReportFilter): Observable<Report> {
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
  }"""

gen_report_new = """  generateReport(type: string, filter: ReportFilter): Observable<Report> {
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    const title = `${formattedType} Report - ${new Date().toLocaleDateString()}`;

    return this.getReportDataByType(type, filter).pipe(
      switchMap(data => {
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
      })
    );
  }"""
content = content.replace(gen_report_old, gen_report_new)


# 3. Replace `getReportDataByType`
get_data_old = """  private getReportDataByType(type: string, filter: ReportFilter): any {
    switch (type) {
      case 'progress': return this.createProgressReportData(filter);
      case 'resource': return this.createResourceReportData(filter);
      case 'budget': return this.createBudgetReportData(filter);
      case 'workforce': return this.createWorkforceReportData(filter);
      case 'procurement': return this.createProcurementReportData(filter);
      default: return {};
    }
  }"""

get_data_new = """  private getReportDataByType(type: string, filter: ReportFilter): Observable<any> {
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
    return this.http.get<any[]>('http://localhost:8000/analytics/progress').pipe(
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
    return this.http.get<any[]>('http://localhost:8000/analytics/budget').pipe(
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
          projectBudgets: data.map(d => ({
            project: d.project_name,
            allocated: d.allocated_budget,
            spent: d.total_spent,
            variance: d.remaining
          }))
        };
      }),
      catchError(() => of(this.createBudgetReportData(filter)))
    );
  }

  private fetchProcurementReportData(filter: Partial<ReportFilter>): Observable<ProcurementReportData> {
    return this.http.get<any>('http://localhost:8000/analytics/procurement').pipe(
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
          recentOrders: pos.slice(0, 5).map((po: any) => ({
            id: po.purchase_order_id,
            item: po.project,
            vendor: po.vendor,
            date: new Date(po.order_date),
            value: po.total_amount,
            status: po.order_status
          }))
        };
      }),
      catchError(() => of(this.createProcurementReportData(filter)))
    );
  }"""

content = content.replace(get_data_old, get_data_new)

# 4. Also update generateBudgetReport etc. just in case they are called directly
content = content.replace("  generateProgressReport(filter: ReportFilter): Observable<ProgressReportData> {\n    return of(this.createProgressReportData(filter)).pipe(delay(400));\n  }", "  generateProgressReport(filter: ReportFilter): Observable<ProgressReportData> {\n    return this.fetchProgressReportData(filter);\n  }")
content = content.replace("  generateBudgetReport(filter: ReportFilter): Observable<BudgetReportData> {\n    return of(this.createBudgetReportData(filter)).pipe(delay(400));\n  }", "  generateBudgetReport(filter: ReportFilter): Observable<BudgetReportData> {\n    return this.fetchBudgetReportData(filter);\n  }")
content = content.replace("  generateProcurementReport(filter: ReportFilter): Observable<ProcurementReportData> {\n    return of(this.createProcurementReportData(filter)).pipe(delay(400));\n  }", "  generateProcurementReport(filter: ReportFilter): Observable<ProcurementReportData> {\n    return this.fetchProcurementReportData(filter);\n  }")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
