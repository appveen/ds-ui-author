import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LibraryComponent } from './library.component';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { IconsModule } from 'src/app/utils/icons/icons.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';

const routes = [
  { path: '', component: LibraryComponent },
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    RouterModule.forChild(routes),
    BreadcrumbModule,
    SearchBoxModule,
    IconsModule,
    DeleteModalModule
  ],
  declarations: [
    LibraryComponent
  ]
})
export class LibraryModule { }
