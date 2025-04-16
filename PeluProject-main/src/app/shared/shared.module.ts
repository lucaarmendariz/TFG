import { BarraNavegacionComponent } from './Header-components/barra-navegacion/barra-navegacion.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NavBarComponent } from './Header-components/nav-bar/nav-bar.component';
import { RouterModule } from '@angular/router'; 
import { BoxListComponent } from './Agenda/box-list/box-list.component';
import { BarraControlComponent } from './Header-components/barra-control/barra-control.component';
import { PopcitaComponent } from './modals/popcita/popcita.component';
import { TablaBezeroComponent } from '../shared/tabla-bezero/tabla-bezero.component';
import { FormsModule } from '@angular/forms';
import { InfoCitaComponent } from './Agenda/info-cita/info-cita.component';
import { ProductComponent } from './modals/product/product.component';
import { ServiceModalComponent } from './modals/service-modal/service-modal.component';
import { GrupoModalComponent } from './modals/grupo-modal/grupo-modal.component';
import { TrabajadorModalComponent } from './modals/trabajadores-modal/trabajadores-modal.component';
import { TxandakModalComponent } from './modals/txandak-modal/txandak-modal.component';
import { KategoriaModalComponent } from './modals/kategoria-modal/kategoria-modal.component';
import { FichaComponent } from './modals/ficha/ficha.component';
@NgModule({
  declarations: [
    BarraNavegacionComponent,
    NavBarComponent, 
    BoxListComponent, 
    BarraControlComponent,
    PopcitaComponent,
    TablaBezeroComponent,
    InfoCitaComponent,
    ProductComponent,
    ServiceModalComponent,
    GrupoModalComponent,
    TrabajadorModalComponent,
    TxandakModalComponent,
    KategoriaModalComponent,
    FichaComponent
    
  ],
  imports: [
    CommonModule,

    IonicModule,
    RouterModule,
    FormsModule

  ],
  exports:[
    BarraNavegacionComponent,
    NavBarComponent,
    BoxListComponent,
    BarraControlComponent,
    PopcitaComponent,
    TablaBezeroComponent,
    InfoCitaComponent,
    ProductComponent,
    ServiceModalComponent,
    GrupoModalComponent,
    TrabajadorModalComponent,
    TxandakModalComponent,
    FichaComponent

    
  ]
})
export class SharedModule { }
