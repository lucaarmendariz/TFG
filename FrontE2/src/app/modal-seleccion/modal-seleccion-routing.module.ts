import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalSeleccionPage } from './modal-seleccion.page';

const routes: Routes = [
  {
    path: '',
    component: ModalSeleccionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalSeleccionPageRoutingModule {}
