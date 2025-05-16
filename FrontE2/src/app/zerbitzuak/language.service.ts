import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'selectedLanguage';
  private currentLangSubject = new BehaviorSubject<string>('es');
  currentLang$ = this.currentLangSubject.asObservable();

  constructor(private translate: TranslateService) {
    this.initLanguage();
  }

  initLanguage() {
    const savedLang = localStorage.getItem(this.STORAGE_KEY) || 'es';
    this.translate.setDefaultLang('es');
    this.translate.use(savedLang);
    this.currentLangSubject.next(savedLang);
  }

  setLanguage(lang: string) {
    localStorage.setItem(this.STORAGE_KEY, lang);
    this.translate.use(lang);
    this.currentLangSubject.next(lang);
  }

  getCurrentLanguage(): string {
    return this.currentLangSubject.value;
  }

  // Método público para obtener traducciones
  get(keys: string[] | string) {
    return this.translate.get(keys);
  }
}
