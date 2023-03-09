import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';



@Component({
  selector: 'odp-styled-text',
  templateUrl: './styled-text.component.html',
  styleUrls: ['styled-text.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StyledTextComponent implements OnInit {
  @Input() regex: RegExp = /({{.*?}})/g;
  @Output() finalValue: EventEmitter<any> = new EventEmitter();

  @Input() suggestions: any = [];
  @Input() ngbTypeahead: any;
  @Input() resultFormatter: any;
  @Input() inputFormatter: any;

  value: string = '';

  constructor() {
  }


  ngOnInit() {

  }

  onChange = (event) => {
    this.value = event.target.value;
  };

  get valueArray() {
    return this.value.split(this.regex);
  }

  regexMatch(word) {
    return word.match(this.regex) !== null;
  }

  selectItem(event) {
    console.log(event)
    this.patchValue(`{{${event.item.label}}}`);
  }

  getCursor() {
    let cursor = document.getElementById('myInput') as HTMLInputElement;
    let start = cursor.selectionStart;
    let end = cursor.selectionEnd;
    return [start, end];
  }

  patchValue(selectedValue) {
    let currentValue = this.value;
    let cursor = this.getCursor();
    let patchedValue = currentValue.substr(0, cursor[0]) + selectedValue + currentValue.substr(cursor[1]);
    this.value = patchedValue;
  }

}

