import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AgRendererComponent } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'odp-ds-grid-actions',
  templateUrl: './ds-grid-actions.component.html',
  styleUrls: ['./ds-grid-actions.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DsGridActionsComponent  implements AgRendererComponent  {
  params: any;

  refresh(): boolean {
    return false;
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
    
  }

  toggleServiceStatus() {
    this.params.context.componentParent.toggleServiceStatus(this.params.rowIndex);
  }

}
