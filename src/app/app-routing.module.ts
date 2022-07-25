import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from 'src/app/login/login.component';
import { BeforeGuard } from 'src/app/utils/guards/before.guard';
import { NotFoundComponent } from 'src/app/not-found/not-found.component';
import { HomeComponent } from './home/home/home.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  {
    path: 'app',
    loadChildren: () => import('./apps/apps.module').then((m) => m.AppsModule),
    canLoad: [BeforeGuard],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
    canLoad: [BeforeGuard],
  },
  {
    path: 'auth-mode',
    loadChildren: () =>
      import('./auth-mode/auth-mode.module').then((m) => m.AuthModeModule),
    canLoad: [BeforeGuard],
  },
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
  { path: 'auth', component: LoginComponent },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
