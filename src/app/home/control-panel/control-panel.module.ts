import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ControlPanelRoutingModule } from './control-panel.routing';
import { ControlPanelComponent } from './control-panel.component';
import { AppComponent } from './app/app.component';
import { UserComponent } from './user/user.component';
import { LoadingModule } from '../../utils/loading/loading.module';
import { UserManageComponent } from './user/user-manage/user-manage.component';
import { SchemaUtilsModule } from '../schema-utils/schema-utils.module';
import { SelectedAccessComponent } from './selected-access/selectedAccess.component';
import { TimeoutTriggerModule } from 'src/app/utils/directives/timeout-trigger/timeout-trigger.module';
import { IconsModule } from 'src/app/utils/icons/icons.module';
import { UserGroupManageComponent } from './user-group/user-group-manage/user-group-manage.component';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { ClickOutsideModule } from '../../utils/directives/click-outside/click-outside.module';
import { UserGroupComponent } from './user-group/user-group.component';
import { FilterUserModule } from 'src/app/utils/pipes/filter-user.module';
import { DataGridModule } from 'src/app/utils/data-grid/data-grid.module';
import { FilterTeamModule } from 'src/app/utils/pipes/filter-team.module';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { UserGroupAuthorComponent } from './user-group/user-group-manage/user-group-author/user-group-author.component';
import { UserGroupAppcenterComponent } from './user-group/user-group-manage/user-group-appcenter/user-group-appcenter.component';
import { UserGroupMembersComponent } from './user-group/user-group-manage/user-group-members/user-group-members.component';
import { AuthUsersModule } from 'src/app/auth-users/auth-users.module';
import { FilterAppModule } from 'src/app/utils/pipes/filter-app.module';
import { TableCheckboxModule } from 'src/app/utils/table-checkbox/table-checkbox.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { CommonFilterModule } from 'src/app/utils/pipes/common-filter/common-filter.module';
import { BasicInfoModule } from 'src/app/utils/basic-info/basic-info.module';
import { RoundCheckModule } from 'src/app/utils/round-check/round-check.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { LoadingPlaceholderModule } from 'src/app/utils/loading-placeholder/loading-placeholder.module';
import { FocusNextModule } from 'src/app/utils/focus-next/focus-next.module';
import { UserGroupBotsComponent } from './user-group/user-group-manage/user-group-bots/user-group-bots.component';
import { BookmarksComponent } from './bookmarks/bookmarks.component';
import { ManageBookmarksComponent } from './bookmarks/manage-bookmarks/manage-bookmarks.component';
import { FilterFlowPipeModule } from 'src/app/utils/pipes/filter-flow.module';
import { UserGroupAppcenterServicesComponent } from './user-group/user-group-manage/user-group-appcenter/user-group-appcenter-services/user-group-appcenter-services.component';
import { UserGroupAppcenterBokmarkComponent } from './user-group/user-group-manage/user-group-appcenter/user-group-appcenter-bokmark/user-group-appcenter-bokmark.component';
import { UserGroupAppcenterFlowsComponent } from './user-group/user-group-manage/user-group-appcenter/user-group-appcenter-flows/user-group-appcenter-flows.component';
import { WorkitemsComponent } from './workitems/workitems.component';
import { GroupAuthorBotsComponent } from './user-group/user-group-manage/user-group-author/group-author-bots/group-author-bots.component';
import { GroupAuthorGroupsComponent } from './user-group/user-group-manage/user-group-author/group-author-groups/group-author-groups.component';
import { GroupAuthorUsersComponent } from './user-group/user-group-manage/user-group-author/group-author-users/group-author-users.component';
import { GroupAuthorDataServicesComponent } from './user-group/user-group-manage/user-group-author/group-author-data-services/group-author-data-services.component';
import { GroupAuthorDataFormatsComponent } from './user-group/user-group-manage/user-group-author/group-author-data-formats/group-author-data-formats.component';
import { GroupAuthorAgentsComponent } from './user-group/user-group-manage/user-group-author/group-author-agents/group-author-agents.component';
import { GroupAuthorLibraryComponent } from './user-group/user-group-manage/user-group-author/group-author-library/group-author-library.component';
import { GroupAuthorFunctionsComponent } from './user-group/user-group-manage/user-group-author/group-author-functions/group-author-functions.component';
import { GroupAuthorPartnersComponent } from './user-group/user-group-manage/user-group-author/group-author-partners/group-author-partners.component';
import { GroupAuthorNanoServicesComponent } from './user-group/user-group-manage/user-group-author/group-author-nano-services/group-author-nano-services.component';
import { GroupAuthorBookmarksComponent } from './user-group/user-group-manage/user-group-author/group-author-bookmarks/group-author-bookmarks.component';
import { FieldTypeModule } from 'src/app/utils/field-type/field-type.module';
import { SwitchModule } from 'src/app/utils/switch/switch.module';
import { GroupAuthorInsightsComponent } from './user-group/user-group-manage/user-group-author/group-author-insights/group-author-insights.component';
import { AgGridModule } from 'ag-grid-angular';
import { GridCheckboxModule } from 'src/app/utils/grid-checkbox/grid-checkbox.module';
import { UserListCellRendererModule } from 'src/app/utils/user-list-cell-renderer/user-list-cell-renderer.module';
import { AgGridSharedFloatingFilterModule } from 'src/app/utils/ag-grid-shared-floating-filter/ag-grid-shared-floating-filter.module';
import { AgGridActionsRendererModule } from 'src/app/utils/ag-grid-actions-renderer/ag-grid-actions-renderer.module';
import { AttributesCellRendererComponent } from './attributes-cell-renderer/attributes-cell-renderer.component';
import { DateFormatModule } from 'src/app/utils/date-format/date-format.module';
import { AgGridFilterModule } from 'src/app/utils/ag-grid-filter/ag-grid-filter.module';
import { RadioChipModule } from 'src/app/utils/radio-chip/radio-chip.module';
import { BulkImportComponent } from './user/bulk-import/bulk-import.component';
import { BulkImportStatusComponent } from './user/bulk-import-status/bulk-import-status.component';
import { CheckboxModule } from 'src/app/utils/checkbox/checkbox.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ControlPanelRoutingModule,
        NgbModule,
        LoadingModule,
        SchemaUtilsModule,
        ClickOutsideModule,
        TimeoutTriggerModule,
        IconsModule,
        SearchBoxModule,
        FilterUserModule,
        FilterTeamModule,
        FilterAppModule,
        DataGridModule,
        BreadcrumbModule,
        AuthUsersModule,
        TableCheckboxModule,
        AutoFocusModule,
        CommonFilterModule,
        BasicInfoModule,
        RoundCheckModule,
        DeleteModalModule,
        LoadingPlaceholderModule,
        FocusNextModule,
        FilterFlowPipeModule,
        FieldTypeModule,
        SwitchModule,
        AgGridModule,
        GridCheckboxModule,
        UserListCellRendererModule,
        AgGridSharedFloatingFilterModule,
        AgGridActionsRendererModule,
        DateFormatModule,
        AgGridFilterModule,
        RadioChipModule,
        CheckboxModule
    ],
    declarations: [
        ControlPanelComponent,
        AppComponent,
        UserComponent,
        UserManageComponent,
        SelectedAccessComponent,
        UserGroupComponent,
        UserGroupManageComponent,
        UserGroupComponent,
        UserGroupAuthorComponent,
        UserGroupAppcenterComponent,
        UserGroupMembersComponent,
        UserGroupBotsComponent,
        BookmarksComponent,
        ManageBookmarksComponent,
        UserGroupAppcenterServicesComponent,
        UserGroupAppcenterBokmarkComponent,
        UserGroupAppcenterFlowsComponent,
        WorkitemsComponent,
        GroupAuthorBotsComponent,
        GroupAuthorGroupsComponent,
        GroupAuthorUsersComponent,
        GroupAuthorDataServicesComponent,
        GroupAuthorDataFormatsComponent,
        GroupAuthorAgentsComponent,
        GroupAuthorLibraryComponent,
        GroupAuthorFunctionsComponent,
        GroupAuthorPartnersComponent,
        GroupAuthorNanoServicesComponent,
        GroupAuthorBookmarksComponent,
        GroupAuthorInsightsComponent,
        AttributesCellRendererComponent,
        BulkImportComponent,
        BulkImportStatusComponent
    ]
})
export class ControlPanelModule {}
