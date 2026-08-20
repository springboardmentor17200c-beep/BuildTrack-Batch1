import os

filepath = 'frontend/buildtrack-frontend/src/app/services/report.service.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Procurement Template Mapping
content = content.replace("vendorPerformance: vendors.map", "supplierPerformance: vendors.map")
content = content.replace("vendor: v.vendor_name,", "supplier: v.vendor_name,")
content = content.replace("orders: v.total_orders,", "orders: v.total_orders, delivered: v.total_orders, onTime: 95,")

# 2. Update Budget Template to map to projectBudgets
old_budget_rows = """      const expRows = (data.topExpenses || []).map((e: any) => `
        <tr>
          <td style="font-weight: 600;">${e.description}</td>
          <td>${e.category}</td>
          <td>${e.vendor || 'N/A'}</td>
          <td>${fmtDate(e.date)}</td>
          <td class="text-right style-bold">${fmtCurr(e.amount)}</td>
        </tr>
      `).join('');"""

new_budget_rows = """      const expRows = (data.projectBudgets || []).map((e: any) => `
        <tr>
          <td style="font-weight: 600;">${e.project}</td>
          <td class="text-right">${fmtCurr(e.allocated)}</td>
          <td class="text-right">${fmtCurr(e.spent)}</td>
          <td class="text-right ${e.variance < 0 ? 'text-red' : 'text-green'}">${fmtCurr(e.variance)}</td>
          <td class="text-right style-bold">${e.allocated ? Math.round((e.spent/e.allocated)*100) : 0}%</td>
        </tr>
      `).join('');"""
content = content.replace(old_budget_rows, new_budget_rows)

old_budget_table = """        <div class="section-block">
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
        </div>"""

new_budget_table = """        <div class="section-block">
          <h3 class="section-title">Project Budget Allocations</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th class="text-right">Allocated Budget</th>
                <th class="text-right">Total Spent</th>
                <th class="text-right">Remaining Variance</th>
                <th class="text-right">Utilization %</th>
              </tr>
            </thead>
            <tbody>${expRows || '<tr><td colspan="5">No projects recorded</td></tr>'}</tbody>
          </table>
        </div>"""
content = content.replace(old_budget_table, new_budget_table)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
