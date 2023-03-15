import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayloadCreatorComponent } from './payload-creator.component';
import { FormsModule } from '@angular/forms';
import { PayloadFieldComponent } from './payload-field/payload-field.component';
import { PayloadArrayComponent } from './payload-array/payload-array.component';
import { PayloadObjectComponent } from './payload-object/payload-object.component';
import { AutoFocusModule } from '../directives/auto-focus/auto-focus.module';
import { MultiDropdownModule } from '../../home/multi-dropdown/multi-dropdown.module';
import { ClickOutsideModule } from '../directives/click-outside/click-outside.module';
import { StyledTextModule } from '../styled-text/styled-text.module';



@NgModule({
  declarations: [
    PayloadCreatorComponent,
    PayloadFieldComponent,
    PayloadArrayComponent,
    PayloadObjectComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AutoFocusModule,
    ClickOutsideModule,
    MultiDropdownModule,
    StyledTextModule
  ],
  exports: [PayloadCreatorComponent]
})
export class PayloadCreatorModule { }
