import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'odp-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss'],
  animations: [
    trigger('slide', [
      state('focus', style({
        left: '10px'
      })),
      transition('blur <=> focus', [
        animate('300ms cubic-bezier(0.86, 0, 0.07, 1)')
      ])
    ])
  ]
})
export class SearchBoxComponent implements OnInit, AfterViewInit {

  @ViewChild('searchInput', { static: false }) searchInput: ElementRef;
  @Input() ignoreOutside: boolean;
  @Input() onEnter: boolean;
  @Input() selectOnEnter: boolean;
  @Input() tooltipDir: string;
  @Output() enteredText: EventEmitter<string>;
  @Output() enteredPressed: EventEmitter<any>;
  @Output() reset: EventEmitter<string>;
  searchTerm: string;
  slideState: string;
  constructor() {
    const self = this;
    self.slideState = 'blur';
    self.enteredText = new EventEmitter<string>();
    self.enteredPressed = new EventEmitter<string>();
    self.reset = new EventEmitter<string>();
  }
  ngOnInit() {
    const self = this;
  }
  ngAfterViewInit() {
    const self = this;
    self.searchInput.nativeElement.focus();
  }
  clear() {
    const self = this;
    self.reset.emit();
    self.searchTerm = null;
  }
  onChange(value: string) {
    const self = this;
    self.searchTerm = value;
    if (self.selectOnEnter) {
      self.enteredText.emit(value);
    } else if (value && value.length > 2) {
      self.enteredText.emit(value);
    }
  }

  onEnterKey(event: KeyboardEvent) {
    const self = this;
    if (self.selectOnEnter) {
      self.enteredPressed.emit(event);
    } else {
      const element: HTMLInputElement = event.target as HTMLInputElement;
      if (element.value && element.value.length > 0) {
        self.enteredText.emit(element.value);
      }
    }
  }

  onBackspaceKey(event: KeyboardEvent) {
    const self = this;
    const element: HTMLInputElement = event.target as HTMLInputElement;
    if (!element.value) {
      self.reset.emit();
    }
  }
  onCtrlBackspace(event: KeyboardEvent) {
    const self = this;
    const element: HTMLInputElement = event.target as HTMLInputElement;
    if (element.value) {
      self.reset.emit();
    }
  }
  onFocus(event: Event) {
    const self = this;
    self.slideState = 'focus';
  }
  onBlur(event: Event) {
    const self = this;
    self.slideState = 'blur';
  }

  get info() {
    const self = this;
    if (self.onEnter) {
      return 'Search will be executed on Enter Pressed';
    } else {
      return 'Enter 3 or more characters to auto search';
    }
  }

  get toolTipDirection() {
    const self = this;
    if (self.tooltipDir) {
      return self.tooltipDir;
    }
    return 'right';
  }
}
