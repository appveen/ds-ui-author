import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InsightComponent } from './insight.component';
import { LoadingModule } from 'src/app/utils/loading/loading.module';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { DatePickerModule } from 'src/app/utils/date-picker/datePicker.module';
import { AudiObjectModule } from 'src/app/home/schema-utils/audi-object.module';
import { DataGridModule } from 'src/app/utils/data-grid/data-grid.module';
import { RoundCheckModule } from 'src/app/utils/round-check/round-check.module';
import { AgentLogsComponent } from './agent-logs/agent-logs.component';
import { DataserviceLogsModule } from './dataservice-logs/dataservice-logs.module';
import { GroupLogsModule } from './group-logs/group-logs.module';
import { UserLogsModule } from './user-logs/user-logs.module';
import { ApiLogsModule } from './api-logs/api-logs.module';

const routes = [
    { path: '', component: InsightComponent },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        LoadingModule,
        BreadcrumbModule,
        DatePickerModule,
        SearchBoxModule,
        AudiObjectModule,
        DataGridModule,
        RoundCheckModule,
        DataserviceLogsModule,
        GroupLogsModule,
        UserLogsModule,
        ApiLogsModule
    ],
    declarations: [InsightComponent, AgentLogsComponent],
    exports: [RouterModule]
})
export class InsightModule {
}
