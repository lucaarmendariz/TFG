import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoginServiceService } from '../zerbitzuak/login-service.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  ikasle!: boolean;
  selectedLanguage: string = 'es';

  constructor(
    private loginService: LoginServiceService,
    private translate: TranslateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Cada vez que se navegue a esta página, este código se ejecutará
    console.log('Página Home cargada');
    this.ikasle = this.loginService.isAlumno();
    this.translate.setDefaultLang(this.selectedLanguage);

    // Escucha los cambios en la ruta
    this.route.params.subscribe(params => {
      // Puedes realizar una acción aquí cada vez que se cambie la ruta
      console.log('Ruta cambiada:', params);
      this.ikasle = this.loginService.isAlumno();
    });
  }

  logout() {
    this.loginService.logout();
  }

  changeLanguage() {
    this.translate.use(this.selectedLanguage);
  }
}
