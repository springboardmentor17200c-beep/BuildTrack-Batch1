import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from './language.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // re-evaluates when the language changes, not just on input change
})
export class TranslatePipe implements PipeTransform {
  constructor(private lang: LanguageService) {}

  transform(key: string): string {
    return this.lang.t(key);
  }
}