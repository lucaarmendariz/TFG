import { SharedModule } from 'src/app/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MahileguaPageRoutingModule } from './mahilegua-routing.module';

import { MahileguaPage } from './mahilegua.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MahileguaPageRoutingModule,
    SharedModule
  ],
  declarations: [MahileguaPage]
})
export class MahileguaPageModule {}
