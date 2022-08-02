import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgGridModule } from 'ag-grid-angular';

import { FaasListingComponent } from './faas-listing/faas-listing.component';
import { FaasManageComponent } from './faas-manage/faas-manage.component';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { FormatTypeBadgeModule } from 'src/app/utils/format-type-badge/format-type-badge.module';
import { BasicInfoModule } from 'src/app/utils/basic-info/basic-info.module';
import { CodeEditorModule } from 'src/app/utils/code-editor/code-editor.module';
import { FaasCellComponent } from './faas-listing/faas-cell/faas-cell.component';
import { FaasFilterComponent } from './faas-listing/faas-filter/faas-filter.component';
import { DateFormatModule } from 'src/app/utils/date-format/date-format.module';
import { OnChangeModule } from 'src/app/utils/directives/on-change/on-change.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { CommonFilterModule } from 'src/app/utils/pipes/common-filter/common-filter.module';


const routes: Routes = [
  { path: '', pathMatch: 'full', component: FaasListingComponent },
  { path: ':id', component: FaasManageComponent }
];

@NgModule({
  declarations: [FaasListingComponent, FaasManageComponent, FaasCellComponent, FaasFilterComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    ClickOutsideModule,
    BreadcrumbModule,
    SearchBoxModule,
    DeleteModalModule,
    FormatTypeBadgeModule,
    BasicInfoModule,
    BreadcrumbModule,
    CodeEditorModule,
    AgGridModule.withComponents([
      FaasCellComponent,
      FaasFilterComponent
    ]),
    DateFormatModule,
    OnChangeModule,
    AutoFocusModule,
    CommonFilterModule
  ],
  exports: [RouterModule]
})
export class FaasModule { }
