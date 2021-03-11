import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldsSelectorComponent } from './fields-selector.component';
import { FieldTypeModule } from '../field-type/field-type.module';



@NgModule({
  declarations: [FieldsSelectorComponent],
  imports: [
    CommonModule,
    FieldTypeModule
  ],
  exports: [FieldsSelectorComponent]
})
export class FieldsSelectorModule { }
