import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistorialaPageRoutingModule } from './historiala-routing.module';

import { HistorialaPage } from './historiala.page';
import { ComponentsModule } from "../components/components.module";
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistorialaPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule,
    ComponentsModule
],
  declarations: [HistorialaPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Agregar aquí
})
export class HistorialaPageModule {}
