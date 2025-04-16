import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TxandakPage } from './txandak.page';

const routes: Routes = [
  {
    path: '',
    component: TxandakPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TxandakPageRoutingModule {}
