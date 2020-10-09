import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NoAccessComponent } from './no-access.component';
const routes = [
  { path: '', component: NoAccessComponent },
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    NoAccessComponent
  ]
})
export class NoAccessModule { }
