import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[odpSpaceKey]'
})
export class SpaceKeyDirective {

  @Output() odpSpaceKey: EventEmitter<any>;
  constructor() {
    const self = this;
    self.odpSpaceKey = new EventEmitter();
  }

  @HostListener('keyup', ['$event'])
  onKeyUp(event) {
    const self = this;
    if (event.code === 'Space') {
      self.odpSpaceKey.emit(event);
    }
  }
}
