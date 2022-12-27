import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ApiLogsComponent } from './api-logs.component';
import { AgGridCellComponent } from './ag-grid-cell/ag-grid-cell.component';
import { AgGridFiltersComponent } from './ag-grid-filters/ag-grid-filters.component';
import { CheckboxModule } from 'src/app/utils/checkbox/checkbox.module';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { OnChangeModule } from 'src/app/utils/directives/on-change/on-change.module';
import { AgGridSharedFloatingFilterModule } from 'src/app/utils/ag-grid-shared-floating-filter/ag-grid-shared-floating-filter.module';

@NgModule({
  declarations: [
    ApiLogsComponent,
    AgGridCellComponent,
    AgGridFiltersComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    CheckboxModule,
    ClickOutsideModule,
    OnChangeModule,
    AgGridModule.withComponents([
      AgGridFiltersComponent,
    ]),
    AgGridSharedFloatingFilterModule
  ],

  exports: [
    ApiLogsComponent
  ]
})
export class ApiLogsModule { }
