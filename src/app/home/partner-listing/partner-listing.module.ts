import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PartnerListingComponent } from './partner-listing.component';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { CheckboxModule } from 'src/app/utils/checkbox/checkbox.module';

const routes: Routes = [
  {
    path: '', component: PartnerListingComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgbModule,
    ReactiveFormsModule,
    ClickOutsideModule,
    BreadcrumbModule,
    SearchBoxModule,
    AutoFocusModule,
    DeleteModalModule,
    CheckboxModule
  ],
  declarations: [PartnerListingComponent]
})
export class PartnerListingModule { }
