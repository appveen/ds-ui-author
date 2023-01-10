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
    @Input() showLabel: boolean;
    @Input() checkedText: string;
    @Input() uncheckedText: string;
    @Output() checkedChange: EventEmitter<boolean>;
    constructor() {
        this.checkedChange = new EventEmitter();
        this.type = 'success';
        this.edit = {};
        this.showLabel = false;
    }

    ngOnInit() {
    }

    onChange(val: any) {
        if (this.disabled) {
            return;
        }
        this.checked = val;
        this.checkedChange.emit(val);
    }

    get sliderClass() {
        if (this.checked) {
            return 'bg-' + this.type;
        }
    }
}
