import { Component, ElementRef, AfterContentChecked } from '@angular/core';

@Component({
    selector: 'odp-checkbox-btn',
    templateUrl: './checkbox-btn.component.html',
    styleUrls: ['./checkbox-btn.component.scss']
})
export class CheckboxBtnComponent implements AfterContentChecked {

    checked: boolean;
    disabled: boolean;
    constructor(private element: ElementRef) {
        const self = this;
    }

    ngAfterContentChecked() {
        const self = this;
        const ele: HTMLElement = self.element.nativeElement;
        const input: HTMLInputElement = ele.children[0].querySelector('input') as HTMLInputElement;
        if (input.classList.contains('disabled')) {
            self.disabled = true;
        } else {
            self.disabled = false;
        }
        if (input && input.checked) {
            self.checked = true;
        } else {
            self.checked = false;
        }
    }
}
