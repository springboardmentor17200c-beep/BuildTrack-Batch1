import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthDataService } from '../../auth/auth-data.service';
import { AppUser, MODULE_ACCESS } from '../../auth/models/auth.model';
import { ThemeService } from '../theme.service';
import { LanguageService } from '../language.service';
import { NotificationDropdownComponent } from '../notification/notification-dropdown.component';


interface LangOption {
  code: string;
  name: string;
  native: string;
}

interface NavItem {
  label: string;
  route: string;
  icon: string;
  moduleKey: keyof typeof MODULE_ACCESS | null; // null = always accessible (Dashboard, Profile)
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationDropdownComponent],
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.css'],
})
export class AppSidebarComponent implements OnInit {
  currentUser: AppUser | null = null;
  langMenuOpen = false;
  currentLangCode = 'en';
  currentLangName = 'EN';
  
  languages: LangOption[] = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' }
  ];

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard', moduleKey: null },
    { label: 'Projects', route: '/projects', icon: 'projects', moduleKey: 'projects' },
    { label: 'Resource Management', route: '/resources', icon: 'resources', moduleKey: 'resources' },
    { label: 'Inventory & Materials', route: '/inventory', icon: 'inventory', moduleKey: 'inventory' },
    { label: 'Workforce Management', route: '/workforce', icon: 'workforce', moduleKey: 'workforce' },
    { label: 'Analytics & Reports', route: '/analytics', icon: 'analytics', moduleKey: 'analytics' },
    { label: 'Procurement', route: '/procurement', icon: 'procurement', moduleKey: 'procurement' },
    { label: 'Profile', route: '/profile', icon: 'profile', moduleKey: null },
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

  selectLanguage(lang: LangOption): void {
    this.currentLangCode = lang.code;
    this.currentLangName = lang.name.toUpperCase().substring(0, 2);
    this.langMenuOpen = false;
    
    // Force load the Google Translate script if not loaded
    if (!(window as any).gt_translate_script) {
        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit2';
        document.body.appendChild(script);
        (window as any).gt_translate_script = script;
    }
    
    // Call global GTranslate function
    const gt = (window as any).doGTranslate;
    if (gt) {
      gt('en|' + lang.code);
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}