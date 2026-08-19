import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/analytics/analytics-data.service.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

import re

# Match the old synthetic code
old_synthetic_regex = r"// Generate synthetic budgets.*?this\.expenses\$\$\.next\(syntheticExpenses\);"

new_synthetic = """// Generate synthetic budgets for projects (since we don't have a real budget table yet)
      const syntheticBudgets: ProjectBudget[] = progress.map((r, i) => ({
        budgetId: `B-${r.project_id}`,
        project: r.project,
        estimatedCost: 1500000 + (i * 200000),
        approvedBudget: 1200000 + (i * 200000),
        budgetStatus: r.status === 'Completed' ? 'Closed' : 'Approved'
      }));
      this.budgets$$.next(syntheticBudgets);

      // Map Purchase Orders as actual expenses in the budget tracker
      const syntheticExpenses: Expense[] = mappedPOs.filter(po => po.orderStatus !== 'Cancelled').map((po, i) => {
        const matchingBudget = syntheticBudgets.find(b => b.project === po.project) || syntheticBudgets[0];
        return {
          expenseId: `E-${i}`,
          budgetId: matchingBudget ? matchingBudget.budgetId : 'B-0',
          project: po.project,
          category: 'Material Cost',
          title: `Purchase Order ${po.purchaseOrderId}`,
          amount: po.totalAmount,
          expenseDate: po.orderDate
        };
      });
      
      // Add a dummy labor expense to make the doughnut chart colorful
      syntheticBudgets.forEach((b, i) => {
          syntheticExpenses.push({
              expenseId: `EL-${i}`,
              budgetId: b.budgetId,
              project: b.project,
              category: 'Labor Cost',
              title: 'Workforce Payroll',
              amount: 50000 + (i * 10000),
              expenseDate: new Date().toISOString().split('T')[0]
          });
      });
      this.expenses$$.next(syntheticExpenses);"""

ts_content = re.sub(old_synthetic_regex, new_synthetic, ts_content, flags=re.DOTALL)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
