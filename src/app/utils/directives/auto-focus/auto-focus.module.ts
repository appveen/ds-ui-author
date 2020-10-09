import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoFocusDirective } from './auto-focus.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [AutoFocusDirective],
  exports: [AutoFocusDirective]
})
export class AutoFocusModule { }
