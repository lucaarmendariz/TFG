import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClienteCreationModalPage } from './cliente-creation-modal.page';

const routes: Routes = [
  {
    path: '',
    component: ClienteCreationModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClienteCreationModalPageRoutingModule {}
