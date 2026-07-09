import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { DashboardComponent } from './features/dashboard/dashboard';
import { ProjectsComponent } from './features/projects/projects';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: '**', redirectTo: 'login' },
];