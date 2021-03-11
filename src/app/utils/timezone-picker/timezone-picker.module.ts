import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TimezonePickerComponent } from './timezone-picker.component';



@NgModule({
  declarations: [TimezonePickerComponent],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [TimezonePickerComponent],
})
export class TimezonePickerModule { }
