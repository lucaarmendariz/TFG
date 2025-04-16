import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TratamenduakPage } from './tratamenduak.page';

const routes: Routes = [
  {
    path: '',
    component: TratamenduakPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TratamenduakPageRoutingModule {}
