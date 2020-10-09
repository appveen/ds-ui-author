import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimePickerComponent } from './time-picker.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [TimePickerComponent],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [TimePickerComponent]
})
export class TimePickerModule { }
