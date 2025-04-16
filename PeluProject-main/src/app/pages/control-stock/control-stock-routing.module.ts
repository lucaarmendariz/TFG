import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ControlStockPage } from './control-stock.page';

const routes: Routes = [
  {
    path: '',
    component: ControlStockPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ControlStockPageRoutingModule {}
