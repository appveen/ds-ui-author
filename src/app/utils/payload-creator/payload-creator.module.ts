import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayloadCreatorComponent } from './payload-creator.component';
import { FormsModule } from '@angular/forms';
import { PayloadFieldComponent } from './payload-field/payload-field.component';
import { PayloadArrayComponent } from './payload-array/payload-array.component';
import { PayloadObjectComponent } from './payload-object/payload-object.component';
import { AutoFocusModule } from '../directives/auto-focus/auto-focus.module';



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
    AutoFocusModule
  ],
  exports: [PayloadCreatorComponent]
})
export class PayloadCreatorModule { }
