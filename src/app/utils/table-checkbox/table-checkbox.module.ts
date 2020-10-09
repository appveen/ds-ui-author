import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableCheckboxComponent } from './table-checkbox.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [TableCheckboxComponent],
  exports: [TableCheckboxComponent]
})
export class TableCheckboxModule { }
