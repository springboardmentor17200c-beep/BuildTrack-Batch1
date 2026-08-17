import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthDataService } from '../auth/auth-data.service';
import { AppUser, DASHBOARD_ROUTE_BY_ROLE } from '../auth/models/auth.model';
import { ThemeService } from '../shared/theme.service';
import { LanguageService } from '../shared/language.service';

interface FeatureCard {
  icon: 'projects' | 'resources' | 'inventory' | 'workforce' | 'analytics' | 'reports' | 'budget' | 'procurement' | 'notifications';
  title: string;
  description: string;
  route: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

interface LangOption {
  code: string;
  name: string;
  native: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
})
export class Landing implements OnInit {
  currentUser: AppUser | null = null;
  features: FeatureCard[] = [
    { icon: 'projects', title: 'Project Management', description: 'Plan, schedule, and track every project from kickoff to closure.', route: '/projects', color: 'blue' },
    { icon: 'resources', title: 'Resource Management', description: 'Allocate equipment and machinery, and track utilization across sites.', route: '/resources', color: 'purple' },
    { icon: 'inventory', title: 'Inventory & Materials', description: 'Monitor stock levels, manage procurement requests, and avoid delays.', route: '/inventory', color: 'green' },
    { icon: 'workforce', title: 'Workforce Management', description: 'Register workers, track attendance, and schedule shifts with ease.', route: '/workforce', color: 'orange' },
    { icon: 'analytics', title: 'Analytics & Reports', description: 'Get real-time insight into budgets, progress, and procurement.', route: '/analytics', color: 'blue' },
    { icon: 'budget', title: 'Budget & Cost Tracking', description: 'Plan budgets, estimate costs, and monitor spend against every project.', route: '/analytics/budget', color: 'orange' },
    { icon: 'procurement', title: 'Procurement', description: 'Manage vendors, purchase orders, and supplier relationships in one place.', route: '/inventory/requests', color: 'purple' },
    { icon: 'notifications', title: 'Notifications', description: 'Stay on top of deadlines, approvals, and attendance alerts automatically.', route: '/dashboard', color: 'green' },
    { icon: 'reports', title: 'Role-Based Dashboards', description: 'Every role — Admin, PM, Site Engineer, Contractor, Client — gets a tailored view.', route: '/dashboard', color: 'blue' },
  ];

  stats = [
    { value: '6', label: 'Role-Based Dashboards' },
    { value: '12+', label: 'Core Modules' },
    { value: '5', label: 'Languages Supported' },
    { value: '24/7', label: 'Real-Time Site Visibility' },
  ];

  steps = [
    { number: '01', title: 'Create your account', description: 'Register with your role — Administrator, PM, Site Engineer, Contractor, Worker, or Client.' },
    { number: '02', title: 'Set up your projects', description: 'Add projects, assign teams, and configure the modules your role needs.' },
    { number: '03', title: 'Track everything live', description: 'Monitor progress, budgets, workforce, and inventory from one dashboard.' },
  ];

  benefits = [
    { icon: 'clock', title: 'Fewer delays', description: 'Spot stock shortages and schedule slips before they cost you days on site.' },
    { icon: 'shield', title: 'One source of truth', description: 'Every role sees the same live data — no more chasing updates over calls.' },
    { icon: 'trend', title: 'Cost control', description: 'Track budget vs. actual spend across labor, materials, and equipment.' },
    { icon: 'users', title: 'Built for every role', description: 'From admins to site engineers, everyone gets a dashboard suited to their job.' },
  ];

  testimonials = [
    { quote: 'We used to track material requests over WhatsApp. Now everything from stock to procurement lives in one dashboard.', name: 'A. Kumar', role: 'Site Engineer' },
    { quote: 'Being able to see budget utilization update in real time changed how we plan the next phase of every project.', name: 'R. Sharma', role: 'Project Manager' },
    { quote: 'As a client, I finally get to see actual progress photos and percentages instead of waiting for a weekly call.', name: 'M. Das', role: 'Client / Owner' },
  ];

  faqs = [
    { q: 'Do I need to install anything?', a: 'No — BuildTrack runs entirely in your browser. Just create an account and start managing your projects.' },
    { q: 'Can different roles see different data?', a: 'Yes. Access is role-based — Administrators, Project Managers, Site Engineers, Contractors, Workers, and Clients each get a dashboard scoped to what they need.' },
    { q: 'Is my project data secure?', a: 'All authentication uses token-based sessions, and access to each module is enforced by role on every request.' },
    { q: 'Can I switch languages?', a: 'Yes — BuildTrack currently supports English, Hindi, Tamil, Telugu, and Bengali. Use the language switcher in the top navigation.' },
  ];
  openFaqIndex: number | null = null;

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


  constructor(
    private auth: AuthDataService,
    private router: Router,
    public theme: ThemeService,
    public lang: LanguageService
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  get dashboardRoute(): string {
    if (!this.currentUser) return '/login';
    return DASHBOARD_ROUTE_BY_ROLE[this.currentUser.role] || '/dashboard';
  }

  /** Feature cards always go to Login when logged out — sign-in gate as requested. */
  exploreFeature(feature: FeatureCard) {
    if (this.currentUser) {
      this.router.navigate([feature.route]);
    } else {
      this.router.navigate(['/login']);
    }
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

  toggleTheme(): void {

    this.theme.toggle();
  }

  

  

  toggleFaq(index: number): void {
    this.openFaqIndex = this.openFaqIndex === index ? null : index;
  }
}