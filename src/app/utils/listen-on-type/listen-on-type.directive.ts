import { Directive, Output, EventEmitter } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime, mergeMap } from 'rxjs/operators';

@Directive({
  selector: '[odpListenOnType]'
})
export class ListenOnTypeDirective {

  @Output() odpListenOnType: EventEmitter<any>;
  sentence: string;
  constructor() {
    const self = this;
    self.sentence = '';
    self.odpListenOnType = new EventEmitter();
    fromEvent(document.body, 'keyup').pipe(
      mergeMap((e: KeyboardEvent) => {
        self.sentence = self.sentence + e.key;
        return self.sentence;
      }),
      debounceTime(750)
    ).subscribe(value => {
      self.odpListenOnType.emit(self.sentence);
      self.sentence = '';
    });
  }
}
