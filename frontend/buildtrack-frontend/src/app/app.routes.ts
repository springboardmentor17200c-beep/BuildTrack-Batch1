import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { DashboardComponent } from './features/dashboard/dashboard';
import { ProjectsComponent } from './features/projects/projects';
import { ProjectDetails } from './features/project-details/project-details';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'projects', component: ProjectsComponent },

{
  path: 'projects/:id',
  component: ProjectDetails
},
  { path: '**', redirectTo: 'login' },
];