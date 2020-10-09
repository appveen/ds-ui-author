import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxBtnComponent } from 'src/app/utils/checkbox-btn/checkbox-btn.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [CheckboxBtnComponent],
    imports: [CommonModule, FormsModule],
    exports: [CheckboxBtnComponent]
})
export class CheckboxBtnModule { }
