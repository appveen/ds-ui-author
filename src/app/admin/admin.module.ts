import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AdminComponent } from 'src/app/admin/admin.component';
import { AdminRoutingModule } from 'src/app/admin/admin.routing';
import { FilterPipeModule } from 'src/app/utils/pipes/filter.module';
import { AppCenterPreviewModule } from 'src/app/utils/app-center-preview/app-center-preview.module';
import { ColorPickerModule } from 'src/app/utils/color-picker/color-picker.module';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { AppSwitcherModule } from 'src/app/utils/app-switcher/app-switcher.module';
import { AppListComponent } from './app-list/app-list.component';
import { AppManageComponent } from './app-manage/app-manage.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserManageComponent } from './user-list/user-manage/user-manage.component';
import { UserInfoComponent } from './user-list/user-manage/user-info/user-info.component';
import { UserAppsComponent } from './user-list/user-manage/user-apps/user-apps.component';
import { FilterUserModule } from 'src/app/utils/pipes/filter-user.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { FilterAppModule } from 'src/app/utils/pipes/filter-app.module';
import { UserGroupsComponent } from 'src/app/admin/user-list/user-manage/user-teams/user-groups.component';
import { ChangePasswordModule } from '../utils/change-password/change-password.module';
import { FilterTeamModule } from 'src/app/utils/pipes/filter-team.module';
import { TimeoutTriggerModule } from '../utils/directives/timeout-trigger/timeout-trigger.module';
import { AuthUsersModule } from '../auth-users/auth-users.module';
import { AutoFocusModule } from '../utils/directives/auto-focus/auto-focus.module';
import { DataGridModule } from '../utils/data-grid/data-grid.module';
import { UserBulkUploadComponent } from './user-list/user-bulk-upload/user-bulk-upload.component';
import { DragAndDropModule } from '../utils/directives/drag-and-drop/drag-and-drop.module';
import { RoundCheckModule } from '../utils/round-check/round-check.module';
import { DeleteModalModule } from '../utils/delete-modal/delete-modal.module';
import { LoadingPlaceholderModule } from '../utils/loading-placeholder/loading-placeholder.module';
import { FieldTypeModule } from '../utils/field-type/field-type.module';
import { SwitchModule } from '../utils/switch/switch.module';
import { AgentsComponent } from './agents/agents.component';
import { BreadcrumbModule } from '../utils/breadcrumb/breadcrumb.module';
import { LoadingModule } from '../utils/loading/loading.module';
import { AgGridModule } from 'ag-grid-angular';
import { GridCheckboxModule } from '../utils/grid-checkbox/grid-checkbox.module';
import { UserListCellRendererModule } from '../utils/user-list-cell-renderer/user-list-cell-renderer.module';
import { TimezonePickerModule } from '../utils/timezone-picker/timezone-picker.module';
import { AgGridSharedFloatingFilterModule } from '../utils/ag-grid-shared-floating-filter/ag-grid-shared-floating-filter.module';
import { DateFormatModule } from '../utils/date-format/date-format.module';
import { MetadataComponent } from './metadata/metadata.component';
import { MapperFormulasComponent } from './metadata/mapper-formulas/mapper-formulas.component';
import { CodeEditorModule } from '../utils/code-editor/code-editor.module';
import { CustomNodeComponent } from './metadata/custom-node/custom-node.component';
import { NpmLibrariesComponent } from './metadata/npm-libraries/npm-libraries.component';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AppCenterPreviewModule,
    ColorPickerModule,
    ClickOutsideModule,
    FilterPipeModule,
    AppSwitcherModule,
    FilterUserModule,
    SearchBoxModule,
    FilterAppModule,
    FilterTeamModule,
    ChangePasswordModule,
    ChangePasswordModule,
    TimeoutTriggerModule,
    AuthUsersModule,
    AutoFocusModule,
    DataGridModule,
    DragAndDropModule,
    RoundCheckModule,
    DeleteModalModule,
    LoadingPlaceholderModule,
    FieldTypeModule,
    SwitchModule,
    BreadcrumbModule,
    LoadingModule,
    AgGridModule,
    GridCheckboxModule,
    UserListCellRendererModule,
    TimezonePickerModule,
    AgGridSharedFloatingFilterModule,
    DateFormatModule,
    ClickOutsideModule,
    CodeEditorModule
  ],
  exports: [AppListComponent],
  declarations: [
    AdminComponent,
    AppListComponent,
    AppManageComponent,
    UserListComponent,
    UserManageComponent,
    UserInfoComponent,
    UserAppsComponent,
    UserGroupsComponent,
    UserBulkUploadComponent,
    AgentsComponent,
    MetadataComponent,
    MapperFormulasComponent,
    CustomNodeComponent,
    NpmLibrariesComponent
  ],
})
export class AdminModule { }
