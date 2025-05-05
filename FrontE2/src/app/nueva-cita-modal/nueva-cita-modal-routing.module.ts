import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NuevaCitaModalPage } from './nueva-cita-modal.page';

const routes: Routes = [
  {
    path: '',
    component: NuevaCitaModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NuevaCitaModalPageRoutingModule {}
