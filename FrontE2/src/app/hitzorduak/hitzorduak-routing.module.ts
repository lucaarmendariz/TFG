import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HitzorduakPage } from './hitzorduak.page';

const routes: Routes = [
  {
    path: '',
    component: HitzorduakPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HitzorduakPageRoutingModule {}
