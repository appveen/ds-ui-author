import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';

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
import { ServiceImportWizardModule } from 'src/app/utils/service-import-wizard/service-import-wizard.module';


const routes = [
    { path: '', component: ServiceManagerComponent },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NgbModule,
        ReactiveFormsModule,
        LoadingModule,
        BreadcrumbModule,
        SearchBoxModule,
        DeleteModalModule,
        IconsModule,
        LoadingPlaceholderModule,
        AutoFocusModule,
        ClickOutsideModule,
        CheckboxBtnModule,
        ServiceImportWizardModule
    ],
    exports: [
        RouterModule
    ],
    declarations: [
        ServiceManagerComponent
    ]
})
export class ServiceManagerModule { }
