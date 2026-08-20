import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppSidebarComponent } from '../sidebar/app-sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AppSidebarComponent],
  template: `
    <div class="bt-shell">
      <app-sidebar></app-sidebar>
      <div class="bt-main">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AppLayoutComponent {}
