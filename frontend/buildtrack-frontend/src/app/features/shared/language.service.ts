import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export type LangCode = 'en' | 'hi' | 'ta' | 'te' | 'bn';

export const LANGUAGES: { code: LangCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
];

const LANG_KEY = 'buildtrack_lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  languages = LANGUAGES;

  private lang$$ = new BehaviorSubject<LangCode>('en');
  lang$ = this.lang$$.asObservable();

  constructor(private translateService: TranslateService) {
    const pref = this.loadPreference();
    this.lang$$.next(pref);
    this.translateService.use(pref);
  }

  get current(): LangCode {
    return this.lang$$.value;
  }

  setLanguage(code: LangCode): void {
    this.lang$$.next(code);
    this.translateService.use(code);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(LANG_KEY, code);
      } catch {}
    }
  }

  private loadPreference(): LangCode {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(LANG_KEY) as LangCode | null;
        if (stored && LANGUAGES.find(l => l.code === stored)) return stored;
      } catch {}
    }
    return 'en';
  }
}