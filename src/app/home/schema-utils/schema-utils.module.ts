import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SortablejsModule } from 'ngx-sortablejs';

import { SchemaBuilderService } from './schema-builder.service';
import { SchemaStructurePipe } from './schema-structure.pipe';
import { SchemaValuePipe } from './schema-value.pipe';
import { GlobalSchemaStructurePipe } from './global-schema-structure.pipe';
import { GlobalSchemaValuePipe } from './global-schema-value.pipe';
import { SchemaAttributesPipe } from './schema-attributes.pipe';
import { LoadingModule } from '../../utils/loading/loading.module';
import { ManagePermissionsComponent } from './manage-permissions/manage-permissions.component';
import { WizardsComponent } from 'src/app/home/schema-utils/wizards/wizards.component';
import { FilterRolePipeModule } from 'src/app/utils/pipes/filter-role.module';
import { IntegrationComponent } from 'src/app/home/schema-utils/integration/integration.component';
import { ConfigurationComponent } from 'src/app/home/schema-utils/configuration/configuration.component';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { CheckboxBtnModule } from 'src/app/utils/checkbox-btn/checkbox-btn.module';
import { DatePickerModule } from 'src/app/utils/date-picker/datePicker.module';
import { FieldTypeModule } from 'src/app/utils/field-type/field-type.module';
import { FocusNextModule } from 'src/app/utils/focus-next/focus-next.module';
import { SwitchModule } from 'src/app/utils/switch/switch.module';
import { SearchTermModule } from 'src/app/utils/search-term/search-term.module';
import { PathCreatorComponent } from './manage-permissions/path-creator/path-creator.component';
import { FilterDefinitionModule } from 'src/app/utils/pipes/filter-definition/filter-definition.module';
import { LogicalConditionComponent } from './manage-permissions/logical-condition/logical-condition.component';
import { LoadingPlaceholderModule } from 'src/app/utils/loading-placeholder/loading-placeholder.module';
import { CheckboxModule } from 'src/app/utils/checkbox/checkbox.module';
import { StateModelComponent } from './state-model/state-model.component';
import { FilterNextStatePipe } from './filter-next-state.pipe';
import { MakerCheckerComponent } from './maker-checker/maker-checker.component';
import { DynamicConditionComponent } from './manage-permissions/dynamic-condition/dynamic-condition.component';
import { RoundRadioModule } from 'src/app/utils/round-radio/round-radio.module';
import { MonotypeEditorModule } from 'src/app/utils/monotype-editor/monotype-editor.module';
import { CommonSettingsComponent } from './configuration/common-settings/common-settings.component';
import { DataSettingsComponent } from './configuration/data-settings/data-settings.component';
import { SearchSettingsComponent } from './configuration/search-settings/search-settings.component';
import { ResetServiceComponent } from './reset-service/reset-service.component';
import { StepFieldsComponent } from './wizards/step-fields/step-fields.component';
import { StepActionsComponent } from './wizards/step-actions/step-actions.component';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { DataIngestionComponent } from './data-ingestion/data-ingestion.component';
import { ConnectorSettingsComponent } from './configuration/connector-settings/connector-settings.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgbModule,
        LoadingModule,
        FilterRolePipeModule,
        ClickOutsideModule,
        AutoFocusModule,
        CheckboxBtnModule,
        DatePickerModule,
        FieldTypeModule,
        FocusNextModule,
        SwitchModule,
        SearchTermModule,
        FilterDefinitionModule,
        LoadingPlaceholderModule,
        SortablejsModule,
        CheckboxModule,
        MatFormFieldModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatChipsModule,
        RoundRadioModule,
        MonotypeEditorModule,
        DeleteModalModule
    ],
    declarations: [
        SchemaStructurePipe,
        SchemaValuePipe,
        GlobalSchemaStructurePipe,
        GlobalSchemaValuePipe,
        SchemaAttributesPipe,
        ManagePermissionsComponent,
        WizardsComponent,
        IntegrationComponent,
        ConfigurationComponent,
        PathCreatorComponent,
        LogicalConditionComponent,
        StateModelComponent,
        FilterNextStatePipe,
        MakerCheckerComponent,
        DynamicConditionComponent,
        CommonSettingsComponent,
        DataSettingsComponent,
        SearchSettingsComponent,
        ResetServiceComponent,
        StepFieldsComponent,
        StepActionsComponent,
        DataIngestionComponent,
        ConnectorSettingsComponent
    ],
    exports: [
        SchemaStructurePipe,
        SchemaValuePipe,
        GlobalSchemaStructurePipe,
        GlobalSchemaValuePipe,
        SchemaAttributesPipe,
        ManagePermissionsComponent,
        WizardsComponent,
        IntegrationComponent,
        ConfigurationComponent,
        PathCreatorComponent,
        LogicalConditionComponent,
        StateModelComponent,
        MakerCheckerComponent,
        DynamicConditionComponent,
        CommonSettingsComponent,
        DataSettingsComponent,
        SearchSettingsComponent,
        ResetServiceComponent,
        StepFieldsComponent,
        StepActionsComponent,
        DataIngestionComponent
    ],
    providers: [SchemaBuilderService]
})

export class SchemaUtilsModule {

}
