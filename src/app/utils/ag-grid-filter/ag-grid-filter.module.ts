import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgGridFilterPipe } from './ag-grid-filter.pipe';

@NgModule({
  declarations: [AgGridFilterPipe],
  imports: [CommonModule],
  exports: [AgGridFilterPipe]
})
export class AgGridFilterModule {}
