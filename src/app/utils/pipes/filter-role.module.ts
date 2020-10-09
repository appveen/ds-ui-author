import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterRolePipe } from './filter-role.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [FilterRolePipe],
  exports: [FilterRolePipe]
})
export class FilterRolePipeModule { }
