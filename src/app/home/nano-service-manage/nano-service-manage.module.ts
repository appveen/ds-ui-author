import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IconsModule } from 'src/app/utils/icons/icons.module';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { NanoServiceManageComponent } from './nano-service-manage.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TableCheckboxModule } from 'src/app/utils/table-checkbox/table-checkbox.module';
import { BasicInfoModule } from 'src/app/utils/basic-info/basic-info.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { FormatSelectorModule } from 'src/app/utils/format-selector/format-selector.module';
import { SwitchModule } from 'src/app/utils/switch/switch.module';
import { RouteGuard } from 'src/app/utils/guards/route.guard';
import { FormatTypeBadgeModule } from 'src/app/utils/format-type-badge/format-type-badge.module';
import { FilterTeamModule } from 'src/app/utils/pipes/filter-team.module';
import { OrderByModule } from 'src/app/utils/pipes/order-by/order-by.module';

const routes: Routes = [
    {
        path: '', component: NanoServiceManageComponent, canDeactivate: [RouteGuard]
    }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NgbModule,
        IconsModule,
        ClickOutsideModule,
        BreadcrumbModule,
        SearchBoxModule,
        TableCheckboxModule,
        ReactiveFormsModule,
        FormsModule,
        BasicInfoModule,
        AutoFocusModule,
        FormatSelectorModule,
        SwitchModule,
        FormatTypeBadgeModule,
        FilterTeamModule,
        OrderByModule
    ],
    declarations: [NanoServiceManageComponent]
})
export class NanoServiceManageModule { }
