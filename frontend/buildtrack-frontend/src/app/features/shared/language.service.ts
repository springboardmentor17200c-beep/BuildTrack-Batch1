import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LangCode, TRANSLATIONS, LANGUAGES } from './translations';

const LANG_KEY = 'buildtrack_lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  languages = LANGUAGES;

  private lang$$ = new BehaviorSubject<LangCode>(this.loadPreference());
  lang$ = this.lang$$.asObservable();

  get current(): LangCode {
    return this.lang$$.value;
  }

  setLanguage(code: LangCode): void {
    this.lang$$.next(code);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(LANG_KEY, code);
      } catch {}
    }
  }

  t(key: string): string {
    const dict = TRANSLATIONS[this.current] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  }

  private loadPreference(): LangCode {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(LANG_KEY) as LangCode | null;
        if (stored && TRANSLATIONS[stored]) return stored;
      } catch {}
    }
    return 'en';
  }
}