import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';
import { Observable, OperatorFunction, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';



@Component({
  selector: 'odp-styled-text',
  templateUrl: './styled-text.component.html',
  styleUrls: ['styled-text.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StyledTextComponent implements OnInit, OnChanges {
  @Input() regex: RegExp = /({{\S+}})/g;
  @Output() finalValue: EventEmitter<any> = new EventEmitter();

  @Input() suggestions: any = [];
  @Input() ngbTypeahead: any;
  @Input() resultFormatter: any;
  @Input() inputFormatter: any;
  @Input() searchTerm: any;
  @Input() className: any;
  @Input() value: string;
  @Input() disabled: boolean = false
  @Input() type: string = "text"
  @Input() uid: string = '0'
  @Input() placeholder: string = ''
  @Input() useEditableDiv: boolean = false;
  @Input() insertText: EventEmitter<string>;
  @Input() pattern: RegExp = /.*/g
  @Output() onPaste: EventEmitter<any> = new EventEmitter();
  @Output() onEnter: EventEmitter<any> = new EventEmitter();
  @ViewChild('renderer') renderer: any;
  @ViewChild('styledInputText', { static: false }) styledInputText: any;
  @ViewChild('styledDivText', { static: false }) styledDivText: any;

  rendererStyle: any = {};
  divStyle: any = {};
  list: any = [];
  eventValue: any;
  offSet: number;
  oldData: any = '';
  left: any;
  top: any;


  constructor() {

  }


  ngOnInit() {
    if (!this.value) {
      this.value = ''
    }
    if (this.useEditableDiv) {
      // document.querySelector('#parent').setAttribute('class', this.className);
      document.querySelector('.input-container').setAttribute('class', document.querySelector('.input-container').getAttribute('class') + ' ' + this.className);
      document.querySelector('.input-container').setAttribute('style', 'background: transparent');

      const height = document.querySelector('.input-container').clientHeight
      const width = document.querySelector('.input-container').clientWidth - 10

      this.divStyle = {
        height: height + 'px !important',
        width: width + 'px !important',
        'max-height': height + 'px !important',
        overflow: 'auto',
      }

      this.rendererStyle = {
        'white-space': 'pre-wrap',
        'max-height': height + 'px !important',
        overflow: 'auto',
        'z-index': -1,
        'margin': '0 0 0 10px',
        'position': 'absolute'
      }
      this.list = _.cloneDeep(this.suggestions)
    }
    else {
      this.rendererStyle = {
        'margin-top': '0.3rem',
        'padding': '0 10px',
        'position': 'relative'
      }
    }


  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value && changes.value.currentValue) {
      this.value = changes.value.currentValue;
      if (this.styledDivText) {
        this.styledDivText.nativeElement.innerText = this.value;
      }
    }
  }

  onChange = (event, isDiv?) => {
    this.value = isDiv ? event : event.target.value;
    if (isDiv) {
      this.search(of(this.styledDivText.nativeElement.innerText)).subscribe(res => {
        this.list = res
      })
      this.getLeft();
      this.getTop();
      this.oldData = this.styledDivText.nativeElement.innerHTML || '';


    }

    this.finalValue.emit(this.value);
  };

  onChangeEvent(event) {
    this.eventValue = event;
  }

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


  selectOption(event) {
    // this.insertText.emit(event.value + '}}');
    this.replaceValue(event.value)
    this.searchTerm = '';
  }

  replaceValue(value) {

    const regex1 = /{{(?!.*}})(.*)/g;
    const matches = this.value.match(regex1) || [];
    this.searchTerm = matches.length > 0 ? _.cloneDeep(matches).pop() : '';
    const regex = `${this.searchTerm}(?!.*}})(.*)`;
    const mainReg = new RegExp(regex, 'gm')
    let index = this.value.search(mainReg);
    if (index >= 0) {
      const removedSearch = this.removeFromString(this.value, index, this.searchTerm.length);
      const final = removedSearch.substring(0, index) + `{{${value}}}` + removedSearch.substring(index);
      this.styledDivText.nativeElement.innerText = final;
      this.value = final;
      this.finalValue.emit(this.value);
    }
  }


  removeFromString(str, index, number) {
    const outputStringArray = str.split('');
    outputStringArray.splice(index, number);
    return outputStringArray.join('');
  }

  getCursorOnDiv() {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const start = range.startOffset;
    const end = range.endOffset;
    return [start, end]
  }


  getCursor() {
    let cursor = this.useEditableDiv ? this.styledDivText.nativeElement : this.styledInputText.nativeElement;
    let start = cursor.selectionStart;
    let end = cursor.selectionEnd;
    return [start, end];
  }

  patchValue(selectedValue) {
    let currentValue = this.value;
    let cursor = this.useEditableDiv ? this.getCursorOnDiv() : this.getCursor();
    let patchedValue = currentValue.substring(0, cursor[0] - this.searchTerm.length) + selectedValue + currentValue.substring(cursor[1]);
    this.value = patchedValue;
    this.finalValue.emit(this.value);
  }


  handleScroll(event) {
    this.renderer.nativeElement.scrollTop = event.target.scrollTop;
    this.renderer.nativeElement.scrollLeft = event.target.scrollLeft;
  }

  // get getStyle() {
  //   const height = document.querySelector('.input-container').clientHeight
  //   const width = document.querySelector('.input-container').clientWidth

  //   this.styledDivText.nativeElement.style.height = height;
  //   // this.styledDivText.nativeElement.style.height = height;

  //   return {}
  // }

  search: OperatorFunction<string, readonly { label: string, value: string }[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) => {
        const regex = /{{(?!.*}})(.*)/g;
        const matches = term.match(regex) || [];
        this.searchTerm = matches.length > 0 ? _.cloneDeep(matches).pop() : '';
        // term = term.split(' ').filter((ele) => ele.startsWith("{{") && !ele.endsWith("}")).pop() || '';
        // this.searchTerm = term;
        if (this.searchTerm) {
          term = this.searchTerm.replace('{{', '').trim();
        }
        return matches.length === 0 && this.searchTerm === '' ? [] : this.suggestions.filter((v) => v.label.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 15);
      }),
    );

  get suggestionStyle() {
    let left = this.left;
    if (left > 53) {
      left = left - 53
    }
    let top = this.top
    if (top < 10) {
      top = top * 1.5
    }
    else {
      top = top * 1.25
    }
    if (top === 0) {
      top++;
    }

    return {
      position: 'absolute',
      top: top + 'rem',
      left: left / 2 + 'rem',
    }
  }

  getLeft() {
    let selection = window.getSelection();
    const fn = selection.focusNode;
    this.left = fn['length']
  }

  getTop() {
    const currentData = this.styledDivText.nativeElement.innerHTML || '';
    const index = this.findFirstDifferencePos(this.oldData, currentData);
    const preText = currentData.substring(0, index);
    const count = (preText.match(/<br>/g) || []).length;
    this.top = count > 0 ? count : (currentData.match(/<br>/g) || []).length;

  }
  findFirstDifferencePos(str1, str2) {
    var len = Math.min(str1.length, str2.length);
    for (var i = 0; i < len; i++) {
      if (str1[i] !== str2[i]) {
        return i;
      }
    }
    if (str1.length !== str2.length) {
      return len;
    }
    return -1;
  }



}

