import { Directive, ElementRef, EventEmitter, Output, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[odpFocusNext]'
})
export class FocusNextDirective implements AfterViewInit {

  @Output() trigger: EventEmitter<any>;
  private controlList: NodeListOf<Element>;
  constructor(private element: ElementRef) {
    const self = this;
    self.trigger = new EventEmitter();
  }

  ngAfterViewInit() {
    const self = this;
    const temp: HTMLElement = self.element.nativeElement;
    if (self.controlList && self.controlList.length > 0) {
      self.clearListener();
    }
    self.controlList = temp.querySelectorAll('input,textarea');
    if (self.controlList && self.controlList.length > 0) {
      self.addListener();
    }
  }

  clearListener() {
    const self = this;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < self.controlList.length; i++) {
      const node = self.controlList[i];
      node.removeEventListener('keyup', () => { });
    }
  }

  addListener() {
    const self = this;
    for (let i = 0; i < self.controlList.length; i++) {
      const node = self.controlList[i];
      node.addEventListener('keyup', (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          event.stopImmediatePropagation();
          if (i === self.controlList.length - 1) {
            self.trigger.emit();
          } else {
            const next: HTMLInputElement = self.controlList[i + 1] as HTMLInputElement;
            next.focus();
          }
        }
      });
    }
  }
}
