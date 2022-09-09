import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';

import { ServiceManagerComponent } from './service-manager.component';

import { LoadingModule } from '../../utils/loading/loading.module';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { LoadingPlaceholderModule } from 'src/app/utils/loading-placeholder/loading-placeholder.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { CheckboxBtnModule } from 'src/app/utils/checkbox-btn/checkbox-btn.module';
import { DataManagementComponent } from './data-management/data-management.component';
import { ServiceImportWizardModule } from 'src/app/utils/service-import-wizard/service-import-wizard.module';
import { SwitchModule } from 'src/app/utils/switch/switch.module';
import { CheckboxModule } from 'src/app/utils/checkbox/checkbox.module';
import { CommonFilterModule } from 'src/app/utils/pipes/common-filter/common-filter.module';
import { OrderByModule } from 'src/app/utils/pipes/order-by/order-by.module';


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
        LoadingPlaceholderModule,
        AutoFocusModule,
        ClickOutsideModule,
        CheckboxBtnModule,
        ServiceImportWizardModule,
        SwitchModule,
        CheckboxModule,
        CommonFilterModule,
        ClickOutsideModule,
        OrderByModule
    ],
    exports: [
        RouterModule
    ],
    declarations: [
        ServiceManagerComponent,
        DataManagementComponent,
    ]
})
export class ServiceManagerModule { }
