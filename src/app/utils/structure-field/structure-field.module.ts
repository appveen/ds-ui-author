import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StructureFieldComponent } from './structure-field.component';
import { AutoFocusModule } from '../directives/auto-focus/auto-focus.module';
import { DeleteModalModule } from '../delete-modal/delete-modal.module';
import { FieldTypeModule } from '../field-type/field-type.module';
import { KeyStrokesModule } from '../key-strokes/key-strokes.module';
import { SortablejsModule } from 'ngx-sortablejs';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    AutoFocusModule,
    DeleteModalModule,
    FieldTypeModule,
    KeyStrokesModule,
    SortablejsModule
  ],
  declarations: [StructureFieldComponent],
  exports: [StructureFieldComponent]
})
export class StructureFieldModule { }
