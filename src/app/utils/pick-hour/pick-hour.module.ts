import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PickHourComponent } from './pick-hour.component';



@NgModule({
  declarations: [PickHourComponent],
  imports: [
    CommonModule
  ],
  exports: [PickHourComponent]
})
export class PickHourModule { }
