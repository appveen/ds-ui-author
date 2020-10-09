import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoundRadioComponent } from './round-radio.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [RoundRadioComponent],
  exports: [RoundRadioComponent]
})
export class RoundRadioModule { }
