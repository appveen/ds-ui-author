import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BotsComponent } from './bots.component';
import { BotsManageComponent } from './bots-manage/bots-manage.component';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { IconsModule } from 'src/app/utils/icons/icons.module';
import { TableCheckboxModule } from 'src/app/utils/table-checkbox/table-checkbox.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { BreadcrumbModule } from 'src/app/utils/breadcrumb/breadcrumb.module';
import { FilterUserModule } from 'src/app/utils/pipes/filter-user.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { FilterTeamModule } from 'src/app/utils/pipes/filter-team.module';
import { DataGridModule } from 'src/app/utils/data-grid/data-grid.module';
import { RoundCheckModule } from 'src/app/utils/round-check/round-check.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { BotGuard } from 'src/app/utils/guards/bot.guard';
import { FieldTypeModule } from 'src/app/utils/field-type/field-type.module';
import { SwitchModule } from 'src/app/utils/switch/switch.module';
import { DateFormatModule } from 'src/app/utils/date-format/date-format.module';

const routes: Routes = [
  { path: '', component: BotsComponent, canActivate: [BotGuard] }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    ClickOutsideModule,
    IconsModule,
    TableCheckboxModule,
    AutoFocusModule,
    BreadcrumbModule,
    FilterUserModule,
    SearchBoxModule,
    FilterTeamModule,
    DataGridModule,
    RoundCheckModule,
    DeleteModalModule,
    FieldTypeModule,
    SwitchModule,
    DateFormatModule
  ],
  declarations: [BotsComponent, BotsManageComponent],
  exports: [RouterModule, BotsComponent, BotsManageComponent]
})
export class BotsModule { }
