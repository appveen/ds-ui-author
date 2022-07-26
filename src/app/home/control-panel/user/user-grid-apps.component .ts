import { Component } from '@angular/core';
import { AgRendererComponent } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'odp-user-grid-apps',
  template: `<div [ngStyle]="{ color: active ? '#181818' : '#B5B8BC' }">
    <i
      class="fa fa-circle icons"
      [ngStyle]="{ color: active ? '#2FC48F' : '#B5B8BC' }"
    ></i>
    {{ text }}
  </div>`,
  styles: ['.icons{font-size: 10px; margin-right: 5px};'],
})
export class UserGridAppsRendererComponent implements AgRendererComponent {
  params: any;
  text: String;
  color: String;
  active: boolean = false;
  constructor() {}

  refresh(): boolean {
    return false;
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
    const checkApp = params['checkApp'];
    let app = [];
    if (params.value) {
      app = params.value.filter((ele) => ele.type === checkApp) || [];
    }
    this.text = app.length > 0 ? 'Active' : 'Inactive';
    this.active = app.length > 0;
  }
}
