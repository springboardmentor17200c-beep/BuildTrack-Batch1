import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MilestoneStatus, Project, ProjectMilestone, ProjectStatus } from './models/projects.model';

@Injectable({ providedIn: 'root' })
export class ProjectsDataService {
  private apiUrl = environment.apiUrl;

  private projects: Project[] = [];
  private milestones: ProjectMilestone[] = [];

  private projects$$ = new BehaviorSubject<Project[]>(this.projects);
  private milestones$$ = new BehaviorSubject<ProjectMilestone[]>(this.milestones);

  projects$ = this.projects$$.asObservable();
  milestones$ = this.milestones$$.asObservable();

  constructor(private http: HttpClient) {
    this.fetchProjectsData();
  }

  private fetchProjectsData() {
    forkJoin({
      projects: this.http.get<Project[]>(`${this.apiUrl}/projects-data`),
      milestones: this.http.get<ProjectMilestone[]>(`${this.apiUrl}/projects-data/milestones`)
    }).pipe(
      tap(data => {
        this.projects = data.projects;
        this.milestones = data.milestones;
        this.projects$$.next(this.projects);
        this.milestones$$.next(this.milestones);
      })
    ).subscribe();
  }

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

