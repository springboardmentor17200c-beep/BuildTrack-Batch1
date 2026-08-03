// src/app/core/api/project.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

import { Project, CreateProjectRequest, UpdateProjectRequest } from '../models/project.model';

import {
  ProjectMilestone,
  CreateProjectMilestoneRequest,
  UpdateProjectMilestoneRequest,
} from '../models/project-milestone.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly api = inject(ApiService);

  // ===========================
  // Projects
  // ===========================

  getProjects(): Observable<Project[]> {
    return this.api.get<Project[]>('/projects');
  }

  getProject(projectId: number): Observable<Project> {
    return this.api.get<Project>(`/projects/${projectId}`);
  }

  createProject(payload: CreateProjectRequest): Observable<Project> {
    return this.api.post<Project>('/projects', payload);
  }

  updateProject(projectId: number, payload: UpdateProjectRequest): Observable<Project> {
    return this.api.put<Project>(`/projects/${projectId}`, payload);
  }

  deleteProject(projectId: number): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/projects/${projectId}`);
  }

  // ===========================
  // Milestones
  // ===========================

  getMilestones(projectId?: number): Observable<ProjectMilestone[]> {
    if (projectId) {
      return this.api.get<ProjectMilestone[]>(`/milestones?project_id=${projectId}`);
    }

    return this.api.get<ProjectMilestone[]>('/milestones');
  }

  getMilestone(milestoneId: number): Observable<ProjectMilestone> {
    return this.api.get<ProjectMilestone>(`/milestones/${milestoneId}`);
  }

  createMilestone(payload: CreateProjectMilestoneRequest): Observable<ProjectMilestone> {
    return this.api.post<ProjectMilestone>('/milestones', payload);
  }

  updateMilestone(
    milestoneId: number,
    payload: UpdateProjectMilestoneRequest,
  ): Observable<ProjectMilestone> {
    return this.api.put<ProjectMilestone>(`/milestones/${milestoneId}`, payload);
  }

  deleteMilestone(milestoneId: number): Observable<void> {
    return this.api.delete<void>(`/milestones/${milestoneId}`);
  }
}
