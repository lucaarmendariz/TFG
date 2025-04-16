import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TratamenduakPageRoutingModule } from './tratamenduak-routing.module';

import { TratamenduakPage } from './tratamenduak.page';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from "../components/components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    TratamenduakPageRoutingModule,
    ComponentsModule
],
  declarations: [TratamenduakPage]
})
export class TratamenduakPageModule {}
