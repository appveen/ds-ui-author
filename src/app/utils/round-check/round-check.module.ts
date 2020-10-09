import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoundCheckComponent } from './round-check.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [RoundCheckComponent],
  exports: [RoundCheckComponent]
})
export class RoundCheckModule { }
