import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormulaBuilderComponent } from './formula-builder.component';
import { FormulaBuilderService } from './formula-builder.service';
import { FieldTypeModule } from '../field-type/field-type.module';
import { FunctionSelectorComponent } from './function-selector/function-selector.component';
import { SourceSelectorComponent } from './source-selector/source-selector.component';
import { ClickOutsideModule } from '../directives/click-outside/click-outside.module';
import { FormulaEditorComponent } from './formula-editor/formula-editor.component';
import { ParamSelectorComponent } from './param-selector/param-selector.component';

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FieldTypeModule,
        ClickOutsideModule
    ],
    declarations: [
        FormulaBuilderComponent,
        FunctionSelectorComponent,
        SourceSelectorComponent,
        FormulaEditorComponent,
        ParamSelectorComponent
    ],
    exports: [FormulaBuilderComponent, FormulaEditorComponent],
    providers: [FormulaBuilderService]
})
export class FormulaBuilderModule { }
