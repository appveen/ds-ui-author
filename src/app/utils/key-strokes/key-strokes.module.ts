import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyStrokesDirective } from './key-strokes.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [KeyStrokesDirective],
  exports: [KeyStrokesDirective]
})
export class KeyStrokesModule { }
