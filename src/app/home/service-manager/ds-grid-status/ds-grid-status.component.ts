import { Component, OnInit } from '@angular/core';
import { AgRendererComponent } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'odp-ds-grid-status',
  templateUrl: './ds-grid-status.component.html',
  styleUrls: ['./ds-grid-status.component.scss']
})
export class DsGridStatusComponent implements AgRendererComponent {

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
    
  }

}
