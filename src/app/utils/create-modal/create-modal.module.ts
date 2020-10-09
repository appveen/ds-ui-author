import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateModalComponent } from './create-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AutoFocusModule } from '../directives/auto-focus/auto-focus.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    AutoFocusModule
  ],
  declarations: [CreateModalComponent],
  exports: [CreateModalComponent]
})
export class CreateModalModule { }
