import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BasicInfoComponent } from './basic-info.component';
import { ClickOutsideModule } from '../directives/click-outside/click-outside.module';
import { AutoFocusModule } from '../directives/auto-focus/auto-focus.module';
import { UploadImageModule } from '../upload-image/upload-image.module';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    ClickOutsideModule,
    AutoFocusModule,
    FormsModule,
    UploadImageModule
  ],
  declarations: [BasicInfoComponent],
  exports: [BasicInfoComponent]
})
export class BasicInfoModule { }
