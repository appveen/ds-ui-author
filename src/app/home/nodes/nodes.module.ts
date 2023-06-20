import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NodesComponent } from './nodes.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { RouterModule, Routes } from '@angular/router';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';


const routes: Routes = [
  {
    path: '', component: NodesComponent
  },
 
];

@NgModule({
  declarations: [NodesComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    ClickOutsideModule,
    BreadcrumbModule,
    SearchBoxModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    DeleteModalModule,
  ]
})
export class NodesModule { }
