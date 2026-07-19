import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

/* ============================================================
   Types
   Kept local to the feature — promote to a shared model file
   only if another feature ends up needing the same shape.
============================================================= */
export type ProjectStatus = 'Active' | 'Completed' | 'Delayed' | 'Planning';

export interface Project {
  id: number;
  name: string;
  site: string;
  manager: string;
  managerAvatar: string;
  client: string;
  status: ProjectStatus;
  progress: number;   // 0–100
  budgetUsed: number; // in ₹ Cr
  budgetTotal: number; // in ₹ Cr
  deadline: string;
}

interface KpiCard {
  title: string;
  value: string;
  description: string;
  icon: string;      // inline SVG markup
  accent: string;     // CSS color used for the icon chip + glow
}

interface FilterOption {
  label: string;
  value: ProjectStatus | 'All';
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class ProjectsComponent {

  constructor(private router: Router) {}


  /* ---------------- Search / filter state (signals) ---------------- */
  searchQuery = signal('');
  activeFilter = signal<ProjectStatus | 'All'>('All');
  isFilterMenuOpen = signal(false);

  filterOptions: FilterOption[] = [
    { label: 'All Projects', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Planning', value: 'Planning' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Delayed', value: 'Delayed' },
  ];

  /* ---------------- Dummy project data ---------------- */
  projects = signal<Project[]>([
    {
      id: 1,
      name: 'Skyline Residency Tower',
      site: 'Whitefield, Bengaluru',
      manager: 'Priya Menon',
      managerAvatar: 'https://i.pravatar.cc/40?img=32',
      client: 'L&T Realty',
      status: 'Active',
      progress: 78,
      budgetUsed: 18.4,
      budgetTotal: 24,
      deadline: '12 Oct 2026'
    },
    {
      id: 2,
      name: 'Riverside Business Park',
      site: 'Gachibowli, Hyderabad',
      manager: 'Karthik Iyer',
      managerAvatar: 'https://i.pravatar.cc/40?img=15',
      client: 'NCC Limited',
      status: 'Planning',
      progress: 12,
      budgetUsed: 2.4,
      budgetTotal: 20,
      deadline: '30 Mar 2027'
    },
    {
      id: 3,
      name: 'Greenfield Metro Extension',
      site: 'Patna Sector 4',
      manager: 'Ananya Sharma',
      managerAvatar: 'https://i.pravatar.cc/40?img=47',
      client: 'Bihar State Infra Corp',
      status: 'Completed',
      progress: 100,
      budgetUsed: 32,
      budgetTotal: 32,
      deadline: '05 Jan 2026'
    },
    {
      id: 4,
      name: 'Harborview Logistics Hub',
      site: 'Vizag Port Area',
      manager: 'Rohan Desai',
      managerAvatar: 'https://i.pravatar.cc/40?img=8',
      client: 'Adani Ports',
      status: 'Delayed',
      progress: 29,
      budgetUsed: 6.7,
      budgetTotal: 15,
      deadline: '18 Aug 2026'
    },
    {
      id: 5,
      name: 'Emerald Heights Phase II',
      site: 'Baner, Pune',
      manager: 'Sneha Kulkarni',
      managerAvatar: 'https://i.pravatar.cc/40?img=25',
      client: 'Kolte-Patil Developers',
      status: 'Active',
      progress: 63,
      budgetUsed: 11.2,
      budgetTotal: 18,
      deadline: '22 Dec 2026'
    },
    {
      id: 6,
      name: 'Coastal Highway Bridge',
      site: 'Mangaluru Bypass',
      manager: 'Vikram Nair',
      managerAvatar: 'https://i.pravatar.cc/40?img=52',
      client: 'NHAI',
      status: 'Delayed',
      progress: 41,
      budgetUsed: 9.8,
      budgetTotal: 16,
      deadline: '02 Nov 2026'
    },
    {
      id: 7,
      name: 'Orion IT Park — Block C',
      site: 'Electronic City, Bengaluru',
      manager: 'Divya Reddy',
      managerAvatar: 'https://i.pravatar.cc/40?img=44',
      client: 'RMZ Corp',
      status: 'Active',
      progress: 55,
      budgetUsed: 14.1,
      budgetTotal: 26,
      deadline: '15 Feb 2027'
    },
    {
      id: 8,
      name: 'Sundervan Township',
      site: 'Sarjapur Road, Bengaluru',
      manager: 'Arjun Rao',
      managerAvatar: 'https://i.pravatar.cc/40?img=12',
      client: 'Prestige Group',
      status: 'Planning',
      progress: 8,
      budgetUsed: 1.2,
      budgetTotal: 40,
      deadline: '20 Jul 2027'
    },
  ]);

  /* ---------------- KPI summary cards ---------------- */
  kpiCards = computed<KpiCard[]>(() => {
    const all = this.projects();
    const active = all.filter(p => p.status === 'Active').length;
    const completed = all.filter(p => p.status === 'Completed').length;
    const delayed = all.filter(p => p.status === 'Delayed').length;

    return [
      {
        title: 'Total Projects',
        value: String(all.length),
        description: 'Across all sites',
        accent: 'linear-gradient(135deg,#3B82F6,#2563EB)',
        icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 7l3-3h5l2 2h8v13H3V7z" stroke="white" stroke-width="1.8" stroke-linejoin="round"/></svg>`
      },
      {
        title: 'Active Projects',
        value: String(active),
        description: 'Currently in progress',
        accent: 'linear-gradient(135deg,#10B981,#059669)',
        icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>`
      },
      {
        title: 'Completed Projects',
        value: String(completed),
        description: 'Delivered on scope',
        accent: 'linear-gradient(135deg,#8B5CF6,#7C3AED)',
        icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      },
      {
        title: 'Delayed Projects',
        value: String(delayed),
        description: 'Behind schedule',
        accent: 'linear-gradient(135deg,#F59E0B,#EF4444)',
        icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01" stroke="white" stroke-width="2.2" stroke-linecap="round"/><path d="M10.3 3.9L2.6 18a1.8 1.8 0 001.5 2.7h15.8a1.8 1.8 0 001.5-2.7L13.7 3.9a1.8 1.8 0 00-3.4 0z" stroke="white" stroke-width="1.7" stroke-linejoin="round"/></svg>`
      },
    ];
  });

  /* ---------------- Derived, filtered project list ---------------- */
  filteredProjects = computed<Project[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const filter = this.activeFilter();

    return this.projects().filter(p => {
      const matchesFilter = filter === 'All' || p.status === filter;
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.client.toLowerCase().includes(query) ||
        p.manager.toLowerCase().includes(query) ||
        p.site.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  });

  /* ---------------- UI handlers ---------------- */
  toggleFilterMenu(): void {
    this.isFilterMenuOpen.update(open => !open);
  }

  setFilter(status: ProjectStatus | 'All'): void {
    this.activeFilter.set(status);
    this.isFilterMenuOpen.set(false);
  }

  addProject(): void {
    // Hook into the existing "create project" flow / route / dialog.
  }

 viewProject(project: Project): void {
  this.router.navigate(['/projects', project.id]);
}

  editProject(project: Project): void {
    // Hook into the existing "edit project" flow / route / dialog.
  }

  deleteProject(project: Project): void {
    // Hook into the existing delete confirmation flow.
    this.projects.update(list => list.filter(p => p.id !== project.id));
  }

  /** Formats the budget pair as "₹18.4Cr / ₹24Cr" for the table cell. */
  formatBudget(project: Project): string {
    return `₹${project.budgetUsed}Cr / ₹${project.budgetTotal}Cr`;
  }
}
