import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateIconComponent } from './create-icon/create-icon.component';
import { EditIconComponent } from './edit-icon/edit-icon.component';
import { DeleteIconComponent } from './delete-icon/delete-icon.component';
import { AdminConsoleIconComponent } from 'src/app/utils/icons/admin-console/admin-console-icon.component';
import { AppSwitcherIconComponent } from './app-switcher-icon/app-switcher-icon.component';
import { AppIconComponent } from './app-icon/app-icon.component';
import { LibraryIconComponent } from './library-icon/library-icon.component';
import { ServiceIconComponent } from './service-icon/service-icon.component';
import { DataFormatIconComponent } from './data-format-icon/data-format-icon.component';
import { NanoServiceIconComponent } from './nano-service-icon/nano-service-icon.component';
import { PartnerIconComponent } from './partner-icon/partner-icon.component';
import { GroupIconComponent } from './group-icon/group-icon.component';
import { UserIconComponent } from './user-icon/user-icon.component';
import { KeyIconComponent } from './key-icon/key-icon.component';
import { FingerprintIconComponent } from './fingerprint-icon/fingerprint-icon.component';
import { InsightIconComponent } from './insight-icon/insight-icon.component';
import { BotIconComponent } from './bot-icon/bot-icon.component';
import { CustomFormatIconComponent } from './custom-format-icon/custom-format-icon.component';
import { ApiIconComponent } from './api-icon/api-icon.component';
import { FileIconComponent } from './file-icon/file-icon.component';
import { AgentIconComponent } from './agent-icon/agent-icon.component';
import { BookmarkIconComponent } from './bookmark-icon/bookmark-icon.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    CreateIconComponent,
    EditIconComponent,
    DeleteIconComponent,
    AdminConsoleIconComponent,
    AppSwitcherIconComponent,
    AppIconComponent,
    LibraryIconComponent,
    ServiceIconComponent,
    DataFormatIconComponent,
    NanoServiceIconComponent,
    PartnerIconComponent,
    GroupIconComponent,
    UserIconComponent,
    KeyIconComponent,
    FingerprintIconComponent,
    InsightIconComponent,
    BotIconComponent,
    CustomFormatIconComponent,
    ApiIconComponent,
    FileIconComponent,
    AgentIconComponent,
    BookmarkIconComponent
  ],
  exports: [
    CreateIconComponent,
    EditIconComponent,
    DeleteIconComponent,
    AdminConsoleIconComponent,
    AppSwitcherIconComponent,
    AppIconComponent,
    LibraryIconComponent,
    ServiceIconComponent,
    DataFormatIconComponent,
    NanoServiceIconComponent,
    PartnerIconComponent,
    GroupIconComponent,
    UserIconComponent,
    KeyIconComponent,
    FingerprintIconComponent,
    InsightIconComponent,
    BotIconComponent,
    CustomFormatIconComponent,
    ApiIconComponent,
    FileIconComponent,
    AgentIconComponent,
    BookmarkIconComponent
  ]
})
export class IconsModule { }
