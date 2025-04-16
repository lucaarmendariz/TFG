import { NgModule } from '@angular/core';
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
  declarations: [HistorialaPage]
})
export class HistorialaPageModule {}
