import { Directive, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';

@Directive({
    selector: '[odpAutoFocus]'
})
export class AutoFocusDirective implements AfterViewInit {

    @Output() hasFocus: EventEmitter<any>;

    constructor(private element: ElementRef) {
        this.hasFocus = new EventEmitter();
    }

    ngAfterViewInit() {
        if (this.element.nativeElement) {
            this.element.nativeElement.focus();
            this.hasFocus.emit();
        }
    }

}
