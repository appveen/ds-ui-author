import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[odpKeyStrokes]'
})
export class KeyStrokesDirective {

  // tslint:disable-next-line: no-output-rename
  @Output('shift.enter') shiftEnter: EventEmitter<Event>;
  // tslint:disable-next-line: no-output-rename
  @Output('shift.delete') shiftDelete: EventEmitter<Event>;
  constructor() {
    const self = this;
    self.shiftEnter = new EventEmitter();
    self.shiftDelete = new EventEmitter();
  }

  @HostListener('keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    const self = this;
    if (event.shiftKey && event.key === 'Enter') {
      self.shiftEnter.emit(event);
    }
    if (event.shiftKey && event.key === 'Delete') {
      self.shiftDelete.emit(event);
    }
  }
}
