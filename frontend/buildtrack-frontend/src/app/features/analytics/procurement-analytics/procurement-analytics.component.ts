import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PurchaseOrderSummary, VendorSummary } from '../models/analytics.model';
import { AnalyticsDataService } from '../analytics-data.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-procurement-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './procurement-analytics.component.html',
  styleUrls: ['./procurement-analytics.component.css'],
})
export class ProcurementAnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('statusChart') statusChartRef!: ElementRef;
  @ViewChild('vendorChart') vendorChartRef!: ElementRef;

  statusChart: any;
  vendorChart: any;

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
      this.updateCharts();
    });
    this.data.vendors$.subscribe(vendors => {
      this.vendors = vendors;
      this.activeVendors = vendors.length;
      this.pendingInvoices = this.data.totalPendingInvoices();
      this.updateCharts();
    });
  }

  ngAfterViewInit() {
    this.initCharts();
  }

  private initCharts() {
    const chartOptions: any = {
      responsive: true,
      maintainAspectRatio: false,
      color: 'rgba(255, 255, 255, 0.7)',
      plugins: {
        legend: { labels: { color: 'rgba(255, 255, 255, 0.7)', font: { family: 'Inter', size: 13 } } },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { family: 'Inter', size: 14 },
          bodyFont: { family: 'Inter', size: 13 },
          padding: 12,
          cornerRadius: 8,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1
        }
      }
    };

    const ctxStatus = this.statusChartRef?.nativeElement;
    if (ctxStatus) {
      this.statusChart = new Chart(ctxStatus, {
        type: 'doughnut',
        data: { 
          labels: [], 
          datasets: [{ 
            data: [], 
            backgroundColor: ['#f97316', '#3b82f6', '#10b981', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 6
          }] 
        },
        options: { 
          ...chartOptions, 
          cutout: '70%',
          plugins: {
            ...chartOptions.plugins,
            legend: { position: 'bottom', labels: { color: 'rgba(255, 255, 255, 0.7)', font: { family: 'Inter', size: 13 }, padding: 20 } }
          }
        }
      });
    }

    const ctxVendor = this.vendorChartRef?.nativeElement;
    if (ctxVendor) {
      const ctx2d = ctxVendor.getContext('2d');
      const gradient = ctx2d.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)');
      gradient.addColorStop(1, 'rgba(56, 189, 248, 0.1)');

      this.vendorChart = new Chart(ctxVendor, {
        type: 'bar',
        data: { 
          labels: [], 
          datasets: [{ 
            label: 'Total Spend (\u20b9)', 
            data: [], 
            backgroundColor: gradient,
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 'flex',
            maxBarThickness: 60,
            hoverBackgroundColor: 'rgba(139, 92, 246, 1)'
          }] 
        },
        options: { 
          ...chartOptions,
          scales: {
            x: { 
              grid: { display: false }, 
              ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { family: 'Inter' } } 
            },
            y: { 
              grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
              ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { family: 'Inter' }, padding: 10 } 
            }
          }
        }
      });
    }
    
    this.updateCharts();
  }

  private updateCharts() {
    if (this.statusChart && this.statusBreakdown.length > 0) {
      this.statusChart.data.labels = this.statusBreakdown.map(s => s.status);
      this.statusChart.data.datasets[0].data = this.statusBreakdown.map(s => s.count);
      this.statusChart.update();
    }

    if (this.vendorChart && this.vendors.length > 0) {
      this.vendorChart.data.labels = this.vendors.map(v => v.vendorName);
      this.vendorChart.data.datasets[0].data = this.vendors.map(v => v.totalSpend);
      this.vendorChart.update();
    }
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
