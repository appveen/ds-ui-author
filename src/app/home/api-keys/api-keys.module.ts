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

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'list' },
  { path: 'list', component: ApiKeysListComponent },
  { path: ':id', component: ApiKeysManageComponent }
];

@NgModule({
  declarations: [
    ApiKeysListComponent,
    ApiKeysManageComponent
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
    DeleteModalModule
  ],
  providers: [
    ApiKeysService
  ]
})
export class ApiKeysModule { }
