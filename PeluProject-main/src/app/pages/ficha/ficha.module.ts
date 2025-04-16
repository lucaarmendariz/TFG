import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Si usas formularios reactivos
import { FichaPageRoutingModule } from './ficha-routing.module';
import { FichaPage } from './ficha.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FichaPageRoutingModule,
    ReactiveFormsModule,  // Si usas formularios reactivos
    SharedModule
    
  ],
  declarations: [FichaPage]
})
export class FichaPageModule {}
