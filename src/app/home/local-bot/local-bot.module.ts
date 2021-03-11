import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgGridModule } from 'ag-grid-angular';

import { LocalBotComponent } from './local-bot.component';
import { BotGuard } from 'src/app/utils/guards/bot.guard';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { IconsModule } from 'src/app/utils/icons/icons.module';
import { FieldTypeModule } from 'src/app/utils/field-type/field-type.module';
import { SwitchModule } from 'src/app/utils/switch/switch.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { FilterTeamModule } from 'src/app/utils/pipes/filter-team.module';
import { ManageBotKeyComponent } from './manage-bot-key/manage-bot-key.component';
import { ManageBotPropertyComponent } from './manage-bot-property/manage-bot-property.component';
import { ManageBotGroupComponent } from './manage-bot-group/manage-bot-group.component';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { OnChangeModule } from 'src/app/utils/directives/on-change/on-change.module';
import { AgGridSharedFloatingFilterModule } from 'src/app/utils/ag-grid-shared-floating-filter/ag-grid-shared-floating-filter.module';
import { LocalBotCellRendererComponent } from './local-bot-cell-renderer/local-bot-cell-renderer.component';
import { AgGridFilterModule } from 'src/app/utils/ag-grid-filter/ag-grid-filter.module';
import { DateFormatModule } from 'src/app/utils/date-format/date-format.module';

const routes: Routes = [{ path: '', component: LocalBotComponent, canActivate: [BotGuard] }];
@NgModule({
  declarations: [
    LocalBotComponent,
    ManageBotKeyComponent,
    ManageBotPropertyComponent,
    ManageBotGroupComponent,
    LocalBotCellRendererComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SearchBoxModule,
    IconsModule,
    FieldTypeModule,
    SwitchModule,
    DeleteModalModule,
    NgbModule,
    FilterTeamModule,
    AutoFocusModule,
    OnChangeModule,
    AgGridModule,
    AgGridSharedFloatingFilterModule,
    AgGridFilterModule,
    DateFormatModule
  ]
})
export class LocalBotModule {}
