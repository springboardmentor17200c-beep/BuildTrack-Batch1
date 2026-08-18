import { Injectable } from '@angular/core';
import { AnalyticsDataService } from '../analytics/analytics-data.service';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, forkJoin } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MilestoneStatus, Project, ProjectMilestone, ProjectStatus } from './models/projects.model';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'buildtrack_access_token';

/** Shape returned by GET /projects/enriched */
interface ApiProject {
  project_id: number;
  project_name: string;
  description: string | null;
  location: string;
  category: string;
  status: string;
  manager: string;
  client: string;
  start_date: string;
  expected_end_date: string;
  actual_end_date: string | null;
}

/** Shape returned by GET /milestones/enriched */
interface ApiMilestone {
  milestone_id: number;
  project_id: number;
  project_name: string;
  milestone_name: string;
  description: string | null;
  due_date: string;
  completion_date: string | null;
  status: string;
  progress_percentage: number;
}

export interface ProjectCategory { category_id: number; category_name: string; }
export interface ProjectStatusOption { status_id: number; status_name: string; }

function mapProject(a: ApiProject): Project {
  return {
    projectId: `P-${a.project_id}`,
    projectName: a.project_name,
    description: a.description ?? '',
    location: a.location,
    category: a.category as any,
    status: a.status as ProjectStatus,
    manager: a.manager,
    client: a.client,
    startDate: a.start_date,
    expectedEndDate: a.expected_end_date,
    actualEndDate: a.actual_end_date,
  };
}

function mapMilestone(a: ApiMilestone): ProjectMilestone {
  return {
    milestoneId: `M-${a.milestone_id}`,
    projectId: `P-${a.project_id}`,
    projectName: a.project_name,
    milestoneName: a.milestone_name,
    description: a.description ?? '',
    dueDate: a.due_date,
    completionDate: a.completion_date,
    status: a.status as MilestoneStatus,
    progressPercentage: a.progress_percentage || 0,
  };
}

@Injectable({ providedIn: 'root' })
export class ProjectsDataService {
  private readonly projectsUrl   = `${environment.apiUrl}/projects/enriched`;
  private readonly milestonesUrl = `${environment.apiUrl}/milestones/enriched`;
  private readonly projectsBase  = `${environment.apiUrl}/projects`;
  private readonly milestonesBase = `${environment.apiUrl}/milestones`;

  private projects$$  = new BehaviorSubject<Project[]>([]);
  private milestones$$ = new BehaviorSubject<ProjectMilestone[]>([]);

  // Lookup data for forms
  private categories$$ = new BehaviorSubject<ProjectCategory[]>([]);
  private statuses$$   = new BehaviorSubject<ProjectStatusOption[]>([]);

  projects$   = this.projects$$.asObservable();
  milestones$ = this.milestones$$.asObservable();
  categories$ = this.categories$$.asObservable();
  statuses$   = this.statuses$$.asObservable();

  constructor(private http: HttpClient, private analytics: AnalyticsDataService) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem(TOKEN_KEY) ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private handleError<T>(fallback: T) {
    return (err: any): Observable<T> => {
      console.error('[ProjectsDataService]', err);
      return of(fallback);
    };
  }

  loadAll() {
    console.log('[ProjectsDataService] loadAll called');
    forkJoin({
      projects: this.http.get<ApiProject[]>(this.projectsUrl, { headers: this.headers() })
        .pipe(catchError(this.handleError([]))),
      milestones: this.http.get<ApiMilestone[]>(this.milestonesUrl, { headers: this.headers() })
        .pipe(catchError(this.handleError([]))),
      categories: this.http.get<ProjectCategory[]>(`${this.projectsBase}/categories`, { headers: this.headers() })
        .pipe(catchError(this.handleError([]))),
      statuses: this.http.get<ProjectStatusOption[]>(`${this.projectsBase}/statuses`, { headers: this.headers() })
        .pipe(catchError(this.handleError([]))),
    }).subscribe(({ projects, milestones, categories, statuses }) => {
      console.log('[ProjectsDataService] loadAll results:', { categories, statuses });
      this.milestones$$.next(milestones.map(mapMilestone));
      this.projects$$.next(projects.map(mapProject));
      this.categories$$.next(categories);
      this.statuses$$.next(statuses);
    });
  }

  get managers(): string[] {
    return Array.from(new Set(this.projects$$.value.map(p => p.manager)));
  }

  getProjectById(id: string): Project | undefined {
    return this.projects$$.value.find(p => p.projectId === id);
  }

  getProgress(projectId: string): number {
    const rows = this.milestones$$.value.filter(m => m.projectId === projectId);
    if (rows.length === 0) return 0;
    const completedRows = rows.filter(m => m.status === 'Completed');
    const totalPercentage = completedRows.reduce((sum, m) => sum + (m.progressPercentage || 0), 0);
    return Math.min(100, totalPercentage);
  }

  /**
   * createProject — POSTs to the real backend.
   * The form provides string names; we resolve them to IDs here.
   * company_id and manager_id come from the currently logged-in user's session.
   */
  createProject(payload: {
    projectName: string;
    description: string;
    location: string;
    categoryName: string;
    statusName: string;
    managerName: string;
    clientName: string;
    startDate: string;
    expectedEndDate: string;
    companyId: number;
    managerId: number;
    clientId: number;
  }): Observable<any> {
    const category = this.categories$$.value.find(c => c.category_name === payload.categoryName);
    const statusObj = this.statuses$$.value.find(s => s.status_name === payload.statusName);

    if (!category || !statusObj) {
      console.error('Category or status not found', payload.categoryName, payload.statusName);
      return of(null);
    }

    const body = {
      company_id: payload.companyId,
      manager_id: payload.managerId,
      client_id: payload.clientId,
      category_id: category.category_id,
      status_id: statusObj.status_id,
      project_name: payload.projectName,
      description: payload.description,
      location: payload.location,
      start_date: payload.startDate,
      expected_end_date: payload.expectedEndDate,
    };

    return this.http.post(`${this.projectsBase}`, body, { headers: this.headers() }).pipe(
      tap(() => this.loadAll()),     // Reload from DB after save
      catchError(this.handleError(null))
    );
  }

  /** Legacy local-only add — kept for backward compat, now calls createProject internally */
  addProject(project: Project) {
    // Optimistic add so UI feels instant
    this.projects$$.next([project, ...this.projects$$.value]);
  }

  updateProjectStatus(projectId: string, newStatus: ProjectStatus) {
    const numericId = parseInt(projectId.replace('P-', ''), 10);
    const statusObj = this.statuses$$.value.find(s => s.status_name === newStatus);

    // Optimistic UI update
    this.projects$$.next(this.projects$$.value.map(p =>
      p.projectId === projectId
        ? { ...p, status: newStatus, actualEndDate: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : p.actualEndDate }
        : p
    ));

    if (statusObj) {
      this.http.put(
        `${this.projectsBase}/${numericId}`,
        { status_id: statusObj.status_id },
        { headers: this.headers() }
      ).pipe(catchError(this.handleError(null)))
       .subscribe(() => { this.loadAll(); this.analytics.loadAll(); });
    }
  }

  addMilestone(milestone: ProjectMilestone) {
    const numericProjectId = parseInt(milestone.projectId.replace('P-', ''), 10);
    const body = {
      project_id: numericProjectId,
      milestone_name: milestone.milestoneName,
      description: milestone.description,
      due_date: milestone.dueDate,
      status: milestone.status,
      progress_percentage: milestone.progressPercentage || 0
    };
    
    this.http.post(this.milestonesBase, body, { headers: this.headers() }).subscribe({
      next: () => { this.loadAll(); this.analytics.loadAll(); },
      error: err => console.error('Failed to create milestone', err)
    });
  }

  markMilestoneStatus(milestoneId: string, status: MilestoneStatus) {
    const numericId = parseInt(milestoneId.replace('M-', ''), 10);
    const today = new Date().toISOString().split('T')[0];

    this.milestones$$.next(
      this.milestones$$.value.map(m =>
        m.milestoneId === milestoneId
          ? { ...m, status, completionDate: status === 'Completed' ? today : null }
          : m
      )
    );

    this.http.put(
      `${this.milestonesBase}/${numericId}`,
      { status, completion_date: status === 'Completed' ? today : null },
      { headers: this.headers() }
    ).pipe(catchError(this.handleError(null)))
     .subscribe(() => { this.loadAll(); this.analytics.loadAll(); });
  }
}
