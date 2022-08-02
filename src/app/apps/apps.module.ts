import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppsComponent } from './apps.component';
import { AppsRoutingModule } from 'src/app/apps/apps.routing';
import { LoadingModule } from 'src/app/utils/loading/loading.module';
import { FilterPipeModule } from 'src/app/utils/pipes/filter.module';
import { AppSwitcherModule } from 'src/app/utils/app-switcher/app-switcher.module';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { ChangePasswordModule } from '../utils/change-password/change-password.module';
import { DateFormatModule } from '../utils/date-format/date-format.module';
import { BreadcrumbModule } from '../utils/breadcrumb/breadcrumb.module';

@NgModule({
  imports: [
    CommonModule,
    AppsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    LoadingModule,
    FilterPipeModule,
    AppSwitcherModule,
    ClickOutsideModule,
    ChangePasswordModule,
    DateFormatModule,
    BreadcrumbModule,
  ],
  declarations: [AppsComponent],
})
export class AppsModule {}
