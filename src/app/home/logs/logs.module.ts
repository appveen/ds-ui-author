import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LogsComponent } from './logs.component';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';
import { ApiLogsComponent } from './api-logs/api-logs.component';
import { PreHookLogsComponent } from './pre-hook-logs/pre-hook-logs.component';
import { PostHookLogsComponent } from './post-hook-logs/post-hook-logs.component';
import { UrlTruncate, WebhookUrlTruncate } from '../schema-utils/audit-object.pipe';
import { LogsService } from 'src/app/home/logs/logs.service';
import { DatePickerModule } from 'src/app/utils/date-picker/datePicker.module';
import { AudiObjectModule } from 'src/app/home/schema-utils/audi-object.module';
import { DataGridModule } from 'src/app/utils/data-grid/data-grid.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    DatePickerModule,
    AudiObjectModule,
    DataGridModule,
    AutoFocusModule
  ],
  declarations: [
    LogsComponent,
    AuditLogsComponent,
    ApiLogsComponent,
    PreHookLogsComponent,
    PostHookLogsComponent,
    UrlTruncate,
    WebhookUrlTruncate
  ],
  exports: [LogsComponent],
  providers: [LogsService]
})
export class LogsModule { }
