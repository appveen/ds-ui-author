import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollEndDirective } from './scroll-end.directive';



@NgModule({
  declarations: [
    ScrollEndDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ScrollEndDirective
  ]
})
export class ScrollEndModule { }
