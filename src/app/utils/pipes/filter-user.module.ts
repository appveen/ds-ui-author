import { NgModule } from '@angular/core';
import { FilterUserPipe } from 'src/app/utils/pipes/filter-user.pipe';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [FilterUserPipe],
  imports: [CommonModule],
  exports: [FilterUserPipe]
})
export class FilterUserModule { }
