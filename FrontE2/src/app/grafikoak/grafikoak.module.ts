import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GrafikoakPageRoutingModule } from './grafikoak-routing.module';

import { GrafikoakPage } from './grafikoak.page';
import { ComponentsModule } from "../components/components.module";
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GrafikoakPageRoutingModule,
    TranslateModule,
    ComponentsModule
],
  declarations: [GrafikoakPage]
})
export class GrafikoakPageModule {}
