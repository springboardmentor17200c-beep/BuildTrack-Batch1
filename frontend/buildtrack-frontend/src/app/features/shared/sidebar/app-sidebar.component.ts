import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthDataService } from '../../auth/auth-data.service';
import { AppUser, MODULE_ACCESS } from '../../auth/models/auth.model';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  moduleKey: keyof typeof MODULE_ACCESS | null; // null = always accessible (Dashboard, Profile)
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.css'],
})
export class AppSidebarComponent implements OnInit {
  currentUser: AppUser | null = null;

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard', moduleKey: null },
    { label: 'Resource Management', route: '/resources', icon: 'resources', moduleKey: 'resources' },
    { label: 'Inventory', route: '/inventory', icon: 'inventory', moduleKey: 'inventory' },
    { label: 'Workforce', route: '/workforce', icon: 'workforce', moduleKey: 'workforce' },
    { label: 'Analytics', route: '/analytics', icon: 'analytics', moduleKey: 'analytics' },
    { label: 'Profile', route: '/profile', icon: 'profile', moduleKey: null },
  ];

  constructor(private auth: AuthDataService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser;
  }

  isAllowed(item: NavItem): boolean {
    if (!item.moduleKey) return true;
    if (!this.currentUser) return false;
    return MODULE_ACCESS[item.moduleKey]?.includes(this.currentUser.role) ?? false;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
