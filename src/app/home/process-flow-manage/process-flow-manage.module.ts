import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessFlowManageComponent } from './process-flow-manage.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AutocompleteOnEditModule } from 'src/app/utils/autocomplete-on-edit/autocomplete-on-edit.module';
import { BasicInfoModule } from 'src/app/utils/basic-info/basic-info.module';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { ChangeOnEditModule } from 'src/app/utils/change-on-edit/change-on-edit.module';
import { CheckboxModule } from 'src/app/utils/checkbox/checkbox.module';
import { CodeEditorModule } from 'src/app/utils/code-editor/code-editor.module';
import { ColorPickerModule } from 'src/app/utils/color-picker/color-picker.module';
import { DataStructureSelectorModule } from 'src/app/utils/data-structure-selector/data-structure-selector.module';
import { DateFormatModule } from 'src/app/utils/date-format/date-format.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { OnChangeModule } from 'src/app/utils/directives/on-change/on-change.module';
import { EditorModule } from 'src/app/utils/editor/editor.module';
import { FieldTypeModule } from 'src/app/utils/field-type/field-type.module';
import { FormatTypeBadgeModule } from 'src/app/utils/format-type-badge/format-type-badge.module';
import { RouteGuard } from 'src/app/utils/guards/route.guard';
import { OnHoverModule } from 'src/app/utils/on-hover/on-hover.module';
import { PayloadCreatorModule } from 'src/app/utils/payload-creator/payload-creator.module';
import { CommonFilterModule } from 'src/app/utils/pipes/common-filter/common-filter.module';
import { RoundRadioModule } from 'src/app/utils/round-radio/round-radio.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { SideCanvasModule } from 'src/app/utils/side-canvas/side-canvas.module';
import { StyledTextModule } from 'src/app/utils/styled-text/styled-text.module';
import { SwitchModule } from 'src/app/utils/switch/switch.module';

import { ProcessFlowNodeComponent } from './process-node/process-node.component';
import { ProcessNodePropertiesComponent } from './process-node-properties/process-node-properties.component';
import { PathConditionCreatorComponent } from './path-properties/path-condition-creator/path-condition-creator.component';
import { PathPropertiesComponent } from './path-properties/path-properties.component';


const routes: Routes = [
  {
    path: '', component: ProcessFlowManageComponent, canDeactivate: [RouteGuard]
  }
];


@NgModule({
  declarations: [
    ProcessFlowManageComponent,
    ProcessFlowNodeComponent,
    ProcessNodePropertiesComponent,
    PathConditionCreatorComponent,
    PathPropertiesComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    ClickOutsideModule,
    BreadcrumbModule,
    SearchBoxModule,
    DeleteModalModule,
    FormatTypeBadgeModule,
    BasicInfoModule,
    BreadcrumbModule,
    CodeEditorModule,
    DateFormatModule,
    OnChangeModule,
    AutoFocusModule,
    CheckboxModule,
    DataStructureSelectorModule,
    RoundRadioModule,
    OnHoverModule,
    ColorPickerModule,
    PayloadCreatorModule,
    SwitchModule,
    CommonFilterModule,
    StyledTextModule,
    FieldTypeModule,
    ChangeOnEditModule,
    AutocompleteOnEditModule,
    EditorModule,
    SideCanvasModule
  ]
})
export class ProcessFlowManageModule { }
