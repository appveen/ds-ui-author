import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterDefinitionPipe } from './filter-definition.pipe';



@NgModule({
  declarations: [FilterDefinitionPipe],
  imports: [
    CommonModule
  ],
  exports: [FilterDefinitionPipe]
})
export class FilterDefinitionModule { }
