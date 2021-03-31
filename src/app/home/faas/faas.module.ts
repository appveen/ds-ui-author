import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaasListingComponent } from './faas-listing/faas-listing.component';
import { FaasManageComponent } from './faas-manage/faas-manage.component';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'list' },
  { path: 'list', component: FaasListingComponent },
  { path: 'manage', component: FaasManageComponent }
];

@NgModule({
  declarations: [FaasListingComponent, FaasManageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class FaasModule { }
