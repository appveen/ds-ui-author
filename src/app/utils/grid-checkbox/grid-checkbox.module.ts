import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GridCheckboxComponent } from './grid-checkbox.component';
import { RoundCheckModule } from '../round-check/round-check.module';

@NgModule({
    declarations: [GridCheckboxComponent],
    imports: [CommonModule, RoundCheckModule],
    exports: [GridCheckboxComponent]
})
export class GridCheckboxModule {}
