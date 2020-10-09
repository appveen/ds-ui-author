import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormatSelectorComponent } from './format-selector.component';
import { IconsModule } from '../icons/icons.module';
import { TableCheckboxModule } from '../table-checkbox/table-checkbox.module';
import { SearchBoxModule } from '../search-box/search-box.module';
import { SchemaUtilsModule } from 'src/app/home/schema-utils/schema-utils.module';
import { RadioBtnModule } from '../radio-btn/radio-btn.module';
import { RoundRadioModule } from '../round-radio/round-radio.module';
import { LoadingPlaceholderModule } from '../loading-placeholder/loading-placeholder.module';
import { TruncatedModule } from '../truncated/truncated.module';
import { StructureFieldModule } from '../structure-field/structure-field.module';
import { StructureFieldPropertiesModule } from '../structure-field-properties/structure-field-properties.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        IconsModule,
        TableCheckboxModule,
        SearchBoxModule,
        SchemaUtilsModule,
        RadioBtnModule,
        RoundRadioModule,
        LoadingPlaceholderModule,
        TruncatedModule,
        StructureFieldModule,
        StructureFieldPropertiesModule
    ],
    declarations: [FormatSelectorComponent],
    exports: [FormatSelectorComponent]
})
export class FormatSelectorModule { }
