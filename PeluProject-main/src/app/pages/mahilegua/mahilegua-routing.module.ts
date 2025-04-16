import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MahileguaPage } from './mahilegua.page';

const routes: Routes = [
  {
    path: '',
    component: MahileguaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MahileguaPageRoutingModule {}
