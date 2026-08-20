import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AnalyticsDataService } from '../analytics-data.service';
import { ResourceDataService } from '../../resource-management/resource-data.service';
import { ReportService } from '../../../services/report.service';
import { } from '../../shared/sidebar/app-sidebar.component';


interface AnalyticsOption {
  title: string;
  description: string;
  icon: string;
  route: string;
  accent: string;
  stat: string;
  statLabel: string;
}

@Component({
  selector: 'app-analytics-hub',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './analytics-hub.component.html',
  styleUrls: ['./analytics-hub.component.css'],
})
export class AnalyticsHubComponent implements OnInit {
  budgetUsedPercent = 0;
  activeProjects = 0;
  avgProgress = 0;
  procurementValue = 0;

  options: AnalyticsOption[] = [
    {
      title: 'Budget Analytics',
      description: 'Approved budget vs. actual spend, broken down by cost category and project.',
      icon: 'budget',
      route: 'budget',
      accent: 'blue',
      stat: '0',
      statLabel: 'Active budgets',
    },
    {
      title: 'Project Progress Analytics',
      description: 'Completion percentage, lifecycle status, and category breakdown across all projects.',
      icon: 'progress',
      route: 'progress',
      accent: 'green',
      stat: '0',
      statLabel: 'Projects tracked',
    },
    {
      title: 'Resource Analytics',
      description: 'Equipment utilization and availability across the entire company fleet.',
      icon: 'resource',
      route: 'resources',
      accent: 'purple',
      stat: '0',
      statLabel: 'Tracked assets',
    },
    {
      title: 'Procurement Analytics',
      description: 'Vendor spend, order status, and pending invoices across all purchase orders.',
      icon: 'procurement',
      route: 'procurement',
      accent: 'orange',
      stat: '0',
      statLabel: 'Active vendors',
    },
    {
      title: 'Reports & Documentation',
      description: 'Generate, view, and export PDF/Excel reports for progress, budget, resources, and workforce.',
      icon: 'report',
      route: 'reports',
      accent: 'blue',
      stat: '0',
      statLabel: 'Reports available',
    },
  ];

  constructor(
    private router: Router, 
    private data: AnalyticsDataService, 
    private resourceData: ResourceDataService,
    private reportService: ReportService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const approved = this.data.totalApprovedBudget();
    const spent = this.data.totalSpent();
    this.budgetUsedPercent = approved ? Math.round((spent / approved) * 100) : 0;

    this.data.budgets$.subscribe(b => {
      this.options[0].stat = b.length.toString();
    });

    this.data.progress$.subscribe(rows => {
      this.activeProjects = rows.filter(r => r.status === 'In Progress').length;
      this.avgProgress = rows.length
        ? Math.round(rows.reduce((s, r) => s + r.completionPercentage, 0) / rows.length)
        : 0;
      this.options[1].stat = rows.length.toString();
    });

    this.resourceData.resources$.subscribe(r => {
      this.options[2].stat = r.length.toString();
    });

    this.data.vendors$.subscribe(v => {
      this.options[3].stat = v.length.toString();
    });

    this.reportService.getReports().subscribe(reports => {
      this.options[4].stat = reports.length.toString();
    });

    this.procurementValue = this.data.totalProcurementValue();
  }

  open(route: string) {
    this.router.navigate(['/analytics', route]);
  }

  goBack(): void {
    this.location.back();
  }
}
