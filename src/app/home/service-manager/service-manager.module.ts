import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';

import { ServiceManagerComponent } from './service-manager.component';

import { LoadingModule } from '../../utils/loading/loading.module';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { IconsModule } from 'src/app/utils/icons/icons.module';
import { LoadingPlaceholderModule } from 'src/app/utils/loading-placeholder/loading-placeholder.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { CheckboxBtnModule } from 'src/app/utils/checkbox-btn/checkbox-btn.module';
import { DataManagementComponent } from './data-management/data-management.component';
import { FormsModule } from '@angular/forms';
import { ServiceImportWizardModule } from 'src/app/utils/service-import-wizard/service-import-wizard.module';
import { DsGridStatusComponent } from './ds-grid-status/ds-grid-status.component';
import { DsGridActionsComponent } from './ds-grid-actions/ds-grid-actions.component';
import { SwitchModule } from 'src/app/utils/switch/switch.module';


const routes = [
    { path: '', component: ServiceManagerComponent },
    { path: 'settings', component: DataManagementComponent },

];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        LoadingModule,
        AgGridModule,
        BreadcrumbModule,
        SearchBoxModule,
        DeleteModalModule,
        IconsModule,
        LoadingPlaceholderModule,
        AutoFocusModule,
        ClickOutsideModule,
        CheckboxBtnModule,
        ServiceImportWizardModule,
        SwitchModule
    ],
    exports: [
        RouterModule
    ],
    declarations: [
        ServiceManagerComponent,
        DataManagementComponent,
        DsGridStatusComponent,
        DsGridActionsComponent
    ]
})
export class ServiceManagerModule { }
