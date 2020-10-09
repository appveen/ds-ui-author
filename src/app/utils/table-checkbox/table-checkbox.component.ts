import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'odp-table-checkbox',
    templateUrl: './table-checkbox.component.html',
    styleUrls: ['./table-checkbox.component.scss']
})
export class TableCheckboxComponent {

    @Input() disabled: boolean;
    @Input() checked: boolean;
    @Output() checkedChange: EventEmitter<boolean>;
    constructor() {
        const self = this;
        self.checkedChange = new EventEmitter();
    }

    onValueChange(event: Event) {
        const self = this;
        const target: HTMLInputElement = event.target as HTMLInputElement;
        self.checkedChange.emit(target.checked);
    }
}
