import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProduktuakPage } from './produktuak.page';

const routes: Routes = [
  {
    path: '',
    component: ProduktuakPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProduktuakPageRoutingModule {}
