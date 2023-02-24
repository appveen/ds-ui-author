import { Component, ElementRef, EventEmitter, Input, OnInit, ViewChild, ViewEncapsulation, } from '@angular/core';
import { OperatorFunction, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';



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
  @ViewChild('contentDiv') contentDiv: ElementRef;
  @ViewChild('hiddenDiv') hiddenDiv: ElementRef;
  suggestions: any = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  searchTerm: any;
  editableDiv: HTMLElement;
  constructor() {

    this.searchSubject
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((term: string) => this.searchBackend(term)),
        map(results => {
          this.suggestions = results;
          console.log(this.suggestions)
        })
      )
      .subscribe();
  }

  private searchBackend(query: string): Observable<string[]> {
    // implement your search logic here and return an Observable<string[]>
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const results = months.filter(month => month.toLowerCase().startsWith(query.toLowerCase()));

    return of(results);
  }

  ngOnInit() {
    this.editableDiv = document.getElementById('hidden-div');
    this.formatText();
  }

  someTrigger(event, value?) {
    this.unformattedText = event?.target?.innerText || value;
    this.unformattedText = this.unformattedText.replace(/(\r\n|\n|\r)/gm, "");
    this.searchTerm = this.unformattedText.split(/\s+/).filter(term => term !== '');
    this.formatText();
    this.setRange();
    // this.searchSubject.next(this.unformattedText);

    this.search(this.searchTerm).subscribe(results => {
      this.suggestions = results;
    });

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
    var caretPosition = this.getCaretPosition(this.editableDiv);
    var content = this.editableDiv.innerText;
    var newContent = content.slice(0, caretPosition) + 'newText' + content.slice(caretPosition);
    this.editableDiv.innerHTML = newContent;

    let sel = window.getSelection();
    sel.selectAllChildren(this.editableDiv);
    sel.collapseToEnd();
  }


  getCaretPosition(editableDiv) {
    var caretPosition = 0;
    var range = window.getSelection().getRangeAt(0);
    var preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editableDiv);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretPosition = preCaretRange.toString().length;
    return caretPosition;
  }

  selectItem(suggestion) {
    const el = document.getElementById('hidden-div');
    const range = window.getSelection().getRangeAt(0);
    const start = range.startOffset - this.searchTerm.length;
    const end = range.startOffset;
    const newContent = el.innerText.slice(0, start) + suggestion + el.innerText.slice(end);
    el.innerText = newContent;

    this.searchTerm = suggestion;

    const newRange = document.createRange();
    newRange.setStart(el.childNodes[0], start + suggestion.length);
    newRange.setEnd(el.childNodes[0], start + suggestion.length);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(newRange);

    el.focus();


  }

  search(searchTerms: string[]): Observable<string[]> {
    const matches = this.suggestions.filter(suggestion => {
      return searchTerms.some(term => suggestion.toLowerCase().includes(term.toLowerCase()));
    });
    return of(matches);
  }
}

