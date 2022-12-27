import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

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
  constructor() {
    this.showHeadersWindow = false;
    this.headerList = [];
    this.valueChange = new EventEmitter();
  }

  ngOnInit(): void {
    if (this.currNode && !this.currNode.options) {
      this.currNode.options = {};
    }
    if (this.currNode && this.currNode.options && !this.currNode.options.headers) {
      this.currNode.options.headers = {};
    }
    this.defaultHeaderList();
  }

  defaultHeaderList() {
    this.headerList = Object.keys(this.currNode.options.headers).map(key => {
      const temp: any = {};
      temp.key = key;
      temp.value = this.currNode.options.headers[key];
      return temp;
    });
  }

  addHeader() {
    this.headerList.push({ key: "", value: "" });
  }

  removeHeader(index: number) {
    this.headerList.splice(index, 1);
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
  cancel() {
    this.showHeadersWindow = false;
    this.defaultHeaderList();
  }
}
