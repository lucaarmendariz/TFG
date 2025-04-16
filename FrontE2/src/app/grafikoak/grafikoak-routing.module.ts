import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GrafikoakPage } from './grafikoak.page';

const routes: Routes = [
  {
    path: '',
    component: GrafikoakPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GrafikoakPageRoutingModule {}
