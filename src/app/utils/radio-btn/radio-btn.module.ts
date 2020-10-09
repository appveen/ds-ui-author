import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioBtnComponent } from './radio-btn.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [RadioBtnComponent],
  exports: [RadioBtnComponent]
})
export class RadioBtnModule { }
