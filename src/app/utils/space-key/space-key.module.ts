import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpaceKeyDirective } from './space-key.directive';



@NgModule({
  declarations: [SpaceKeyDirective],
  imports: [
    CommonModule
  ],
  exports: [SpaceKeyDirective]
})
export class SpaceKeyModule { }
