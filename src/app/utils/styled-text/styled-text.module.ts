import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StyledTextComponent } from './styled-text.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [StyledTextComponent],
  declarations: [StyledTextComponent]
})
export class StyledTextModule { }
