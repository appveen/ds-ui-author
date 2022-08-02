import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NanoServiceListingComponent } from './nano-service-listing.component';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { FormatTypeBadgeModule } from 'src/app/utils/format-type-badge/format-type-badge.module';

const routes: Routes = [
  {
    path: '', component: NanoServiceListingComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NgbModule,
    ClickOutsideModule,
    BreadcrumbModule,
    SearchBoxModule,
    DeleteModalModule,
    FormatTypeBadgeModule
  ],
  declarations: [NanoServiceListingComponent]
})
export class NanoServiceListingModule { }
