import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HistorialaPage } from './historiala.page';

const routes: Routes = [
  {
    path: '',
    component: HistorialaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistorialaPageRoutingModule {}
