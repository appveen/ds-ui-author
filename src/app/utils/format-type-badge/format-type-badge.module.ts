import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatTypeBadgeComponent } from './format-type-badge.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [FormatTypeBadgeComponent],
  exports: [FormatTypeBadgeComponent]
})
export class FormatTypeBadgeModule { }
