import { Component, ElementRef, EventEmitter, Input, OnInit, ViewChild, ViewEncapsulation, } from '@angular/core';
import { OperatorFunction, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';



@Component({
  selector: 'odp-styled-text',
  templateUrl: './styled-text.component.html',
  styleUrls: ['styled-text.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StyledTextComponent implements OnInit {
  private searchSubject = new Subject<string>();
  regex: RegExp = /\${{([^}]*)}}/;
  @Input() cssClass: string;
  @Input() cssStyle: string;
  @Input() onDblClick: EventEmitter<any> = new EventEmitter();
  unformattedText: string = '';
  formattedText: string = '';
  model: any;
  states: any;
  suggestions: any = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  searchTerm: any;
  editableDiv: HTMLElement;
  list: any
  constructor() {
    this.list = _.cloneDeep(this.suggestions)

  }


  ngOnInit() {
    this.editableDiv = document.getElementById('hidden-div');
    this.formatText();
  }

  someTrigger(event, value?) {
    this.unformattedText = event?.target?.innerText || value;
    this.suggestions = _.cloneDeep(this.list)
    this.unformattedText = this.unformattedText ? this.unformattedText.replace(/(\r\n|\n|\r)/gm, "") : '';
    let term = this.unformattedText.split(/[\{\}]+/).pop();

    console.log(term)
    this.searchTerm = term && term.trim() !== '' ? [term.trim()] : null;
    this.formatText();
    this.setRange();

    if (this.searchTerm && this.searchTerm[0] !== '') {
      this.search(this.searchTerm).subscribe(results => {
        this.suggestions = results;
      });
    }


  }


  formatText() {
    if (this.unformattedText) {
      const pattern = new RegExp(this.regex, 'g');
      this.formattedText = this.unformattedText.replace(pattern, `<span class="d-flex align-items-center text-primary">$&</span>`);
    } else {
      this.formattedText = '';
    }

    this.editableDiv.innerHTML = this.formattedText;
  }

  setRange() {
    this.getCaretPosition(this.editableDiv);
    let sel = window.getSelection();
    console.log(document.getSelection().getRangeAt(0).startOffset)
    sel.selectAllChildren(this.editableDiv);
    sel.collapseToEnd();
  }


  // getCaretPosition(editableDiv) {
  //   var caretPosition = 0;
  //   var range = window.getSelection().getRangeAt(0);
  //   var preCaretRange = range.cloneRange();
  //   preCaretRange.selectNodeContents(editableDiv);
  //   preCaretRange.setEnd(range.endContainer, range.endOffset);
  //   caretPosition = preCaretRange.toString().length;
  //   return caretPosition;
  // }


  getCaretPosition(editableDiv) {
    var caretPos = 0,
      sel, range;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.rangeCount) {
        range = sel.getRangeAt(0);
        if (range.commonAncestorContainer.parentNode == editableDiv) {
          caretPos = range.endOffset;
        }
      }
    }
    return caretPos;
  }

  selectItem(suggestion) {

    const val = '${{' + suggestion + '}}';
    const completeText = this.editableDiv.innerText.replace(new RegExp(this.searchTerm.toString() + '$'), ' ' + val + ' ');
    // const completeText = this.editableDiv.innerText + ' ' + val;
    this.searchTerm = []
    this.someTrigger(null, completeText);

    this.editableDiv.focus();

  }

  search(searchTerms: string[]): Observable<string[]> {
    const matches = this.suggestions.filter(suggestion => {
      return searchTerms.some(term => suggestion.toLowerCase().includes(term.toLowerCase()));
    });
    return of(matches);
  }
}

