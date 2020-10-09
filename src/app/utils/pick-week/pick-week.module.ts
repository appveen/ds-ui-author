import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PickWeekComponent } from './pick-week.component';



@NgModule({
  declarations: [PickWeekComponent],
  imports: [
    CommonModule
  ],
  exports: [PickWeekComponent]
})
export class PickWeekModule { }
