import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterAppPipe } from 'src/app/utils/pipes/filter-app.pipe';

@NgModule({
  declarations: [FilterAppPipe,

  ],
  imports: [CommonModule],
  exports: [FilterAppPipe]
})
export class FilterAppModule { }
