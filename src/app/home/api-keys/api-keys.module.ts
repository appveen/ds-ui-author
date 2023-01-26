import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ApiKeysListComponent } from './api-keys-list/api-keys-list.component';
import { ApiKeysManageComponent } from './api-keys-manage/api-keys-manage.component';
import { ApiKeysService } from './api-keys.service';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { ListDataserviceComponent } from './api-keys-manage/list-dataservice/list-dataservice.component';
import { ListFunctionComponent } from './api-keys-manage/list-function/list-function.component';
import { ListFlowComponent } from './api-keys-manage/list-flow/list-flow.component';
import { SwitchModule } from 'src/app/utils/switch/switch.module';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'list' },
  { path: 'list', component: ApiKeysListComponent },
  { path: ':id', component: ApiKeysManageComponent }
];

@NgModule({
  declarations: [
    ApiKeysListComponent,
    ApiKeysManageComponent,
    ListDataserviceComponent,
    ListFunctionComponent,
    ListFlowComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ClickOutsideModule,
    SearchBoxModule,
    AutoFocusModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    DeleteModalModule,
    SwitchModule
  ],
  providers: [
    ApiKeysService
  ]
})
export class ApiKeysModule { }
