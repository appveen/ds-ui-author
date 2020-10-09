import { Directive, ElementRef, Input, EventEmitter, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[odpMakeFocus]'
})
export class MakeFocusDirective implements AfterViewInit {

  @Input() odpMakeFocus: EventEmitter<string>;
  private id: string;
  constructor(private element: ElementRef) {
    const self = this;
    self.odpMakeFocus = new EventEmitter();
  }

  ngAfterViewInit() {
    const self = this;
    self.id = self.element.nativeElement.id;
    self.odpMakeFocus.subscribe(id => {
      if (self.id === id) {
        self.element.nativeElement.focus();
      }
    });
  }
}
