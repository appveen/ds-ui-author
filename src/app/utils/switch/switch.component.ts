import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'odp-switch',
    templateUrl: './switch.component.html',
    styleUrls: ['./switch.component.scss']
})
export class SwitchComponent implements OnInit {

    @Input() edit: any;
    @Input() type: string;
    @Input() disabled: boolean;
    @Input() checked: boolean;
    @Output() checkedChange: EventEmitter<boolean>;
    constructor() {
        const self = this;
        self.checkedChange = new EventEmitter();
        self.type = 'accent';
        self.edit = {};
    }

    ngOnInit() {
        const self = this;
    }

    onChange(val: any) {
        const self = this;
        if (self.disabled) {
            return;
        }
        self.checked = val;
        self.checkedChange.emit(val);
    }
}
