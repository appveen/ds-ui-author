import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { IntegrationFlowComponent } from './integration-flow.component';
import { NewFlowComponent } from './new-flow/new-flow.component';
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
import { SpaceKeyModule } from '../space-key/space-key.module';
import { ViewBoxDirective } from './view-box.directive';
import { FlowLineComponent } from './flow-line/flow-line.component';
import { AddNodeComponent } from './add-node/add-node.component';
import { NodePropertiesComponent } from './node-properties/node-properties.component';
import { SecurityBlockComponent } from './node-properties/security-block/security-block.component';
import { FileBlockComponent } from './node-properties/file-block/file-block.component';
import { AgentBlockComponent } from './node-properties/agent-block/agent-block.component';
import { FileOptionsBlockComponent } from './node-properties/file-options-block/file-options-block.component';
import { NodeTypeBlockComponent } from './node-properties/node-type-block/node-type-block.component';
import { IntegrationFlowService } from './integration-flow.service';
import { AutoFocusModule } from '../directives/auto-focus/auto-focus.module';
import { IndexToPosModule } from '../pipes/index-to-pos/index-to-pos.module';
import { SearchTermModule } from '../search-term/search-term.module';
import { CheckboxModule } from '../checkbox/checkbox.module';
import { SoapBlockComponent } from './node-properties/soap-block/soap-block.component';
import { RestBlockComponent } from './node-properties/rest-block/rest-block.component';
import { CustomHeadersBlockComponent } from './node-properties/custom-headers-block/custom-headers-block.component';
import { SelectFormatBlockComponent } from './node-properties/select-format-block/select-format-block.component';
import { SelectServiceBlockComponent } from './node-properties/select-service-block/select-service-block.component';
import { FileControlModule } from '../file-control/file-control.module';
import { LoadingModule } from '../loading/loading.module';
import { TimerBlockComponent } from './node-properties/timer-block/timer-block.component';
import { DatePickerModule } from '../date-picker/datePicker.module';
import { ReqFlowComponent } from './req-flow/req-flow.component';
import { ReqStartComponent } from './req-flow/req-start/req-start.component';
import { ReqNodeComponent } from './req-flow/req-node/req-node.component';
import { ResFlowComponent } from './res-flow/res-flow.component';
import { ResStartComponent } from './res-flow/res-start/res-start.component';
import { ResNodeComponent } from './res-flow/res-node/res-node.component';
import { ResEndComponent } from './res-flow/res-end/res-end.component';
import { ErrFlowComponent } from './err-flow/err-flow.component';
import { ErrStartComponent } from './err-flow/err-start/err-start.component';
import { ErrNodeComponent } from './err-flow/err-node/err-node.component';
import { ErrEndComponent } from './err-flow/err-end/err-end.component';
import { TimeboundBlockComponent } from './node-properties/timebound-block/timebound-block.component';
import { SliderDateModule } from '../slider-date/slider-date.module';
import { SliderMonthModule } from '../slider-month/slider-month.module';
import { SliderWeekModule } from '../slider-week/slider-week.module';
import { TimePickerModule } from '../time-picker/time-picker.module';
import { EllipsisPipeModule } from '../pipes/ellipsis/ellipsis.module';


@NgModule({
  declarations: [
    IntegrationFlowComponent,
    NewFlowComponent,
    ViewBoxDirective,
    ReqNodeComponent,
    ResNodeComponent,
    ResStartComponent,
    ReqStartComponent,
    FlowLineComponent,
    AddNodeComponent,
    NodePropertiesComponent,
    SecurityBlockComponent,
    FileBlockComponent,
    AgentBlockComponent,
    FileOptionsBlockComponent,
    NodeTypeBlockComponent,
    SoapBlockComponent,
    RestBlockComponent,
    CustomHeadersBlockComponent,
    SelectFormatBlockComponent,
    SelectServiceBlockComponent,
    TimerBlockComponent,
    ResFlowComponent,
    ReqFlowComponent,
    ErrFlowComponent,
    ErrNodeComponent,
    ErrEndComponent,
    ErrStartComponent,
    ResEndComponent,
    TimeboundBlockComponent,
  ],
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
    TruncatedModule,
    SpaceKeyModule,
    AutoFocusModule,
    IndexToPosModule,
    SearchTermModule,
    CheckboxModule,
    FileControlModule,
    LoadingModule,
    DatePickerModule,
    SliderDateModule,
    SliderMonthModule,
    SliderWeekModule,
    TimePickerModule,
    EllipsisPipeModule
  ],
  exports: [IntegrationFlowComponent, NewFlowComponent],
  providers: [IntegrationFlowService]
})
export class IntegrationFlowModule { }
