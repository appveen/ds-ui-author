import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapperComponent } from './mapper.component';
import { FormulaBuilderModule } from '../formula-builder/formula-builder.module';
import { FieldTypeModule } from '../field-type/field-type.module';
import { TruncatedModule } from '../truncated/truncated.module';
import { SourceFieldComponent } from './source-field/source-field.component';
import { MappingBlockComponent } from './mapping-block/mapping-block.component';
import { MapperService } from './mapper.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FormulaBuilderModule,
        FieldTypeModule,
        TruncatedModule
    ],
    declarations: [
        MapperComponent,
        SourceFieldComponent,
        MappingBlockComponent
    ],
    exports: [MapperComponent],
    providers: [MapperService]
})
export class MapperModule { }
