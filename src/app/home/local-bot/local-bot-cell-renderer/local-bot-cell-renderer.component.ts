import { Component, ViewChild } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { AgRendererComponent } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'odp-local-bot-cell-renderer',
  templateUrl: './local-bot-cell-renderer.component.html',
  styleUrls: ['./local-bot-cell-renderer.component.scss']
})
export class LocalBotCellRendererComponent implements AgRendererComponent {
  params: ICellRendererParams;
  field: string;
  data: any;
  namespace: string;
  @ViewChild('tooltip', { static: false }) tooltip: NgbTooltip;

  constructor() {}

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.field = this.params.colDef.field;
    this.data = this.params.data;
    this.namespace = this.params.colDef?.refData?.namespace;

    if (this.namespace === 'keys' && this.field === 'keyValue' && this.data.isLatest) {
      setTimeout(() => {
        if (!!this.tooltip) {
          this.tooltip.open();
        }
      }, 200);
    }
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }

  copyKey(key) {
    const fn = this.params.context['copyKey'].bind(this.params.context);
    fn(key);
  }
}
