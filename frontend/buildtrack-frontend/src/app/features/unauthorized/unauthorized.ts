import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthDataService } from '../auth/auth-data.service';
import { AppSidebarComponent } from '../shared/sidebar/app-sidebar.component';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule, AppSidebarComponent],
  templateUrl: './unauthorized.html',
  styleUrls: ['./unauthorized.css'],
})
export class Unauthorized {
  constructor(public auth: AuthDataService) {}
}
