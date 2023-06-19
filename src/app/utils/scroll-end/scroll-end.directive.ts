import { Directive, EventEmitter, Input, Output } from '@angular/core';

@Directive({
  selector: '[odpScrollEnd]'
})
export class ScrollEndDirective {

  @Output() odpScrollEnd: EventEmitter<any>;
  @Input() offset: number;
  constructor() {
    this.odpScrollEnd = new EventEmitter();
    this.offset = 0;
  }

  onScroll(event: any) {
    if (event.target.scrollTop + event.target.offsetHeight === event.target.scrollHeight + this.offset) {
      this.odpScrollEnd.emit(true);
    }
  }
}
