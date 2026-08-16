import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PurchaseOrderSummary, VendorSummary } from '../models/analytics.model';
import { AnalyticsDataService } from '../analytics-data.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-procurement-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './procurement-analytics.component.html',
  styleUrls: ['./procurement-analytics.component.css'],
})
export class ProcurementAnalyticsComponent implements OnInit {
  purchaseOrders: PurchaseOrderSummary[] = [];
  vendors: VendorSummary[] = [];
  statusBreakdown: { status: PurchaseOrderSummary['orderStatus']; count: number }[] = [];

  totalOrders = 0;
  totalValue = 0;
  pendingInvoices = 0;
  activeVendors = 0;

  // Chart configuration
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'right' },
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [ { data: [] } ]
  };
  public pieChartType: ChartType = 'doughnut';

  constructor(private data: AnalyticsDataService, private location: Location) {}

  ngOnInit(): void {
    this.data.purchaseOrders$.subscribe(orders => {
      this.purchaseOrders = orders;
      this.totalOrders = orders.length;
      this.totalValue = this.data.totalProcurementValue();
      this.statusBreakdown = this.data.orderStatusBreakdown();

      // Update chart
      this.pieChartData = {
        labels: this.statusBreakdown.map(s => s.status),
        datasets: [{
          data: this.statusBreakdown.map(s => s.count),
          backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444']
        }]
      };
    });
    this.data.vendors$.subscribe(vendors => {
      this.vendors = vendors;
      this.activeVendors = vendors.length;
      this.pendingInvoices = this.data.totalPendingInvoices();
    });
  }

  statusClass(status: PurchaseOrderSummary['orderStatus']) {
    return { Pending: 'orange', Confirmed: 'blue', Delivered: 'green', Cancelled: 'red' }[status];
  }

  maxOrderCount(): number {
    return Math.max(1, ...this.statusBreakdown.map(s => s.count));
  }

  goBack(): void {
    this.location.back();
  }
}
