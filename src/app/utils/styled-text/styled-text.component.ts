import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { debounce, debounceTime } from 'rxjs/operators';



@Component({
  selector: 'odp-styled-text',
  templateUrl: './styled-text.component.html',
  styleUrls: ['styled-text.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StyledTextComponent implements OnInit {
  regex: RegExp = /\{{([^}]*)}}/;
  @Input() cssClass: string;
  @Input() cssStyle: string;
  @Output() value: EventEmitter<any> = new EventEmitter();
  unformattedText: string = '';
  formattedText: string = '';
  model: any;
  states: any;
  @Input() suggestions: any = [];
  searchTerm: any;
  editableDiv: HTMLElement;
  list: any
  constructor() {
    if (this.suggestions.length === 0) {
      this.suggestions = [{ label: 'ABC', value: 'ABC' }, { label: 'DEF', value: 'DEF' }, { label: 'GHI', value: 'GHI' }, { label: 'JKL', value: 'JKL' }, { label: 'MNO', value: 'MNO' }, { label: 'PQR', value: 'PQR' }, { label: 'STU', value: 'STU' }, { label: 'VWX', value: 'VWX' }, { label: 'YZ', value: 'YZ' }]
    }
    this.list = _.cloneDeep(this.suggestions)

  }


  ngOnInit() {
    this.editableDiv = document.getElementById('hidden-div');

    this.formatText();
  }

  someTrigger(event, value?, totalIndex?) {
    const oldText = this.unformattedText;
    this.unformattedText = event?.target?.innerText || value;
    this.unformattedText = this.unformattedText ? this.unformattedText.replace(/(\r\n|\n|\r)/gm, "") : '';
    let index = totalIndex - 1 || this.findFirstDifference(this.unformattedText, oldText)
    let term = this.unformattedText.split(/[\{\}\s]+/).pop();
    this.searchTerm = term && term.trim() !== '' ? term.trim() : null;
    if (this.searchTerm) {
      setTimeout(() => {
        this.search(this.searchTerm);
      }, 200)
    }
    this.formatText();
    // this.setRange()
    const childNode = this.testNodes(this.editableDiv, index)
    console.log(childNode)
    index = childNode.index
    this.setCaretPosition(this.editableDiv, childNode.node, this.unformattedText.length > oldText.length ? index + 1 : index);

  }

  testNodes(node, index) {
    let totalLength = 0;
    let childIndex = -1;
    let indexInChild = -1;
    for (const childNode of node.childNodes) {
      childIndex++;

      const childLength = childNode.textContent.length;
      if (totalLength + childLength > index) {
        indexInChild = index - totalLength;
        break;
      }
      totalLength += childLength;

    }

    return { node: childIndex, index: indexInChild }
  }


  findFirstDifference(str1 = '', str2 = '') {
    const length = Math.max(str1.length, str2.length);
    for (let i = 0; i < length; i++) {
      const char1 = this.hasWhiteSpace(str1[i]) ? 'space' : str1[i];
      const char2 = this.hasWhiteSpace(str2[i]) ? 'space' : str2[i];
      if (char1 !== char2) {
        return i;
      }
    }
    return -1; // no difference found
  }


  hasWhiteSpace(s) {
    return /\s/g.test(s);
  }
  formatText() {
    if (this.unformattedText) {
      const pattern = new RegExp(this.regex, 'g');

      this.formattedText = this.unformattedText.replace(pattern, `<text class="d-flex align-items-center text-primary mr-1">$&</text>`);
    } else {
      this.formattedText = '';
    }
    // this.formattedText = this.formatOther(this.formattedText);
    this.editableDiv.innerHTML = this.formattedText;

  }

  setRange() {
    let sel = window.getSelection();
    sel.selectAllChildren(this.editableDiv);
    sel.collapseToEnd();
  }

  setCaretPosition(el, child, index) {
    var range = document.createRange();
    var sel = window.getSelection();
    if (el.childNodes && el.childNodes[child] && el.childNodes[child].textContent.length <= index) {
      this.setRange()
    }
    else {
      range.setStart(el.childNodes[child] ? el.childNodes[child] : el, index);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      el.focus();
    }

  }


  selectItem(suggestion) {
    const currentText = this.editableDiv.innerText;
    const label = '{{' + suggestion.label + '}}';
    const val = suggestion.value;
    const finalValue = currentText.replace(new RegExp(this.searchTerm.toString() + '$'), val);
    this.value.emit(finalValue);
    const completeText = this.editableDiv.innerText.replace(new RegExp(this.searchTerm.toString() + '$'), label);
    const totalIndex = completeText.indexOf(label) + label.length;
    this.searchTerm = []
    this.someTrigger(null, completeText, totalIndex);

    this.editableDiv.focus();

  }

  search(searchTerm: string) {
    this.list = _.cloneDeep(this.suggestions)
    const matches = this.list.filter(suggestion => {
      return suggestion.label && suggestion.label.toLowerCase().includes(searchTerm.toLowerCase());
    });
    this.list = matches
  }

  formatOther(str) {
    const pattern = new RegExp('<text class(.*?)<\/text>', 'g');
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
        replacement += "<text>" + char + "</text>";
      }
    }

    return replacement
  }

  get showSuggestions() {
    return this.searchTerm && this.list.length > 0
  }


}

