import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from './header/header.component';
import { HomeBotoiakKonponenteaComponent } from './home-botoiak-konponentea/home-botoiak-konponentea.component';
import { ToastsComponent } from './toasts/toasts.component';

@NgModule({
  declarations: [HeaderComponent, HomeBotoiakKonponenteaComponent, ToastsComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    TranslateModule,
  ],
  exports: [HeaderComponent, HomeBotoiakKonponenteaComponent, ToastsComponent]
})

export class ComponentsModule { }
