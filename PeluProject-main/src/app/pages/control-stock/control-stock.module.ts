import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ControlStockPageRoutingModule } from './control-stock-routing.module';
import { ControlStockPage } from './control-stock.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ControlStockPageRoutingModule,
    SharedModule
  ],
  declarations: [ControlStockPage]
})
export class ControlStockPageModule {}
