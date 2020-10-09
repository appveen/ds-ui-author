import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MicroflowComponent } from './microflow.component';
import { IconsModule } from '../icons/icons.module';
import { ClickOutsideModule } from '../directives/click-outside/click-outside.module';
import { FormatSelectorModule } from '../format-selector/format-selector.module';
import { SearchBoxModule } from '../search-box/search-box.module';
import { MapperModule } from '../mapper/mapper.module';
import { CheckboxBtnModule } from '../checkbox-btn/checkbox-btn.module';
import { ReadWsdlModule } from '../directives/read-wsdl/read-wsdl.module';
import { BasicInfoModule } from '../basic-info/basic-info.module';
import { SwitchModule } from '../switch/switch.module';
import { RoundCheckModule } from '../round-check/round-check.module';
import { FormatTypeBadgeModule } from '../format-type-badge/format-type-badge.module';
import { DeleteModalModule } from '../delete-modal/delete-modal.module';
import { TruncatedModule } from '../truncated/truncated.module';

@NgModule({
    imports: [
        CommonModule,
        IconsModule,
        FormsModule,
        ClickOutsideModule,
        FormatSelectorModule,
        SearchBoxModule,
        MapperModule,
        NgbModule,
        CheckboxBtnModule,
        ReadWsdlModule,
        BasicInfoModule,
        SwitchModule,
        RoundCheckModule,
        FormatTypeBadgeModule,
        DeleteModalModule,
        TruncatedModule
    ],
    declarations: [MicroflowComponent],
    exports: [MicroflowComponent]
})
export class MicroflowModule { }
