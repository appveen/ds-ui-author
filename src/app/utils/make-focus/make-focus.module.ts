import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MakeFocusDirective } from './make-focus.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [MakeFocusDirective],
  exports: [MakeFocusDirective]
})
export class MakeFocusModule { }
