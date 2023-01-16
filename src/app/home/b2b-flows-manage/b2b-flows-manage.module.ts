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
import { NodePropertiesComponent } from './node-properties/node-properties.component';
import { CheckboxModule } from 'src/app/utils/checkbox/checkbox.module';
import { NodeMappingComponent } from './node-properties/node-mapping/node-mapping.component';
import { DataStructureSelectorModule } from 'src/app/utils/data-structure-selector/data-structure-selector.module';
import { FunctionSelectorComponent } from './node-properties/function-selector/function-selector.component';
import { ServiceSelectorComponent } from './node-properties/service-selector/service-selector.component';
import { AgentSelectorComponent } from './node-properties/agent-selector/agent-selector.component';
import { RoundRadioModule } from 'src/app/utils/round-radio/round-radio.module';
import { DataServicePropertiesComponent } from './node-properties/data-service-properties/data-service-properties.component';
import { ConnectorPropertiesComponent } from './node-properties/connector-properties/connector-properties.component';
import { SftpConnectorComponent } from './node-properties/connector-properties/sftp-connector/sftp-connector.component';
import { MysqlConnectorComponent } from './node-properties/connector-properties/mysql-connector/mysql-connector.component';
import { PostgreConnectorComponent } from './node-properties/connector-properties/postgre-connector/postgre-connector.component';
import { KafkaConnectorComponent } from './node-properties/connector-properties/kafka-connector/kafka-connector.component';
import { MongodbConnectorComponent } from './node-properties/connector-properties/mongodb-connector/mongodb-connector.component';
import { RouteGuard } from '../../utils/guards/route.guard';
import { NodeDataSelectorComponent } from './node-properties/node-data-selector/node-data-selector.component';
import { AddHeadersComponent } from './node-properties/add-headers/add-headers.component';
import { MssqlConnectorComponent } from './node-properties/connector-properties/mssql-connector/mssql-connector.component';
import { SourceFieldsComponent } from './node-properties/node-mapping/source-fields/source-fields.component';
import { TargetFieldsComponent } from './node-properties/node-mapping/target-fields/target-fields.component';
import { SourceSelectorComponent } from './node-properties/node-mapping/source-selector/source-selector.component';
import { FormulaEditorComponent } from './node-properties/node-mapping/formula-editor/formula-editor.component';

const routes: Routes = [
  {
    path: '', component: B2bFlowsManageComponent, canDeactivate: [RouteGuard]
  }
];

@NgModule({
  declarations: [
    B2bFlowsManageComponent,
    ViewBoxDirective,
    FlowNodeComponent,
    NodePropertiesComponent,
    NodeMappingComponent,
    FunctionSelectorComponent,
    ServiceSelectorComponent,
    AgentSelectorComponent,
    DataServicePropertiesComponent,
    ConnectorPropertiesComponent,
    SftpConnectorComponent,
    MysqlConnectorComponent,
    PostgreConnectorComponent,
    KafkaConnectorComponent,
    MongodbConnectorComponent,
    NodeDataSelectorComponent,
    AddHeadersComponent,
    MssqlConnectorComponent,
    SourceFieldsComponent,
    TargetFieldsComponent,
    SourceSelectorComponent,
    FormulaEditorComponent
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
    DataStructureSelectorModule,
    RoundRadioModule
  ],
  exports: [B2bFlowsManageComponent],
  providers: [B2bFlowService]
})
export class B2bFlowsManageModule { }
