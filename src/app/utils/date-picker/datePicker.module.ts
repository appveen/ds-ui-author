import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatePickerComponent } from 'src/app/utils/date-picker/date-picker.component';

@NgModule({
    declarations: [
        DatePickerComponent
    ],
    imports: [
        CommonModule,
        FormsModule
    ],
    exports: [
        DatePickerComponent
    ]
})

export class DatePickerModule { }
