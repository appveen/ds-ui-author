import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PickMinuteComponent } from './pick-minute.component';



@NgModule({
  declarations: [PickMinuteComponent],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [PickMinuteComponent]
})
export class PickMinuteModule { }
