import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonFilterPipe } from './common-filter.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [CommonFilterPipe],
  exports: [CommonFilterPipe]
})
export class CommonFilterModule { }
