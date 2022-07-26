import { Component } from '@angular/core';
import { AgRendererComponent } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'odp-user-grid-action',
  template: `<div style="overflow: hidden; float: right">
    <span
      *ngIf="currentTab === 'Attributes'"
      class="fa fa-regular fa-edit mr-4 icons"
      (click)="editAttr()"
    ></span>
    <span
      class="fa fa-regular fa-trash mr-4 icons"
      (click)="deleteAttr()"
    ></span>
  </div>`,
  styles: ['.icons{color: #6C7584; cursor: pointer}'],
})
export class UserGridActionRendererComponent implements AgRendererComponent {
  params: ICellRendererParams;
  currentTab: String = '';
  constructor() {}

  refresh(): boolean {
    return false;
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.currentTab = this.params.context.componentParent.currentTab;
  }

  editAttr() {
    this.params.context.componentParent.editAttribute(this.params.data);
  }

  deleteAttr() {
    this.currentTab === 'Attributes'
      ? this.params.context.componentParent.deleteAttribute(this.params.data)
      : this.params.context.componentParent.deleteGroup(this.params.data);
  }
}
