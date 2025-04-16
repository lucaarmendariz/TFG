import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IkasleakPage } from './ikasleak.page';

const routes: Routes = [
  {
    path: '',
    component: IkasleakPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IkasleakPageRoutingModule {}
