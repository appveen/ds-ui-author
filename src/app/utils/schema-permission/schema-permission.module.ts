import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchemaPermissionComponent } from './schema-permission.component';
import { RoundRadioModule } from '../round-radio/round-radio.module';
import { FieldTypeModule } from '../field-type/field-type.module';



@NgModule({
  declarations: [
    SchemaPermissionComponent
  ],
  imports: [
    CommonModule,  RoundRadioModule,FieldTypeModule
  ],
  exports: [SchemaPermissionComponent]
})
export class SchemaPermissionModule { }
