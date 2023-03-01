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
    const oldText = this.unformattedText;
    this.unformattedText = event?.target?.innerText || value;
    const index = this.findFirstDifference(this.unformattedText, oldText)
    console.log(index)
    this.suggestions = _.cloneDeep(this.list)
    this.unformattedText = this.unformattedText ? this.unformattedText.replace(/(\r\n|\n|\r)/gm, "") : '';
    let term = this.unformattedText.split(/[\{\}\s]+/).pop();
    this.searchTerm = term && term.trim() !== '' ? [term.trim()] : null;
    if (this.searchTerm && this.searchTerm[0] !== '') {
      this.search(this.searchTerm).subscribe(results => {
        this.suggestions = results;
      });
    }
    this.formatText();
    this.setRange()
    // this.setCaretPosition(this.editableDiv, index);

  }


  findFirstDifference(str1 = '', str2 = '') {
    for (let i = 0; i < Math.max(str1.length, str2.length); i++) {
      if (str1[i] !== str2[i]) {
        return i;
      }
    }
    return str1.length === str2.length ? -1 : Math.min(str1.length, str2.length);
  }

  formatText() {
    if (this.unformattedText) {
      const pattern = new RegExp(this.regex, 'g');

      this.formattedText = this.unformattedText.replace(pattern, `<span class="d-flex align-items-center text-primary">$&</span>`);
    } else {
      this.formattedText = '';
    }


    // const finalHtml = this.formatOther(this.formattedText)

    this.editableDiv.innerHTML = this.formattedText;

  }

  setRange() {
    let sel = window.getSelection();
    sel.selectAllChildren(this.editableDiv);
    sel.collapseToEnd();
  }

  setCaretPosition(el, index) {
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(el.childNodes[0], index + 1);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus();
  }


  selectItem(suggestion) {

    const val = '${{' + suggestion + '}}';
    const completeText = this.editableDiv.innerText.replace(new RegExp(this.searchTerm.toString() + '$'), val);
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


  formatOther(str) {
    const pattern = new RegExp('<span (.*?)<\/span>', 'g');
    const match = str.match(pattern);
    let replacement = '';
    for (let i = 0; i < str.length; i++) {
      let char = str.charAt(i);
      let found = false;
      if (match) {

        for (let j = 0; j < match.length; j++) {
          if (i >= str.indexOf(match[j]) && i < str.indexOf(match[j]) + match[j].length) {
            replacement += char;
            found = true;
            break;
          }
        }
      }

      if (!found) {
        replacement += "<p>" + char + "</p>";
      }
    }

    return replacement
  }

}

