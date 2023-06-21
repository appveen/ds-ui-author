import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NodeDetailsComponent } from './node-details.component';
import { RouterModule, Routes } from '@angular/router';
import { RouteGuard } from 'src/app/utils/guards/route.guard';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BasicInfoModule } from 'src/app/utils/basic-info/basic-info.module';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { FieldTypeModule } from 'src/app/utils/field-type/field-type.module';
import { PasswordFieldModule } from 'src/app/utils/password-field/password-field.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { SwitchModule } from 'src/app/utils/switch/switch.module';
import { ChangeOnEditModule } from 'src/app/utils/change-on-edit/change-on-edit.module';
import { DataStructureSelectorModule } from 'src/app/utils/data-structure-selector/data-structure-selector.module';
import { B2bFlowsManageModule } from '../../b2b-flows-manage/b2b-flows-manage.module';
import { SystemNodeComponent } from './system-node/system-node.component';


const routes: Routes = [
  { path: '', component: NodeDetailsComponent, canDeactivate: [RouteGuard] }
];
@NgModule({
  declarations: [
    NodeDetailsComponent,
    SystemNodeComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    ClickOutsideModule,
    AutoFocusModule,
    BreadcrumbModule,
    SearchBoxModule,
    DeleteModalModule,
    FieldTypeModule,
    SwitchModule,
    BasicInfoModule,
    PasswordFieldModule,
    ChangeOnEditModule,
    DataStructureSelectorModule,
    B2bFlowsManageModule
  ]
})
export class NodeDetailsModule { }
