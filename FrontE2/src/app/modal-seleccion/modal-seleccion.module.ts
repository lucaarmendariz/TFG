import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalSeleccionPageRoutingModule } from './modal-seleccion-routing.module';

import { ModalSeleccionPage } from './modal-seleccion.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalSeleccionPageRoutingModule,
    TranslateModule.forChild() // 👈 Asegura que el pipe esté disponible
  ],
  declarations: [ModalSeleccionPage],
  exports: [ModalSeleccionPage]  // <--- Aquí exportamos el componente

})
export class ModalSeleccionPageModule {}
