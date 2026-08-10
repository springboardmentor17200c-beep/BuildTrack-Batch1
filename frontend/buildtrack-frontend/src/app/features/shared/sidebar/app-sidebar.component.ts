import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthDataService } from '../../auth/auth-data.service';
import { AppUser, MODULE_ACCESS } from '../../auth/models/auth.model';
import { ThemeService } from '../theme.service';
import { LanguageService } from '../language.service';
import { LangCode } from '../translations';
import { TranslatePipe } from '../translate.pipe';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  moduleKey: keyof typeof MODULE_ACCESS | null; // null = always accessible (Dashboard, Profile)
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.css'],
})
export class AppSidebarComponent implements OnInit {
  currentUser: AppUser | null = null;
  langMenuOpen = false;

  navItems: NavItem[] = [
    { label: 'nav.dashboard', route: '/dashboard', icon: 'dashboard', moduleKey: null },
    { label: 'nav.projects', route: '/projects', icon: 'projects', moduleKey: 'projects' },
    { label: 'nav.resources', route: '/resources', icon: 'resources', moduleKey: 'resources' },
    { label: 'nav.inventory', route: '/inventory', icon: 'inventory', moduleKey: 'inventory' },
    { label: 'nav.workforce', route: '/workforce', icon: 'workforce', moduleKey: 'workforce' },
    { label: 'nav.analytics', route: '/analytics', icon: 'analytics', moduleKey: 'analytics' },
    { label: 'nav.procurement', route: '/procurement', icon: 'procurement', moduleKey: 'procurement' },
    { label: 'nav.profile', route: '/profile', icon: 'profile', moduleKey: null },
  ];

  constructor(
    private auth: AuthDataService,
    private router: Router,
    public theme: ThemeService,
    public lang: LanguageService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser;
  }

  isAllowed(item: NavItem): boolean {
    if (!item.moduleKey) return true;
    if (!this.currentUser) return false;
    return MODULE_ACCESS[item.moduleKey]?.includes(this.currentUser.role) ?? false;
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  toggleLangMenu(): void {
    this.langMenuOpen = !this.langMenuOpen;
  }

  selectLanguage(code: LangCode): void {
    this.lang.setLanguage(code);
    this.langMenuOpen = false;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}