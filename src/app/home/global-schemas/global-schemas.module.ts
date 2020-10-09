import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router/';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GlobalSchemasComponent } from './global-schemas.component';
import { LoadingModule } from '../../utils/loading/loading.module';
import { SchemaUtilsModule } from '../schema-utils/schema-utils.module';
import { RouteGuard } from '../../utils/guards/route.guard';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { BasicInfoModule } from 'src/app/utils/basic-info/basic-info.module';
import { IconsModule } from 'src/app/utils/icons/icons.module';
import { StructureFieldModule } from 'src/app/utils/structure-field/structure-field.module';
import { StructureFieldPropertiesModule } from 'src/app/utils/structure-field-properties/structure-field-properties.module';

const routes: Routes = [
    {
        path: '', component: GlobalSchemasComponent, canDeactivate: [RouteGuard]
    }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        FormsModule,
        NgbModule,
        LoadingModule,
        SchemaUtilsModule,
        BreadcrumbModule,
        AutoFocusModule,
        BasicInfoModule,
        IconsModule,
        StructureFieldModule,
        StructureFieldPropertiesModule
    ],
    exports: [RouterModule],
    declarations: [
        GlobalSchemasComponent,
    ]
})

export class GlobalSchemasModule { }
