import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ChangeOnEditComponent } from './change-on-edit.component';


@NgModule({
  declarations: [
    ChangeOnEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [ChangeOnEditComponent]
})
export class ChangeOnEditModule { }
