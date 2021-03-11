import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgGridActionsRendererComponent } from './ag-grid-actions-renderer.component';

@NgModule({
    declarations: [AgGridActionsRendererComponent],
    imports: [CommonModule],
    exports: [AgGridActionsRendererComponent]
})
export class AgGridActionsRendererModule {}
