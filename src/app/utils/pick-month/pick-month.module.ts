import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PickMonthComponent } from './pick-month.component';



@NgModule({
  declarations: [PickMonthComponent],
  imports: [
    CommonModule
  ],
  exports: [PickMonthComponent]
})
export class PickMonthModule { }
