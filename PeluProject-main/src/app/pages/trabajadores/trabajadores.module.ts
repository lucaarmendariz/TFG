import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrabajadoresPageRoutingModule } from './trabajadores-routing.module';

import { TrabajadoresPage } from './trabajadores.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrabajadoresPageRoutingModule,
    SharedModule
  ],
  declarations: [TrabajadoresPage]
})
export class TrabajadoresPageModule {}
