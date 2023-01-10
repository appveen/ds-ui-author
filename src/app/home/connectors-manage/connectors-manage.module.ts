import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ConnectorsManageComponent } from './connectors-manage.component';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { FieldTypeModule } from 'src/app/utils/field-type/field-type.module';
import { SwitchModule } from 'src/app/utils/switch/switch.module';
import { BasicInfoModule } from 'src/app/utils/basic-info/basic-info.module';
import { PasswordFieldModule } from 'src/app/utils/password-field/password-field.module';
import { RouteGuard } from '../../utils/guards/route.guard';

const routes: Routes = [
  { path: '', component: ConnectorsManageComponent, canDeactivate: [RouteGuard] }
];

@NgModule({
  declarations: [
    ConnectorsManageComponent
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
    PasswordFieldModule
  ],
  exports: [
    ConnectorsManageComponent,
    RouterModule
  ]
})
export class ConnectorsManageModule { }
