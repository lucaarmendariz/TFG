import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MaterialakPage } from './materialak.page';

const routes: Routes = [
  {
    path: '',
    component: MaterialakPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MaterialakPageRoutingModule {}
