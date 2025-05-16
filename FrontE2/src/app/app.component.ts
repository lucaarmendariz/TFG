import { Component } from '@angular/core';
import { LanguageService } from './zerbitzuak/language.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private languageService: LanguageService) {
  // Inicializa idioma (usa localStorage o 'es' por defecto)
  this.languageService.initLanguage();
  }
}
