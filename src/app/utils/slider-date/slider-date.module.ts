import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderDateComponent } from './slider-date.component';



@NgModule({
  declarations: [SliderDateComponent],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [SliderDateComponent]
})
export class SliderDateModule { }
