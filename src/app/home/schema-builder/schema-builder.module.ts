import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router/';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SchemaBuilderComponent } from './schema-builder.component';
import { SchemaUtilsModule } from '../schema-utils/schema-utils.module';
import { LoadingModule } from '../../utils/loading/loading.module';
import { RouteGuard } from '../../utils/guards/route.guard';
import { LogsModule } from '../logs/logs.module';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { BasicInfoModule } from 'src/app/utils/basic-info/basic-info.module';
import { StructureFieldModule } from 'src/app/utils/structure-field/structure-field.module';
import { StructureFieldPropertiesModule } from 'src/app/utils/structure-field-properties/structure-field-properties.module';
import { PrettyJsonModule } from 'src/app/utils/pretty-json/pretty-json.module';
import { SortablejsModule } from 'ngx-sortablejs';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: SchemaBuilderComponent, canDeactivate: [RouteGuard] }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    LoadingModule,
    LogsModule,
    SchemaUtilsModule,
    BreadcrumbModule,
    AutoFocusModule,
    BasicInfoModule,
    StructureFieldModule,
    StructureFieldPropertiesModule,
    PrettyJsonModule,
    SortablejsModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    SchemaBuilderComponent
  ]
})
export class SchemaBuilderModule { }
