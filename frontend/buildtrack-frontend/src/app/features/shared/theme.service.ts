import { Injectable } from '@angular/core';

const THEME_KEY = 'buildtrack_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkMode = false;

  constructor() {
    this.darkMode = this.loadPreference();
    this.apply();
  }

  get isDark(): boolean {
    return this.darkMode;
  }

  toggle(): void {
    this.darkMode = !this.darkMode;
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(THEME_KEY, this.darkMode ? 'dark' : 'light');
      } catch {}
    }
    this.apply();
  }

  private loadPreference(): boolean {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored) return stored === 'dark';
      } catch {}
    }
    if (typeof window !== 'undefined' && !!window.matchMedia) {
      try {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      } catch {}
    }
    return false;
  }

  private apply(): void {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('bt-dark', this.darkMode);
    document.documentElement.style.backgroundColor = this.darkMode ? '#0e1017' : '';
  }
}