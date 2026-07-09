import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
/* ============================================================
   Type shapes for the dummy data used across the template.
   These are presentational only — swap the dummy arrays below
   for real service calls without touching the HTML/CSS.
============================================================= */
interface NavItem {
  key: string;
  label: string;
}

interface StatCard {
  title: string;
  value: string;
  icon: string;        // inline SVG markup
  iconBg: string;       // gradient background for the icon chip
  trendDir: 'up' | 'down';
  trendValue: string;
}

interface ProjectRow {
  name: string;
  site: string;
  manager: string;
  managerAvatar: string;
  progress: number;
  budget: string;
  status: 'Active' | 'Pending' | 'Completed' | 'Delayed';
}

interface ActivityItem {
  type: 'delivery' | 'employee' | 'contractor' | 'inspection' | 'budget';
  title: string;
  detail: string;
  time: string;
}

interface ProgressBar {
  label: string;
  value: number;
  color: string;
}

interface BudgetSlice {
  label: string;
  value: number;
  color: string;
}

interface MonthlyPoint {
  month: string;
  value: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
    constructor(private router: Router) {}

  /* ---------------- Sidebar / navigation state ---------------- */
  sidebarCollapsed = false;
  activeNav = 'dashboard';

  navItems: NavItem[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'projects', label: 'Projects' },
    { key: 'employees', label: 'Employees' },
    { key: 'contractors', label: 'Contractors' },
    { key: 'materials', label: 'Materials' },
    { key: 'machinery', label: 'Machinery' },
    { key: 'budget', label: 'Budget' },
    { key: 'progress', label: 'Site Progress' },
    { key: 'reports', label: 'Reports' },
    { key: 'settings', label: 'Settings' },
  ];

  /* ---------------- Header state ---------------- */
  searchQuery = '';
  today: Date = new Date();
  notificationCount = 5;
  greeting = 'day';

  user = {
    firstName: 'Arjun',
    name: 'Arjun Rao',
    role: 'Project Director',
    avatar: 'https://i.pravatar.cc/80?img=12'
  };

  /* ---------------- Stat cards (dummy data) ---------------- */
  statCards: StatCard[] = [
    {
      title: 'Total Projects',
      value: '128',
      iconBg: 'linear-gradient(135deg,#0A84FF,#2F5BFF)',
      trendDir: 'up',
      trendValue: '8.2%',
      icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 7l3-3h5l2 2h8v13H3V7z" stroke="white" stroke-width="1.8" stroke-linejoin="round"/></svg>`
    },
    {
      title: 'Active Projects',
      value: '76',
      iconBg: 'linear-gradient(135deg,#34C759,#1F9C46)',
      trendDir: 'up',
      trendValue: '4.6%',
      icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>`
    },
    {
      title: 'Employees',
      value: '2,340',
      iconBg: 'linear-gradient(135deg,#64D2FF,#0A84FF)',
      trendDir: 'up',
      trendValue: '2.1%',
      icon: `<svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.2" stroke="white" stroke-width="1.8"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>`
    },
    {
      title: 'Contractors',
      value: '184',
      iconBg: 'linear-gradient(135deg,#FF9F0A,#FF7A00)',
      trendDir: 'down',
      trendValue: '1.3%',
      icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 21V9l8-5 8 5v12" stroke="white" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 21v-6h6v6" stroke="white" stroke-width="1.8"/></svg>`
    },
    {
      title: "Today's Progress",
      value: '68%',
      iconBg: 'linear-gradient(135deg,#AF52DE,#7B2FF7)',
      trendDir: 'up',
      trendValue: '5.4%',
      icon: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" stroke-width="1.8"/><path d="M12 7v5l3.5 2" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>`
    },
    {
      title: 'Budget Used',
      value: '₹42.6Cr',
      iconBg: 'linear-gradient(135deg,#FF3B30,#D6291F)',
      trendDir: 'down',
      trendValue: '3.8%',
      icon: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" stroke-width="1.8"/><path d="M12 7v10M9.5 9.3c0-1.3 1.2-2.3 2.5-2.3s2.5.9 2.5 2c0 3-5 1.6-5 4.5 0 1.2 1.1 2.2 2.5 2.2s2.5-1 2.5-2.2" stroke="white" stroke-width="1.6" stroke-linecap="round"/></svg>`
    },
  ];

  /* ---------------- Project Progress bar chart (dummy) ---------------- */
  projectProgressData: ProgressBar[] = [
    { label: 'Residential', value: 82, color: 'linear-gradient(90deg,#0A84FF,#64D2FF)' },
    { label: 'Commercial', value: 64, color: 'linear-gradient(90deg,#34C759,#8FE39A)' },
    { label: 'Infrastructure', value: 47, color: 'linear-gradient(90deg,#FF9F0A,#FFC773)' },
    { label: 'Industrial', value: 58, color: 'linear-gradient(90deg,#AF52DE,#D5A6F5)' },
    { label: 'Renovation', value: 91, color: 'linear-gradient(90deg,#0A84FF,#2F5BFF)' },
  ];

  /* ---------------- Budget donut chart (dummy) ---------------- */
  budgetUsedPercent = 71;

  budgetLegend: BudgetSlice[] = [
    { label: 'Materials', value: 38, color: '#0A84FF' },
    { label: 'Labor', value: 26, color: '#34C759' },
    { label: 'Machinery', value: 20, color: '#FF9F0A' },
    { label: 'Contingency', value: 16, color: '#AF52DE' },
  ];

  get donutGradient(): string {
    // Build a conic-gradient donut ring from the budget legend slices.
    let cursor = 0;
    const stops = this.budgetLegend.map(slice => {
      const start = cursor;
      cursor += (slice.value / 100) * 360;
      return `${slice.color} ${start}deg ${cursor}deg`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }

  /* ---------------- Monthly progress sparkline (dummy) ---------------- */
  monthlyProgress: MonthlyPoint[] = [
    { month: 'Feb', value: 42 },
    { month: 'Mar', value: 55 },
    { month: 'Apr', value: 48 },
    { month: 'May', value: 66 },
    { month: 'Jun', value: 74 },
    { month: 'Jul', value: 68 },
  ];

  sparklineCoords: { x: number; y: number }[] = [];
  sparklinePoints = '';
  sparklineFillPoints = '';

  /* ---------------- Recent projects table (dummy) ---------------- */
  recentProjects: ProjectRow[] = [
    {
      name: 'Skyline Residency Tower',
      site: 'Whitefield, Bengaluru',
      manager: 'Priya Menon',
      managerAvatar: 'https://i.pravatar.cc/40?img=32',
      progress: 78,
      budget: '₹18.4Cr / ₹24Cr',
      status: 'Active'
    },
    {
      name: 'Riverside Business Park',
      site: 'Gachibowli, Hyderabad',
      manager: 'Karthik Iyer',
      managerAvatar: 'https://i.pravatar.cc/40?img=15',
      progress: 45,
      budget: '₹9.1Cr / ₹20Cr',
      status: 'Pending'
    },
    {
      name: 'Greenfield Metro Extension',
      site: 'Patna Sector 4',
      manager: 'Ananya Sharma',
      managerAvatar: 'https://i.pravatar.cc/40?img=47',
      progress: 100,
      budget: '₹32Cr / ₹32Cr',
      status: 'Completed'
    },
    {
      name: 'Harborview Logistics Hub',
      site: 'Vizag Port Area',
      manager: 'Rohan Desai',
      managerAvatar: 'https://i.pravatar.cc/40?img=8',
      progress: 29,
      budget: '₹6.7Cr / ₹15Cr',
      status: 'Delayed'
    },
    {
      name: 'Emerald Heights Phase II',
      site: 'Baner, Pune',
      manager: 'Sneha Kulkarni',
      managerAvatar: 'https://i.pravatar.cc/40?img=25',
      progress: 63,
      budget: '₹11.2Cr / ₹18Cr',
      status: 'Active'
    },
  ];

  /* ---------------- Recent activities timeline (dummy) ---------------- */
  activities: ActivityItem[] = [
    { type: 'delivery', title: 'Material Delivered', detail: '40 tons of cement arrived at Skyline Residency', time: '10 minutes ago' },
    { type: 'employee', title: 'New Employee Added', detail: 'Vikram Nair joined as Site Supervisor', time: '52 minutes ago' },
    { type: 'contractor', title: 'Contractor Assigned', detail: 'Suresh Electricals assigned to Riverside Park', time: '2 hours ago' },
    { type: 'inspection', title: 'Site Inspection', detail: 'Quality audit completed at Greenfield Metro', time: '4 hours ago' },
    { type: 'budget', title: 'Budget Updated', detail: 'Contingency fund revised for Harborview Hub', time: 'Yesterday' },
  ];

  ngOnInit(): void {
    this.setGreeting();
    this.buildSparkline();
  }

  /* ---------------- UI interaction handlers ---------------- */
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setActive(item: NavItem): void {
  this.activeNav = item.key;

  if (item.key === 'projects') {
    this.router.navigate(['/projects']);
  }

  if (item.key === 'dashboard') {
    this.router.navigate(['/dashboard']);
  }
}
  addProject(): void {
    // Hook into existing "add project" flow / route.
  }

  addEmployee(): void {
    // Hook into existing "add employee" flow / route.
  }

  addMaterial(): void {
    // Hook into existing "add material" flow / route.
  }

  generateReport(): void {
    // Hook into existing "generate report" flow / route.
  }

  /* ---------------- Helpers ---------------- */
  private setGreeting(): void {
    const hour = this.today.getHours();
    if (hour < 12) this.greeting = 'morning';
    else if (hour < 17) this.greeting = 'afternoon';
    else this.greeting = 'evening';
  }

  /** Maps monthlyProgress values onto a 300x110 viewBox for the sparkline. */
  private buildSparkline(): void {
    const width = 300;
    const height = 110;
    const padding = 10;
    const values = this.monthlyProgress.map(m => m.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const step = (width - padding * 2) / (values.length - 1);

    this.sparklineCoords = values.map((v, i) => ({
      x: padding + i * step,
      y: height - padding - ((v - min) / range) * (height - padding * 2)
    }));

    this.sparklinePoints = this.sparklineCoords.map(p => `${p.x},${p.y}`).join(' ');

    // Close the polygon along the bottom edge for the gradient fill under the line.
    this.sparklineFillPoints =
      `${padding},${height - padding} ` +
      this.sparklinePoints +
      ` ${width - padding},${height - padding}`;
  }
}