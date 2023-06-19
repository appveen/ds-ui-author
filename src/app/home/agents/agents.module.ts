import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { DataGridModule } from 'src/app/utils/data-grid/data-grid.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { SwitchModule } from 'src/app/utils/switch/switch.module';
import { TableCheckboxModule } from 'src/app/utils/table-checkbox/table-checkbox.module';
import { AgentsComponent } from './agents.component';
import { AgGridModule } from 'ag-grid-angular';
import { DateFormatModule } from 'src/app/utils/date-format/date-format.module';
import { OnChangeModule } from 'src/app/utils/directives/on-change/on-change.module';
import { CommonFilterModule } from 'src/app/utils/pipes/common-filter/common-filter.module';
import { BasicInfoModule } from '../../utils/basic-info/basic-info.module';
import { AgentViewComponent } from './agent-view/agent-view.component';
import { AgentLogsComponent } from './agent-view/agent-logs/agent-logs.component';
import { AgentSessionsComponent } from './agent-view/agent-sessions/agent-sessions.component';
import { AgentPermissionsComponent } from './agent-view/agent-permissions/agent-permissions.component';
import { ListDataserviceComponent } from './agent-view/agent-permissions/list-dataservice/list-dataservice.component';
import { ListFlowComponent } from './agent-view/agent-permissions/list-flow/list-flow.component';
import { ListFunctionComponent } from './agent-view/agent-permissions/list-function/list-function.component';

const routes: Routes = [
    { path: '', component: AgentsComponent, pathMatch: 'full' },
    { path: ':id', component: AgentViewComponent }
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
        FormsModule,
        ReactiveFormsModule,
        DataGridModule,
        AutoFocusModule,
        DeleteModalModule,
        SwitchModule,
        DateFormatModule,
        OnChangeModule,
        CommonFilterModule,
        AgGridModule,
        BasicInfoModule
    ],
    declarations: [
        AgentsComponent,
        AgentViewComponent,
        AgentLogsComponent,
        AgentSessionsComponent,
        AgentPermissionsComponent,
        ListDataserviceComponent,
        ListFlowComponent,
        ListFunctionComponent

    ],
    exports: [RouterModule],
    providers: [DatePipe]
})
export class AgentsModule { }
