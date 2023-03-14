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
  @Input() initValue: string = '';
  @ViewChild('renderer') renderer: any;

  value: string = '';

  constructor() {

  }


  ngOnInit() {
    this.value = this.initValue;
  }

  onChange = (event) => {
    this.value = event.target.value;
    this.finalValue.emit(this.value);
  };

  get valueArray() {
    const temp = this.value.split(this.regex)
    return this.value.split(this.regex);
  }

  regexMatch(word) {
    return word.match(this.regex) !== null;
  }

  selectItem(event) {
    // console.log(event)
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
    let patchedValue = currentValue.substring(0, cursor[0] - this.searchTerm.length) + selectedValue + currentValue.substring(cursor[1]);
    this.value = patchedValue;
    this.finalValue.emit(this.value);
  }


  handleScroll(event) {
    this.renderer.nativeElement.scrollTop = event.target.scrollTop;
    this.renderer.nativeElement.scrollLeft = event.target.scrollLeft;
  }


}

