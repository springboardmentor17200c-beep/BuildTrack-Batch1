import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MilestoneStatus, Project, ProjectMilestone, ProjectStatus } from './models/projects.model';

// NOTE: mock/in-memory data for now. When the FastAPI endpoints are ready,
// replace the arrays below with HttpClient calls against:
//   GET /api/projects
//   GET /api/projects/:id
//   POST /api/projects
//   PATCH /api/projects/:id
//   GET /api/projects/:id/milestones
//   POST /api/projects/:id/milestones
// These project names intentionally match AnalyticsDataService's mock
// project-progress data, so figures stay consistent across modules.

@Injectable({ providedIn: 'root' })
export class ProjectsDataService {
  private projects: Project[] = [
    {
      projectId: 'P-1',
      projectName: 'Skyline Residency Tower',
      description: '32-storey residential tower with podium parking and rooftop amenities.',
      location: 'Whitefield, Bengaluru',
      category: 'Residential',
      status: 'In Progress',
      manager: 'Priya Menon',
      client: 'L&T Realty',
      startDate: '2025-11-01',
      expectedEndDate: '2026-10-12',
      actualEndDate: null,
    },
    {
      projectId: 'P-2',
      projectName: 'Riverside Business Park',
      description: 'Grade-A commercial office park with 4 towers and a central plaza.',
      location: 'Gachibowli, Hyderabad',
      category: 'Commercial',
      status: 'In Progress',
      manager: 'Karthik Iyer',
      client: 'NCC Limited',
      startDate: '2026-02-15',
      expectedEndDate: '2027-03-30',
      actualEndDate: null,
    },
    {
      projectId: 'P-3',
      projectName: 'Greenfield Metro Extension',
      description: 'Elevated metro corridor extension, 6.2 km with 5 stations.',
      location: 'Patna Sector 4',
      category: 'Infrastructure',
      status: 'Completed',
      manager: 'Ananya Sharma',
      client: 'Bihar State Infra Corp',
      startDate: '2024-06-01',
      expectedEndDate: '2026-01-05',
      actualEndDate: '2026-01-02',
    },
    {
      projectId: 'P-4',
      projectName: 'Harborview Logistics Hub',
      description: 'Warehousing and logistics hub with cold storage facility.',
      location: 'Vizag Port Area',
      category: 'Industrial',
      status: 'On Hold',
      manager: 'Rohan Desai',
      client: 'Adani Ports',
      startDate: '2025-09-01',
      expectedEndDate: '2026-08-18',
      actualEndDate: null,
    },
  ];

  private milestones: ProjectMilestone[] = [
    { milestoneId: 'M-1', projectId: 'P-1', projectName: 'Skyline Residency Tower', milestoneName: 'Foundation Complete', description: 'Raft foundation and basement waterproofing.', dueDate: '2026-02-01', completionDate: '2026-01-28', status: 'Completed' },
    { milestoneId: 'M-2', projectId: 'P-1', projectName: 'Skyline Residency Tower', milestoneName: 'Structure Topped Out', description: 'All 32 floors of RCC structure complete.', dueDate: '2026-07-15', completionDate: null, status: 'In Progress' },
    { milestoneId: 'M-3', projectId: 'P-1', projectName: 'Skyline Residency Tower', milestoneName: 'MEP Rough-in Complete', description: 'Electrical, plumbing and HVAC rough-in for all floors.', dueDate: '2026-09-01', completionDate: null, status: 'Pending' },
    { milestoneId: 'M-4', projectId: 'P-2', projectName: 'Riverside Business Park', milestoneName: 'Site Grading Complete', description: 'Earthwork and site leveling across all 4 tower footprints.', dueDate: '2026-04-01', completionDate: '2026-03-30', status: 'Completed' },
    { milestoneId: 'M-5', projectId: 'P-2', projectName: 'Riverside Business Park', milestoneName: 'Tower A Foundation', description: 'Pile foundation for Tower A.', dueDate: '2026-08-01', completionDate: null, status: 'In Progress' },
    { milestoneId: 'M-6', projectId: 'P-3', projectName: 'Greenfield Metro Extension', milestoneName: 'Track Laying Complete', description: 'Ballast-less track across full corridor.', dueDate: '2025-11-15', completionDate: '2025-11-10', status: 'Completed' },
    { milestoneId: 'M-7', projectId: 'P-3', projectName: 'Greenfield Metro Extension', milestoneName: 'Commissioning & Handover', description: 'Signal testing and final handover to operator.', dueDate: '2026-01-05', completionDate: '2026-01-02', status: 'Completed' },
    { milestoneId: 'M-8', projectId: 'P-4', projectName: 'Harborview Logistics Hub', milestoneName: 'Environmental Clearance', description: 'Pending state pollution control board approval.', dueDate: '2026-05-01', completionDate: null, status: 'Pending' },
  ];

  private projects$$ = new BehaviorSubject<Project[]>(this.projects);
  private milestones$$ = new BehaviorSubject<ProjectMilestone[]>(this.milestones);

  projects$ = this.projects$$.asObservable();
  milestones$ = this.milestones$$.asObservable();

  get managers(): string[] {
    return Array.from(new Set(this.projects.map(p => p.manager)));
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.find(p => p.projectId === id);
  }

  /** Completion % derived from that project's milestones — completed / total. */
  getProgress(projectId: string): number {
    const rows = this.milestones.filter(m => m.projectId === projectId);
    if (rows.length === 0) return 0;
    const completed = rows.filter(m => m.status === 'Completed').length;
    return Math.round((completed / rows.length) * 100);
  }

  addProject(project: Project) {
    this.projects = [project, ...this.projects];
    this.projects$$.next(this.projects);
  }

  updateProjectStatus(projectId: string, status: ProjectStatus) {
    this.projects = this.projects.map(p =>
      p.projectId === projectId
        ? { ...p, status, actualEndDate: status === 'Completed' ? '2026-07-12' : p.actualEndDate }
        : p
    );
    this.projects$$.next(this.projects);
  }

  addMilestone(milestone: ProjectMilestone) {
    this.milestones = [milestone, ...this.milestones];
    this.milestones$$.next(this.milestones);
  }

  markMilestoneStatus(milestoneId: string, status: MilestoneStatus) {
    this.milestones = this.milestones.map(m =>
      m.milestoneId === milestoneId
        ? { ...m, status, completionDate: status === 'Completed' ? '2026-07-12' : m.completionDate }
        : m
    );
    this.milestones$$.next(this.milestones);
  }
}
