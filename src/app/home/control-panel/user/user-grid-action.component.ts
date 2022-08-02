import { Component } from '@angular/core';
import { AgRendererComponent } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import * as _ from 'lodash';

@Component({
  selector: 'odp-user-grid-action',
  template: `<div style="overflow: hidden; float: right">
    <span
      *ngIf="currentTab === 'Attributes'"
      class="dsi dsi-edit mr-4 text-muted hover"
      (click)="editAttr()"
    ></span>
    <span
      class="dsi dsi-trash mr-4 text-muted hover"
      (click)="deleteAttr()"
    ></span>
  </div>`,
  styles: [],
})
export class UserGridActionRendererComponent implements AgRendererComponent {
  params: any;
  currentTab: String = '';
  constructor() { }

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
    // let data = {};
    // if (this.currentTab === 'Attributes') {
    //   const user = this.params.user;
    //   const arr = Object.entries(user.attributes);

    //   if (user.attributes && user.attributes !== null) {
    //     user.attributesData = Object.values(user.attributes).map((ele: Object, i) => {
    //       const key = Object.keys(user.attributes)[i];
    //       return { ...ele, key }
    //     });
    //   }
    //   const x = arr.find((ele) => _.isEqual(ele[1], this.params.data));

    //   data[x[0]] = x[1];
    // } else {
    //   data = this.params.data;
    // }
    this.currentTab === 'Attributes'
      ? this.params.context.componentParent.deleteAttribute(this.params.data)
      : this.params.context.componentParent.deleteGroup(this.params.data);
  }
}
