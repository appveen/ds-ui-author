import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectorsComponent } from './connectors.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { FieldTypeModule } from 'src/app/utils/field-type/field-type.module';
import { SwitchModule } from 'src/app/utils/switch/switch.module';

const routes: Routes = [
  { path: '', component: ConnectorsComponent }
];

@NgModule({
  declarations: [
    ConnectorsComponent
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
    SwitchModule
  ],
  exports: [
    ConnectorsComponent,
    RouterModule
  ]
})
export class ConnectorsModule { }
