import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AgRendererComponent } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'odp-ds-grid-actions',
  templateUrl: './ds-grid-actions.component.html',
  styleUrls: ['./ds-grid-actions.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DsGridActionsComponent implements AgRendererComponent {
  params: any;
  selectedRow: any;
  refresh(): boolean {
    return false;
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }


  toggleServiceStatus() {
    this.params.context.componentParent.toggleServiceStatus(this.params.rowIndex);
  }

  deployService() {
    this.params.context.componentParent.deployService(this.params.rowIndex);
  }

  isDeploy() {
    return this.params.context.componentParent.isDeploy(this.params.rowIndex);
  }

  isStartStop() {
    return this.params.context.componentParent.isStartStopService(this.params.rowIndex);
  }

  selectContextMenu($event) {
    console.log($event);
    this.params.context.componentParent.clickContextMenu($event, this.params.rowIndex);
  }

  showContextMenu() {
    return this.params.context.componentParent.showContextMenu;
  }

  showAction() {
    if (this.showContextMenu() && this.params.rowIndex == this.params.context.componentParent.selectedRow) {
      return { 'display': 'initial' }
    }
    else {
      { }
    }
  }

}
