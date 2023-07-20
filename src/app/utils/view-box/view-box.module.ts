import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewBoxDirective } from './view-box.directive';



@NgModule({
  declarations: [ViewBoxDirective],
  imports: [
    CommonModule
  ],
  exports: [ViewBoxDirective]
})
export class ViewBoxModule { }
