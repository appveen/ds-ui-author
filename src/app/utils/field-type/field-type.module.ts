import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FieldTypeComponent } from './field-type.component';
import { FieldTypeSelectorComponent } from './field-type-selector/field-type-selector.component';
import { ClickOutsideModule } from '../directives/click-outside/click-outside.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ClickOutsideModule,
    NgbModule,
  ],
  declarations: [FieldTypeComponent, FieldTypeSelectorComponent],
  exports: [FieldTypeComponent, FieldTypeSelectorComponent]
})
export class FieldTypeModule { }
