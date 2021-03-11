import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from '@angular/forms';

import { AgGridSharedFloatingFilterComponent } from './ag-grid-shared-floating-filter.component';
import { RoundCheckModule } from '../round-check/round-check.module';
import { AutoFocusModule } from '../directives/auto-focus/auto-focus.module';

@NgModule({
  declarations: [AgGridSharedFloatingFilterComponent],
  imports: [
    CommonModule,
    FormsModule,
    RoundCheckModule,
    NgbDropdownModule,
    AutoFocusModule
  ],
  exports: [AgGridSharedFloatingFilterComponent]
})
export class AgGridSharedFloatingFilterModule { }
