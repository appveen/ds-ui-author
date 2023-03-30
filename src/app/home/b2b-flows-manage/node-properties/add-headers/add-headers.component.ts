import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { OperatorFunction, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { B2bFlowService } from '../../b2b-flow.service';

@Component({
  selector: 'odp-add-headers',
  templateUrl: './add-headers.component.html',
  styleUrls: ['./add-headers.component.scss']
})
export class AddHeadersComponent implements OnInit {

  @Input() value: string;
  @Output() valueChange: EventEmitter<string>;
  @Input() currNode: any;
  @Input() nodeList: Array<any>;
  @Input() edit: any;
  showHeadersWindow: boolean;
  headerList: Array<any>;
  toggleTextBox: boolean;
  searchTerm: any;
  // sampleJSON: any
  constructor(private flowService: B2bFlowService) {
    this.showHeadersWindow = false;
    this.nodeList = [];
    this.headerList = [];
    this.valueChange = new EventEmitter();
    this.edit = { status: false };
  }

  ngOnInit(): void {
    if (this.currNode && !this.currNode.options) {
      this.currNode.options = {};
    }
    if (this.currNode && this.currNode.options && !this.currNode.options.headers) {
      this.currNode.options.headers = {};
    }
    this.headerList = [];
    if (this.currNode.options.headers) {
      this.defaultHeaderList();
    }
  }

  showHeader() {
    this.showHeadersWindow = true;
    if (this.headerList.length == 0) {
      this.addHeader();
    }
  }

  defaultHeaderList() {
    this.headerList = Object.keys(this.currNode.options.headers).map(key => {
      const temp: any = {};
      temp.key = key;
      temp.value = this.currNode.options.headers[key];
      return temp;
    });
  }

  addHeader(index?: number) {
    if (index !== null && index !== undefined) {
      this.headerList.splice(index + 1, 0, { key: "", value: "" });
    } else {
      this.headerList.push({ key: "", value: "" });
    }
  }

  removeHeader(index: number) {
    this.headerList.splice(index, 1);
  }

  clearHeaders() {
    this.headerList.splice(0);
    this.save();
  }

  save() {
    if (this.currNode.options.headers && !_.isEmpty(this.currNode.options.headers)) {
      Object.keys(this.currNode.options.headers).forEach(key => {
        delete this.currNode.options.headers[key];
      });
    }
    if (!this.currNode.options.headers) {
      this.currNode.options.headers = {};
    }
    this.headerList.reduce((prev, curr) => {
      this.currNode.options.headers[curr.key] = curr.value;
      prev[curr.key] = curr.value;
      return prev;
    }, {});
    this.value = this.currNode.options.headers;
    this.valueChange.emit(this.value);
    this.showHeadersWindow = false;
  }

  onTextDataChange(text: string) {
    try {
      this.headerList = [];
      if (!text) {
        return;
      }
      let data = JSON.parse(text);
      Object.keys(data).forEach(key => {
        let val = data[key];;
        if (val && typeof val == 'object') {
          val = JSON.stringify(val);
        }
        this.headerList.push({ key: key, value: val + '' });
      });
    } catch (error) {
      console.error(error);
    }
  }

  cancel() {
    this.showHeadersWindow = false;
    this.defaultHeaderList();
  }

  formatter(result: any) {
    if (result && typeof result == 'object') {
      return result.label;
    }
    return result;
  };

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
          term = this.searchTerm.replace('{{', '');
        }
        return matches.length === 0 && this.searchTerm === '' ? [] : this.variableSuggestions.filter((v) => v.label.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 15);
      }),
    );

  onValueChange(value: any, item: any) {
    item.value = value;
  }

  get variableSuggestions() {
    return this.flowService.getSuggestions(this.currNode)
  }

  get sampleJSON() {
    return this.headerList.reduce((prev, curr) => {
      prev[curr.key] = curr.value;
      return prev;
    }, {});
  }
}
