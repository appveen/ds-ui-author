import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SortablejsModule } from 'ngx-sortablejs';

import { StructureFieldPropertiesComponent } from './structure-field-properties.component';
import { RelationPropertyComponent } from './relation-property/relation-property.component';
import { DeleteModalModule } from '../delete-modal/delete-modal.module';
import { TextPropertyComponent } from './text-property/text-property.component';
import { NumberPropertyComponent } from './number-property/number-property.component';
import { DatePickerModule } from '../date-picker/datePicker.module';
import { FieldTypeModule } from '../field-type/field-type.module';
import { ClickOutsideModule } from '../directives/click-outside/click-outside.module';
import { IdPropertyComponent } from './id-property/id-property.component';
import { DatePropertyComponent } from './date-property/date-property.component';
import { LibraryPropertyComponent } from './library-property/library-property.component';
import { SwitchModule } from '../switch/switch.module';
import { UserPropertyComponent } from './user-property/user-property.component';
import { AutoFocusModule } from '../directives/auto-focus/auto-focus.module';
import { TimezonePickerModule } from '../timezone-picker/timezone-picker.module';
import { CheckboxModule } from '../checkbox/checkbox.module'
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    DeleteModalModule,
    DatePickerModule,
    FieldTypeModule,
    ClickOutsideModule,
    SwitchModule,
    SortablejsModule,
    AutoFocusModule,
    TimezonePickerModule,
    CheckboxModule
  ],
  declarations: [
    StructureFieldPropertiesComponent,
    RelationPropertyComponent,
    TextPropertyComponent,
    NumberPropertyComponent,
    IdPropertyComponent,
    DatePropertyComponent,
    LibraryPropertyComponent,
    UserPropertyComponent
  ],
  exports: [
    StructureFieldPropertiesComponent,
    RelationPropertyComponent,
    TextPropertyComponent,
    NumberPropertyComponent,
    IdPropertyComponent,
    DatePropertyComponent
  ]
})
export class StructureFieldPropertiesModule { }
