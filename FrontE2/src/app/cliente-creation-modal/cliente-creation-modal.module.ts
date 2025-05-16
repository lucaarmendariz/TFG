import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClienteCreationModalPageRoutingModule } from './cliente-creation-modal-routing.module';

import { ClienteCreationModalPage } from './cliente-creation-modal.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClienteCreationModalPageRoutingModule,
    TranslateModule,
  ],
  declarations: [ClienteCreationModalPage]
})
export class ClienteCreationModalPageModule {}
