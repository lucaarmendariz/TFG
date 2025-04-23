import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClienteCreationModalPageRoutingModule } from './cliente-creation-modal-routing.module';

import { ClienteCreationModalPage } from './cliente-creation-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClienteCreationModalPageRoutingModule
  ],
  declarations: [ClienteCreationModalPage]
})
export class ClienteCreationModalPageModule {}
