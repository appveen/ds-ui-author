import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeoutTriggerDirective } from 'src/app/utils/directives/timeout-trigger/timeout-trigger.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    TimeoutTriggerDirective
  ],
  exports: [
    TimeoutTriggerDirective
  ]
})
export class TimeoutTriggerModule { }
