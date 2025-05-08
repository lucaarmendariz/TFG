import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'hitzorduak',
    loadChildren: () => import('./hitzorduak/hitzorduak.module').then(m => m.HitzorduakPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'produktuak',
    loadChildren: () => import('./produktuak/produktuak.module').then(m => m.ProduktuakPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'grafikoak',
    loadChildren: () => import('./grafikoak/grafikoak.module').then(m => m.GrafikoakPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'ikasleak',
    loadChildren: () => import('./ikasleak/ikasleak.module').then(m => m.IkasleakPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'materialak',
    loadChildren: () => import('./materialak/materialak.module').then(m => m.MaterialakPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'txandak',
    loadChildren: () => import('./txandak/txandak.module').then(m => m.TxandakPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'tratamenduak',
    loadChildren: () => import('./tratamenduak/tratamenduak.module').then(m => m.TratamenduakPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'historiala',
    loadChildren: () => import('./historiala/historiala.module').then(m => m.HistorialaPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'cliente-creation-modal',
    loadChildren: () => import('./cliente-creation-modal/cliente-creation-modal.module').then(m => m.ClienteCreationModalPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'nueva-cita-modal',
    loadChildren: () => import('./nueva-cita-modal/nueva-cita-modal.module').then(m => m.NuevaCitaModalPageModule),
    canLoad: [AuthGuard]
  }
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
