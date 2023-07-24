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
  @Input() open: boolean;
  @Input() fullWidth: boolean;
  @Input() edit: any;
  @Output() enteredText: EventEmitter<string>;
  @Output() enteredPressed: EventEmitter<any>;
  @Output() reset: EventEmitter<string>;
  searchTerm: string;
  slideState: string;
  openSearchBox: boolean;
  constructor() {
    this.slideState = 'blur';
    this.enteredText = new EventEmitter<string>();
    this.enteredPressed = new EventEmitter<string>();
    this.reset = new EventEmitter<string>();
    this.edit= {
      status: false
    }
  }
  ngOnInit() {
    this.openSearchBox = this.open;
  }
  ngAfterViewInit() {
    if (this.searchInput && this.searchInput.nativeElement) {
      this.searchInput.nativeElement.focus();
    }
  }
  clear() {
    this.reset.emit();
    this.searchTerm = null;
  }
  onChange(value: string) {
    this.searchTerm = value;
    if (this.selectOnEnter) {
      this.enteredText.emit(value);
    } else if (value && value.length > 2) {
      this.enteredText.emit(value);
    }
  }

  onEnterKey(event: KeyboardEvent) {
    if (this.selectOnEnter) {
      this.enteredPressed.emit(event);
    } else {
      const element: HTMLInputElement = event.target as HTMLInputElement;
      if (element.value && element.value.length > 0) {
        this.enteredText.emit(element.value);
      }
    }
  }

  onBackspaceKey(event: KeyboardEvent) {
    const element: HTMLInputElement = event.target as HTMLInputElement;
    if (!element.value) {
      this.reset.emit();
    }
  }
  onCtrlBackspace(event: KeyboardEvent) {
    const element: HTMLInputElement = event.target as HTMLInputElement;
    if (element.value) {
      this.reset.emit();
    }
  }
  onFocus(event: Event) {
    this.slideState = 'focus';
  }
  onBlur(event: Event) {
    this.slideState = 'blur';
  }

  get info() {
    if (this.onEnter) {
      return 'Search will be executed on Enter Pressed';
    } else {
      return 'Enter 3 or more characters to auto search';
    }
  }

  get toolTipDirection() {
    if (this.tooltipDir) {
      return this.tooltipDir;
    }
    return 'left';
  }
}
