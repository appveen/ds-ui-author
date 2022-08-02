import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgGridModule } from 'ag-grid-angular';

import { B2bFlowsComponent } from './b2b-flows.component';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { FormatTypeBadgeModule } from 'src/app/utils/format-type-badge/format-type-badge.module';
import { B2bFlowCellComponent } from './b2b-flow-cell/b2b-flow-cell.component';
import { B2bFlowFilterComponent } from './b2b-flow-filter/b2b-flow-filter.component';
import { BasicInfoModule } from 'src/app/utils/basic-info/basic-info.module';
import { CodeEditorModule } from 'src/app/utils/code-editor/code-editor.module';
import { DateFormatModule } from 'src/app/utils/date-format/date-format.module';
import { OnChangeModule } from 'src/app/utils/directives/on-change/on-change.module';

const routes: Routes = [
  {
    path: '', component: B2bFlowsComponent
  }
];

@NgModule({
  declarations: [B2bFlowsComponent, B2bFlowCellComponent, B2bFlowFilterComponent],
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
      B2bFlowCellComponent,
      B2bFlowFilterComponent
    ]),
    DateFormatModule,
    OnChangeModule
  ],
  exports: [B2bFlowsComponent]
})
export class B2bFlowsModule { }
