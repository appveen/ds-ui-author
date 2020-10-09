import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormulaBuilderComponent } from './formula-builder.component';
import { FormulaBuilderService } from './formula-builder.service';
import { FieldTypeModule } from '../field-type/field-type.module';

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FieldTypeModule
    ],
    declarations: [FormulaBuilderComponent],
    exports: [FormulaBuilderComponent],
    providers: [FormulaBuilderService]
})
export class FormulaBuilderModule { }
