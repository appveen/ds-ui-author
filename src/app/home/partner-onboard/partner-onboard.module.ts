import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { PartnerOnboardComponent } from './partner-onboard.component';
import { RouteGuard } from 'src/app/utils/guards/route.guard';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { PartnerMicroflowsComponent } from './partner-microflows/partner-microflows.component';
import { PartnerConfigurationComponent } from './partner-configuration/partner-configuration.component';
import { PartnerSecretsComponent } from './partner-secrets/partner-secrets.component';
import { DataGridModule } from 'src/app/utils/data-grid/data-grid.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { TableCheckboxModule } from 'src/app/utils/table-checkbox/table-checkbox.module';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { BasicInfoModule } from 'src/app/utils/basic-info/basic-info.module';
import { FilterTeamModule } from 'src/app/utils/pipes/filter-team.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { PartnerPropertiesComponent } from './partner-properties/partner-properties.component';
import { OrderByModule } from 'src/app/utils/pipes/order-by/order-by.module';
import { SwitchModule } from 'src/app/utils/switch/switch.module';
import { PartnerManagementComponent } from './partner-management/partner-management.component';
import { IntegrationFlowModule } from 'src/app/utils/integration-flow/integration-flow.module';
import { CheckboxModule } from 'src/app/utils/checkbox/checkbox.module';
import { LoadingModule } from 'src/app/utils/loading/loading.module';

const routes: Routes = [
  {
    path: '', pathMatch: 'full', component: PartnerOnboardComponent, canDeactivate: [RouteGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    NgbModule,
    BreadcrumbModule,
    DataGridModule,
    ReactiveFormsModule,
    SearchBoxModule,
    TableCheckboxModule,
    ClickOutsideModule,
    BasicInfoModule,
    FilterTeamModule,
    AutoFocusModule,
    DeleteModalModule,
    OrderByModule,
    SwitchModule,
    IntegrationFlowModule,
    CheckboxModule,
    LoadingModule
  ],
  declarations: [
    PartnerOnboardComponent,
    PartnerMicroflowsComponent,
    PartnerConfigurationComponent,
    PartnerSecretsComponent,
    PartnerPropertiesComponent,
    PartnerManagementComponent
  ],
  exports: [PartnerOnboardComponent, RouterModule],
  providers: [DatePipe]
})
export class PartnerOnboardModule { }
