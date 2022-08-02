import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgGridModule } from 'ag-grid-angular';

import { AgentsComponent } from './agents.component';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { TableCheckboxModule } from 'src/app/utils/table-checkbox/table-checkbox.module';
import { DataGridModule } from 'src/app/utils/data-grid/data-grid.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { AgentsLogComponent } from './agents-log/agents-log.component';
import { SwitchModule } from 'src/app/utils/switch/switch.module';
import { AgentGridCellComponent } from './agent-grid-cell/agent-grid-cell.component';
import { AgentGridFilterComponent } from './agent-grid-filter/agent-grid-filter.component';
import { LogsGridCellComponent } from './agent-logs/logs-grid-cell/logs-grid-cell.component';
import { LogsGridFilterComponent } from './agent-logs/logs-grid-filter/logs-grid-filter.component';
import { AgentLogsComponent } from './agent-logs/agent-logs.component';
import { OnChangeModule } from 'src/app/utils/directives/on-change/on-change.module';
import { AgentsHbComponent } from './agents-hb/agents-hb.component';
import { AgentsStreakComponent } from './agents-streak/agents-streak.component';
import { AgentsOptionsComponent } from './agents-options/agents-options.component';
import { DateFormatModule } from 'src/app/utils/date-format/date-format.module';

const routes: Routes = [
    { path: '', component: AgentsComponent, pathMatch: 'full' },
    { path: ':id', component: AgentLogsComponent }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NgbModule,
        ClickOutsideModule,
        BreadcrumbModule,
        SearchBoxModule,
        TableCheckboxModule,
        ReactiveFormsModule,
        FormsModule,
        DataGridModule,
        AutoFocusModule,
        DeleteModalModule,
        SwitchModule,
        DateFormatModule,
        AgGridModule.withComponents([
            AgentGridCellComponent,
            AgentGridFilterComponent,
            LogsGridCellComponent,
            LogsGridFilterComponent
        ]),
        OnChangeModule
    ],
    declarations: [
        AgentsComponent,
        AgentsLogComponent,
        AgentGridCellComponent,
        AgentGridFilterComponent,
        LogsGridCellComponent,
        LogsGridFilterComponent,
        AgentLogsComponent,
        AgentsHbComponent,
        AgentsStreakComponent,
        AgentsOptionsComponent
    ],
    exports: [RouterModule]
})
export class AgentsModule { }
