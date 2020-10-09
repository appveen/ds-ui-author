import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LocalBotComponent } from './local-bot.component';
import { BotGuard } from 'src/app/utils/guards/bot.guard';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { IconsModule } from 'src/app/utils/icons/icons.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FieldTypeModule } from 'src/app/utils/field-type/field-type.module';
import { SwitchModule } from 'src/app/utils/switch/switch.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FilterTeamModule } from 'src/app/utils/pipes/filter-team.module';
import { ManageBotKeyComponent } from './manage-bot-key/manage-bot-key.component';
import { ManageBotPropertyComponent } from './manage-bot-property/manage-bot-property.component';
import { ManageBotGroupComponent } from './manage-bot-group/manage-bot-group.component';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { OnChangeModule } from 'src/app/utils/directives/on-change/on-change.module';


const routes: Routes = [
  { path: '', component: LocalBotComponent, canActivate: [BotGuard] }
];

@NgModule({
  declarations: [LocalBotComponent, ManageBotKeyComponent, ManageBotPropertyComponent, ManageBotGroupComponent],
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
    OnChangeModule

  ]
})
export class LocalBotModule { }
