import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';



@Component({
  selector: 'odp-styled-text',
  templateUrl: './styled-text.component.html',
  styleUrls: ['styled-text.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StyledTextComponent implements OnInit {
  @Input() regex: RegExp = /({{\S+}})/g;
  @Output() finalValue: EventEmitter<any> = new EventEmitter();

  @Input() suggestions: any = [];
  @Input() ngbTypeahead: any;
  @Input() resultFormatter: any;
  @Input() inputFormatter: any;
  @Input() searchTerm: any;
  @Input() class: any;
  @Input() value: string = '';
  @Input() disabled: boolean = false
  @Input() type: string = "text"
  @Input() uid: string = '0'
  @Input() placeholder: string = ''
  @Input() pattern: RegExp = /.*/g
  @Output() onPaste: EventEmitter<any> = new EventEmitter();
  @Output() onEnter: EventEmitter<any> = new EventEmitter();
  @ViewChild('renderer') renderer: any;
  @ViewChild('styledInputText') styledInputText: any;


  constructor() {

  }


  ngOnInit() {
    if (!this.value) {
      this.value = ''
    }
  }

  onChange = (event) => {
    this.value = event.target.value;
    this.finalValue.emit(this.value);
  };

  get valueArray() {
    return this.value ? this.value.split(this.regex) : [];
  }

  regexMatch(word) {
    return String(word).match(this.regex) !== null;
  }

  selectItem(event) {
    // console.log(event)
    this.patchValue(`{{${event.item.value}}}`);
  }

  getCursor() {
    let cursor = this.styledInputText.nativeElement;
    let start = cursor.selectionStart;
    let end = cursor.selectionEnd;
    return [start, end];
  }

  patchValue(selectedValue) {
    let currentValue = this.value;
    let cursor = this.getCursor();
    let patchedValue = currentValue.substring(0, cursor[0] - this.searchTerm.length) + selectedValue + currentValue.substring(cursor[1]);
    this.value = patchedValue;
    this.finalValue.emit(this.value);
  }


  handleScroll(event) {
    this.renderer.nativeElement.scrollTop = event.target.scrollTop;
    this.renderer.nativeElement.scrollLeft = event.target.scrollLeft;
  }


}

