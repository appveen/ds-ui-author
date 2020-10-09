import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { AgGridModule } from 'ag-grid-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CheckboxModule } from 'src/app/utils/checkbox/checkbox.module';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridFiltersComponent } from './ag-grid-filters/ag-grid-filters.component';
import { UserLogsComponent } from './user-logs.component';
import { OnChangeModule } from 'src/app/utils/directives/on-change/on-change.module';



@NgModule({
    declarations: [
        UserLogsComponent,
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
        ])],
    providers: [DatePipe],
    exports: [UserLogsComponent]
})
export class UserLogsModule { }
