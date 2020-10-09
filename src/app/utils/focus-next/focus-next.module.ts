import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FocusNextDirective } from './focus-next.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [FocusNextDirective],
  exports: [FocusNextDirective]
})
export class FocusNextModule { }
