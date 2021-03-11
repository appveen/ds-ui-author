import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataserviceLogsComponent } from './dataservice-logs.component';
import { AgGridFiltersComponent } from './ag-grid-filters/ag-grid-filters.component';
import { AgGridModule } from 'ag-grid-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CheckboxModule } from 'src/app/utils/checkbox/checkbox.module';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OnChangeModule } from 'src/app/utils/directives/on-change/on-change.module';
import { AgGridCellComponent } from './ag-grid-cell/ag-grid-cell.component';
import { IconsModule } from 'src/app/utils/icons/icons.module';
import { DateFormatModule } from 'src/app/utils/date-format/date-format.module';



@NgModule({
    declarations: [
        DataserviceLogsComponent,
        AgGridFiltersComponent,
        AgGridCellComponent,
    ],
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        CheckboxModule,
        ClickOutsideModule,
        OnChangeModule,
        IconsModule,
        DateFormatModule,
        AgGridModule.withComponents([
            AgGridFiltersComponent,
        ])],
    exports: [DataserviceLogsComponent]
})
export class DataserviceLogsModule { }
