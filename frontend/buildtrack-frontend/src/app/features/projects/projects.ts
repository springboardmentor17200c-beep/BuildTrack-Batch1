import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectForm } from './components/project-form/project-form';

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
  category?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  description?: string;
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

export const DUMMY_PROJECTS: Project[] = [
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
  }
];

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, ProjectForm],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class ProjectsComponent {

  constructor(private router: Router) {}


  /* ---------------- Search / filter state (signals) ---------------- */
  searchQuery = signal('');
  activeFilter = signal<ProjectStatus | 'All'>('All');
  isFilterMenuOpen = signal(false);
  statusDropdownOpenFor = signal<number | null>(null);

  isEditModalOpen = signal(false);
  editingProject = signal<Project | null>(null);

  isAddModalOpen = signal(false);

  allStatuses: ProjectStatus[] = ['Planning', 'Active', 'Delayed', 'Completed'];

  filterOptions: FilterOption[] = [
    { label: 'All Projects', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Planning', value: 'Planning' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Delayed', value: 'Delayed' },
  ];

  /* ---------------- Dummy project data ---------------- */
  projects = signal<Project[]>([...DUMMY_PROJECTS]);

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

  toggleStatusDropdown(projectId: number): void {
    this.statusDropdownOpenFor.update(id => id === projectId ? null : projectId);
  }

  changeStatus(project: Project, newStatus: ProjectStatus): void {
    this.statusDropdownOpenFor.set(null);
    if (project.status === newStatus) return;

    this.projects.update(list =>
      list.map(p => {
        if (p.id !== project.id) return p;
        const progress = newStatus === 'Completed' ? 100 : p.progress;
        return { ...p, status: newStatus, progress };
      })
    );
  }

  addProject(): void {
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  onProjectSave(formData: any): void {
    const maxId = this.projects().length > 0 ? Math.max(...this.projects().map(x => x.id)) : 0;
    
    let progress = 0;
    if (formData.status === 'Completed') progress = 100;

    const p: Project = {
      id: maxId + 1,
      name: formData.name,
      site: formData.client,
      client: formData.client,
      manager: formData.manager,
      managerAvatar: 'https://i.pravatar.cc/40?img=' + Math.floor(Math.random() * 70 + 1),
      status: formData.status as ProjectStatus,
      progress: progress,
      budgetUsed: 0,
      budgetTotal: formData.budget,
      deadline: this.formatDate(formData.endDate),
      category: formData.category,
      startDate: formData.startDate,
      endDate: formData.endDate,
      budget: formData.budget,
      description: formData.description
    };

    this.projects.update(list => [p, ...list]);
    this.closeAddModal();
  }

  formatDate(dateStr: string): string {
    if (dateStr && dateStr.includes('-')) {
      const [y, m, d] = dateStr.split('-');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
    }
    return dateStr;
  }

 viewProject(project: Project): void {
  this.router.navigate(['/projects', project.id], { state: { fromProjects: true } });
}

  editProject(project: Project): void {
    // Map project data to form structure for editing
    const editData = {
      ...project,
      budget: project.budgetTotal, // Map budgetTotal to budget for form
      // Use existing deadline if endDate is not set
      endDate: project.endDate || (project.deadline ? this.parseDateToInput(project.deadline) : '')
    };
    this.editingProject.set(editData as any);
    this.isEditModalOpen.set(true);
  }

  parseDateToInput(dateStr: string): string {
    // Basic parser for "DD MMM YYYY" -> "YYYY-MM-DD"
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const parts = dateStr.split(' ');
    if (parts.length === 3) {
      const d = parts[0].padStart(2, '0');
      const m = (months.indexOf(parts[1]) + 1).toString().padStart(2, '0');
      const y = parts[2];
      return `${y}-${m}-${d}`;
    }
    return '';
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.editingProject.set(null);
  }

  onProjectUpdate(formData: any): void {
    const updated = this.editingProject();
    if (!updated) return;

    this.projects.update(list =>
      list.map(p => {
        if (p.id !== updated.id) return p;
        
        let progress = p.progress;
        if (formData.status === 'Completed') {
          progress = 100;
        }

        return {
          ...p,
          ...formData,
          budgetTotal: formData.budget,
          deadline: formData.endDate ? this.formatDate(formData.endDate) : p.deadline,
          progress
        };
      })
    );
    this.closeEditModal();
  }

  deleteProject(project: Project): void {
    // Hook into the existing delete confirmation flow.
    this.projects.update(list => list.filter(p => p.id !== project.id));
  }

  completeProject(project: Project): void {
    if (project.status === 'Completed') return;
    this.projects.update(list =>
      list.map(p =>
        p.id === project.id
          ? { ...p, progress: 100, status: 'Completed' as ProjectStatus }
          : p
      )
    );
  }

  /** Formats the budget pair as "₹18.4Cr / ₹24Cr" for the table cell. */
  formatBudget(project: Project): string {
    return `₹${project.budgetUsed}Cr / ₹${project.budgetTotal}Cr`;
  }
}
