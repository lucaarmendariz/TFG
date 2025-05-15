import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BezeroService } from '../zerbitzuak/bezero.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../zerbitzuak/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cliente-creation-modal',
  templateUrl: './cliente-creation-modal.page.html',
  styleUrls: ['./cliente-creation-modal.page.scss'],
  standalone: false
})
export class ClienteCreationModalPage implements OnInit, OnDestroy {
  selectedLanguage: string = 'es';

  crearNombre: string = '';
  crearApellido: string = '';
  crearTelefono: string = '';
  crearPiel: boolean = false;

  private langSubscription!: Subscription;

  constructor(
    private modalController: ModalController,
    private bezeroService: BezeroService,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    // Obtener idioma actual
    this.selectedLanguage = this.languageService.getCurrentLanguage();
    this.translate.use(this.selectedLanguage);

    // Suscribirse a cambios de idioma
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

  dismiss() {
    this.modalController.dismiss();
  }

  async crearBezero() {
    if (this.crearNombre && this.crearApellido && this.crearTelefono) {
      this.bezeroService.crearBezero(this.crearNombre, this.crearApellido, this.crearTelefono, this.crearPiel)
        .subscribe(
          res => {
            console.log('Nuevo cliente creado:', res);
            this.modalController.dismiss(res);
          },
          err => {
            console.error('Error al crear cliente:', err);
          }
        );
    } else {
      console.error('Faltan datos para crear el cliente.');
    }
  }

  cancelar() {
    this.modalController.dismiss(null, 'cancel');
  }
}
