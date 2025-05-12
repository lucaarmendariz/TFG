import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BezeroService } from '../zerbitzuak/bezero.service';  // Asegúrate de que la ruta sea correcta
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-cliente-creation-modal',
    templateUrl: './cliente-creation-modal.page.html',
    styleUrls: ['./cliente-creation-modal.page.scss'],
    standalone: false
})
export class ClienteCreationModalPage {
  selectedLanguage: string = 'es';
 
  crearNombre: string = '';
  crearApellido: string = '';
  crearTelefono: string = '';
  crearPiel: boolean = false;

  constructor(
    private modalController: ModalController,
    private bezeroService: BezeroService,
    private translate: TranslateService,

  ) {this.translate.setDefaultLang('es');
    this.translate.use(this.selectedLanguage)}

  // Método para cerrar la modal sin hacer nada
  dismiss() {
    this.modalController.dismiss();
  }

  // Método para crear el cliente
  async crearBezero() {
    // Verificamos si el formulario está completo y los datos son válidos
    if (this.crearNombre && this.crearApellido && this.crearTelefono) {
      // Llamamos al servicio para crear el cliente
      await this.bezeroService.crearBezero(this.crearNombre, this.crearApellido, this.crearTelefono, this.crearPiel).subscribe(
        (res) => {
          console.log('Nuevo cliente creado:', res);
          // Al crear el cliente, podemos devolver los datos si es necesario
          this.modalController.dismiss(res); // Devuelves el nuevo cliente al controlador que invocó la modal
        },
        (err) => {
          console.error('Error al crear cliente:', err);
        }
      );
    } else {
      console.error('Faltan datos para crear el cliente.');
    }
  }

  cancelar() {
      this.modalController.dismiss(null, 'cancel'); // <- CANCEL role
    }
}
