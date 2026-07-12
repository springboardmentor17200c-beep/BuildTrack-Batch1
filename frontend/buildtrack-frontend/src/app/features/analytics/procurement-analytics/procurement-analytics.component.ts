import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PurchaseOrderSummary, VendorSummary } from '../models/analytics.model';
import { AnalyticsDataService } from '../analytics-data.service';

@Component({
  selector: 'app-procurement-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

  constructor(private data: AnalyticsDataService, private location: Location) {}

  ngOnInit(): void {
    this.data.purchaseOrders$.subscribe(orders => {
      this.purchaseOrders = orders;
      this.totalOrders = orders.length;
      this.totalValue = this.data.totalProcurementValue();
      this.statusBreakdown = this.data.orderStatusBreakdown();
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
