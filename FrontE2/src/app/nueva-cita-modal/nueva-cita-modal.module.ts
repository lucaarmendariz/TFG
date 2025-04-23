import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NuevaCitaModalPageRoutingModule } from './nueva-cita-modal-routing.module';

import { NuevaCitaModalPage } from './nueva-cita-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NuevaCitaModalPageRoutingModule
  ],
  declarations: [NuevaCitaModalPage]
})
export class NuevaCitaModalPageModule {}
