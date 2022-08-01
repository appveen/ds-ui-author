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
  parent: any;
  refresh(): boolean {
    return false;
  }

  agInit(params: ICellRendererParams): void {
    const self = this;
    self.params = params;
    self.parent = self.params.context.componentParent;
  }


  toggleServiceStatus() {
    const self = this;
    self.parent.toggleServiceStatus(this.params.rowIndex);
  }

  deployService() {
    const self = this;
    self.parent.deployService(this.params.rowIndex);
  }

  isDeploy() {
    const self = this;
    self.parent.isDeploy(this.params.rowIndex);
  }

  isStartStop() {
    const self = this;
    return self.parent.isStartStopService(this.params.rowIndex);
  }

  canEditService() {
    const self = this;
    return self.parent.canEditService(self.parent.serviceList[self.params.rowIndex]._id) && self.parent.serviceList[self.params.rowIndex].type != 'internal'
  }

  canDeleteService() {
    const self = this;
    return self.parent.canDeleteService(self.parent.serviceList[self.params.rowIndex]._id) && self.parent.serviceList[self.params.rowIndex].type != 'internal'
  }

  canCloneService() {
    const self = this;
    return self.parent.canCloneService(self.parent.serviceList[self.params.rowIndex]._id) && self.parent.serviceList[self.params.rowIndex].type != 'internal'
  }

  viewService(){
    const self = this;
    self.parent.viewService(self.params.rowIndex);
  }

  editService(){
    const self = this;
    self.parent.editService(self.params.rowIndex);
  }

  cloneService(){
    const self = this;
    self.parent.cloneService(self.params.rowIndex);
  }

  deleteService(){
    const self = this;
    self.parent.deleteService(self.params.rowIndex);
  }

  openDocs(){
    const self = this;
    self.parent.openDocs(self.params.rowIndex);
  }

}
