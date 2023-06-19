import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[odpOnHover]'
})
export class OnHoverDirective {

  @Input() delay: number;
  @Output() odpOnHover: EventEmitter<boolean>;
  timeout: any;
  constructor() {
    this.odpOnHover = new EventEmitter();
    this.delay = 0;
  }

  @HostListener('mouseover')
  onMouseOver() {
    if (this.delay) {
      this.timeout = setTimeout(() => {
        this.odpOnHover.emit(true);
      }, this.delay)
    } else {
      this.odpOnHover.emit(true);
    }
  }

  @HostListener('mouseout')
  onMouseOut() {
    this.odpOnHover.emit(false);
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
}
