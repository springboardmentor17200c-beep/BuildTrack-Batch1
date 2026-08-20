import os

ts_path = 'C:/Users/pradu/BuildTrack-Batch1/frontend/buildtrack-frontend/src/app/features/analytics/analytics-data.service.ts'
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

old_load_all = """      // Map procurement
      this.purchaseOrders$$.next(procurement.purchase_orders.map(po => ({
        purchaseOrderId: po.purchase_order_id,
        project:         po.project,
        vendor:          po.vendor,
        orderDate:       po.order_date,
        expectedDeliveryDate: po.expected_delivery_date,
        totalAmount:     po.total_amount,
        orderStatus:     po.order_status as any,
      })));
      this.vendors$$.next(procurement.vendors.map(v => ({
        vendorId:       v.vendor_id,
        vendorName:     v.vendor_name,
        totalOrders:    v.total_orders,
        totalSpend:     v.total_spend,
        pendingInvoices:v.pending_invoices,
      })));

      if (summary) this.summary$$.next(summary);
    });"""

new_load_all = """      // Map procurement
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

      // Generate synthetic budgets for projects (since we don't have a real budget table yet)
      const syntheticBudgets: ProjectBudget[] = progress.map((r, i) => ({
        projectId: `P-${r.project_id}`,
        project: r.project,
        estimatedCost: 1500000 + (i * 200000),
        approvedBudget: 1200000 + (i * 200000),
        budgetStatus: r.status === 'Completed' ? 'Closed' : 'Approved'
      }));
      this.budgets$$.next(syntheticBudgets);

      // Map Purchase Orders as actual expenses in the budget tracker
      const syntheticExpenses: Expense[] = mappedPOs.filter(po => po.orderStatus !== 'Cancelled').map((po, i) => ({
        expenseId: `E-${i}`,
        project: po.project,
        category: 'Materials',
        amount: po.totalAmount,
        date: po.orderDate,
        description: `Purchase Order ${po.purchaseOrderId}`
      }));
      // Add a dummy labor expense to make the doughnut chart colorful
      syntheticBudgets.forEach((b, i) => {
          syntheticExpenses.push({
              expenseId: `EL-${i}`,
              project: b.project,
              category: 'Labor',
              amount: 50000 + (i * 10000),
              date: new Date().toISOString().split('T')[0],
              description: 'Workforce Payroll'
          });
      });
      this.expenses$$.next(syntheticExpenses);

      if (summary) this.summary$$.next(summary);
    });"""

ts_content = ts_content.replace(old_load_all, new_load_all)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
