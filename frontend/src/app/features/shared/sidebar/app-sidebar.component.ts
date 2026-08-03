import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { CurrentUser, MODULE_ACCESS } from '../../../core/auth/auth.models';

import { ThemeService } from '../theme.service';
import { LanguageService } from '../language.service';
import { LangCode } from '../translations';
import { TranslatePipe } from '../translate.pipe';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  moduleKey: keyof typeof MODULE_ACCESS | null;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.css'],
})
export class AppSidebarComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly theme = inject(ThemeService);
  readonly lang = inject(LanguageService);

  currentUser: CurrentUser | null = null;
  langMenuOpen = false;

  readonly navItems: NavItem[] = [
    {
      label: 'nav.dashboard',
      route: '/dashboard',
      icon: 'dashboard',
      moduleKey: null,
    },
    {
      label: 'nav.projects',
      route: '/projects',
      icon: 'projects',
      moduleKey: 'projects',
    },
    {
      label: 'nav.resources',
      route: '/resources',
      icon: 'resources',
      moduleKey: 'resources',
    },
    {
      label: 'nav.inventory',
      route: '/inventory',
      icon: 'inventory',
      moduleKey: 'inventory',
    },
    {
      label: 'nav.workforce',
      route: '/workforce',
      icon: 'workforce',
      moduleKey: 'workforce',
    },
    {
      label: 'nav.analytics',
      route: '/analytics',
      icon: 'analytics',
      moduleKey: 'analytics',
    },
    {
      label: 'nav.profile',
      route: '/profile',
      icon: 'profile',
      moduleKey: null,
    },
  ];

  ngOnInit(): void {
    this.auth.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  isAllowed(item: NavItem): boolean {
    if (!item.moduleKey) {
      return true;
    }

    if (!this.currentUser) {
      return false;
    }

    return (
      MODULE_ACCESS[item.moduleKey]?.includes(
        this.currentUser
          .role_name as keyof (typeof MODULE_ACCESS)[keyof typeof MODULE_ACCESS] extends never
          ? never
          : import('../../../core/auth/auth.models').RoleName,
      ) ?? false
    );
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

  logout(): void {
    this.auth.logout(false);
    this.router.navigateByUrl('/login');
  }
}
