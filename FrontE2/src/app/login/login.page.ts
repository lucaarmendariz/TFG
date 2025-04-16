import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginServiceService } from '../zerbitzuak/login-service.service';
import { firstValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  username: string = '';
  password: string = '';
  submitted: boolean = false;
  loginMessage: string = ''; // Para mostrar el mensaje de validación
  loginMessageType: 'success' | 'error' = 'error'; // Para controlar el tipo de mensaje (exito o error)
  selectedLanguage: string = 'es';

  constructor(private router: Router, private loginService: LoginServiceService, private translate: TranslateService) {}

  ngOnInit() {
    this.translate.setDefaultLang(this.selectedLanguage);
  }

  changeLanguage() {
    this.translate.use(this.selectedLanguage);
  }

  selectLanguage(language: string) {
    this.selectedLanguage = language;
    this.changeLanguage();
  }
  

  async onLogin() {
    this.submitted = true;

    // Validar si los campos están vacíos
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
