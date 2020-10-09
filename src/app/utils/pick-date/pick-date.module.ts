import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PickDateComponent } from './pick-date.component';



@NgModule({
  declarations: [PickDateComponent],
  imports: [
    CommonModule
  ],
  exports: [PickDateComponent]
})
export class PickDateModule { }
