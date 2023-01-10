import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DeleteModalComponent } from './delete-modal.component';
import { ClickOutsideModule } from '../directives/click-outside/click-outside.module';
import { AutoFocusModule } from '../directives/auto-focus/auto-focus.module';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    ClickOutsideModule,
    AutoFocusModule,
  ],
  declarations: [DeleteModalComponent],
  exports: [DeleteModalComponent]
})
export class DeleteModalModule { }
