import { Component } from '@angular/core';
import { AgRendererComponent } from 'ag-grid-angular';
import { ICellRendererParams, RowNode } from 'ag-grid-community';

type ActionCallbackFunction = (buttonName: string, rowNode: RowNode) => any;
const isActionCallbackFunction = (x: any): x is ActionCallbackFunction => {
    return typeof x === 'function' && x.length === 2;
};

type ActionButtonsMapperFunction = (data: any) => string[];
const isActionButtonsMapperFn = (x: any): x is ActionButtonsMapperFunction => {
    return typeof x === 'function' && x.length === 1;
};

@Component({
    selector: 'odp-ag-grid-actions-renderer',
    templateUrl: './ag-grid-actions-renderer.component.html',
    styleUrls: ['./ag-grid-actions-renderer.component.scss']
})
export class AgGridActionsRendererComponent implements AgRendererComponent {
    buttons: Array<string>;
    params: ICellRendererParams;

    constructor() {
        this.buttons = [];
    }

    agInit(params: ICellRendererParams): void {
        this.params = params;
        if (!!this.params.colDef.refData?.actionsButtons?.length) {
            this.buttons = this.params.colDef.refData.actionsButtons.split(',').map(str => str.trim());
        } else if (
            !!this.params?.context &&
            !!this.params.colDef.refData?.actionButtonsMapperFn &&
            this.params.context[this.params.colDef.refData.actionButtonsMapperFn] &&
            isActionButtonsMapperFn(this.params.context[this.params.colDef.refData.actionButtonsMapperFn])
        ) {
            const mapperFn = this.params.context[this.params.colDef.refData.actionButtonsMapperFn].bind(this.params.context);
            this.buttons = mapperFn(params.data);
        }
    }

    refresh() {
        return false;
    }

    handleButtonClick(buttonName: string, event: Event) {
        event.stopPropagation();
        const { context, node } = this.params;
        const callbackName = this.params.colDef.refData?.actionCallbackFunction;
        if (!!callbackName && !!context[callbackName] && isActionCallbackFunction(context[callbackName])) {
            const callback = context[callbackName].bind(context);
            callback(buttonName, node);
        }
    }
}
