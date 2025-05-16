import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NuevaCitaModalPageRoutingModule } from './nueva-cita-modal-routing.module';

import { NuevaCitaModalPage } from './nueva-cita-modal.page';
import { TranslateModule } from '@ngx-translate/core';
import { ModalSeleccionPage } from '../modal-seleccion/modal-seleccion.page';
import { ModalSeleccionPageModule } from '../modal-seleccion/modal-seleccion.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NuevaCitaModalPageRoutingModule,
    TranslateModule,
    ModalSeleccionPageModule  // <-- importa el módulo
  ],
  declarations: [NuevaCitaModalPage]
})
export class NuevaCitaModalPageModule {}
