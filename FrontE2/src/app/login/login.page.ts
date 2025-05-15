import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LoginServiceService } from '../zerbitzuak/login-service.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../zerbitzuak/language.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit, OnDestroy {
  username: string = '';
  password: string = '';
  submitted: boolean = false;
  loginMessage: string = '';
  loginMessageType: 'success' | 'error' = 'error';
  selectedLanguage: string = 'es';

  private langSubscription!: Subscription;

  constructor(
    private router: Router,
    private loginService: LoginServiceService,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {
    this.selectedLanguage = this.languageService.getCurrentLanguage();
  }

  ngOnInit() {
    // Suscribirse para actualizar idioma dinámicamente
    this.langSubscription = this.languageService.currentLang$.subscribe(lang => {
      this.selectedLanguage = lang;
      this.translate.use(lang);
    });
  }

  ngOnDestroy() {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  changeLanguage() {
    this.languageService.setLanguage(this.selectedLanguage);
  }

  selectLanguage(language: string) {
    this.selectedLanguage = language;
    this.changeLanguage();
  }

  async onLogin() {
    this.submitted = true;

    if (!this.username || !this.password) {
      this.loginMessage = this.translate.instant('login.vacio');
      this.loginMessageType = 'error';
      return;
    }

    try {
      const success = await firstValueFrom(this.loginService.login(this.username, this.password));

      if (success) {
        this.loginMessage = this.translate.instant('login.messageOk');
        this.loginMessageType = 'success';
        this.router.navigate(['/home']);
      } else {
        this.loginMessage = this.translate.instant('login.messageFail');
        this.loginMessageType = 'error';
      }
    } catch (error) {
      console.error("Error en el proceso de login:", error);
      this.loginMessage = this.translate.instant('login.messageNotOk');
      this.loginMessageType = 'error';
    }
  }
}
