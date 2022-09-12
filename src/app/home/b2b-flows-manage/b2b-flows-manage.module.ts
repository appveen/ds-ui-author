import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { B2bFlowsManageComponent } from './b2b-flows-manage.component';
import { ViewBoxDirective } from './view-box.directive';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { FormatTypeBadgeModule } from 'src/app/utils/format-type-badge/format-type-badge.module';
import { BasicInfoModule } from 'src/app/utils/basic-info/basic-info.module';
import { CodeEditorModule } from 'src/app/utils/code-editor/code-editor.module';
import { DateFormatModule } from 'src/app/utils/date-format/date-format.module';
import { OnChangeModule } from 'src/app/utils/directives/on-change/on-change.module';
import { FlowNodeComponent } from './flow-node/flow-node.component';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { B2bFlowService } from './b2b-flow.service';
import { MappingIconComponent } from './icons/mapping-icon/mapping-icon.component';
import { InvokeApiIconComponent } from './icons/invoke-api-icon/invoke-api-icon.component';
import { ResponseIconComponent } from './icons/response-icon/response-icon.component';
import { DataServiceIconComponent } from './icons/data-service-icon/data-service-icon.component';
import { FunctionIconComponent } from './icons/function-icon/function-icon.component';
import { ConnectorIconComponent } from './icons/connector-icon/connector-icon.component';
import { NodePropertiesComponent } from './node-properties/node-properties.component';
import { CheckboxModule } from 'src/app/utils/checkbox/checkbox.module';
import { NodeMappingComponent } from './node-properties/node-mapping/node-mapping.component';
import { DataStructureSelectorModule } from 'src/app/utils/data-structure-selector/data-structure-selector.module';

const routes: Routes = [
  {
    path: '', component: B2bFlowsManageComponent
  }
];

@NgModule({
  declarations: [
    B2bFlowsManageComponent,
    ViewBoxDirective,
    FlowNodeComponent,
    MappingIconComponent,
    InvokeApiIconComponent,
    ResponseIconComponent,
    DataServiceIconComponent,
    FunctionIconComponent,
    ConnectorIconComponent,
    NodePropertiesComponent,
    NodeMappingComponent
  ],
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
    DateFormatModule,
    OnChangeModule,
    AutoFocusModule,
    CheckboxModule,
    DataStructureSelectorModule
  ],
  exports: [B2bFlowsManageComponent],
  providers:[B2bFlowService]
})
export class B2bFlowsManageModule { }
