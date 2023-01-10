import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'odp-data-service-properties',
  templateUrl: './data-service-properties.component.html',
  styleUrls: ['./data-service-properties.component.scss']
})
export class DataServicePropertiesComponent implements OnInit {

  @Input() edit: any;
  @Input() prevNode: any;
  @Input() currNode: any;
  @Input() nodeList: Array<any>;

  constructor() {
    this.edit = { status: true };
  }

  ngOnInit(): void {
    this.setDefaultData();
  }

  setDefaultData() {
    if (this.currNode && this.currNode.options) {
      if (this.currNode.options.update && !this.currNode.options.fields) {
        this.currNode.options.fields = '_id';
      }
      if ((this.currNode.options.update || this.currNode.options.insert) && !this.currNode.options.body) {
        this.currNode.options.body = `{{node["${this.prevNode._id}"].body}}`;
      }
      if (this.currNode.options.get) {
        if (!this.currNode.options.select) {
          this.currNode.options.select = '*';
        }
        if (!this.currNode.options.sort) {
          this.currNode.options.sort = '_metadata.lastUpdated';
        }
        if (!this.currNode.options.count) {
          this.currNode.options.count = 10;
        }
        if (!this.currNode.options.filter) {
          this.currNode.options.filter = '{}';
        }
      }
      if (this.currNode.options.delete) {
        this.currNode.options.documentId = `{{node["${this.prevNode._id}"].body._id}}`;
      }
    }
  }

  selectDataService(data: any) {
    this.currNode.dataStructure.outgoing = data;
  }

  setDataServiceOperation(type: string, val: any) {
    delete this.currNode.options.documentId;
    delete this.currNode.options.body;
    delete this.currNode.options.fields;
    delete this.currNode.options.select;
    delete this.currNode.options.sort;
    delete this.currNode.options.count;
    delete this.currNode.options.filter;

    if (type == 'get' || type == 'delete') {
      delete this.currNode.options.insert;
      delete this.currNode.options.update;
      if (type == 'get') {
        delete this.currNode.options.delete;
      } else {
        delete this.currNode.options.get;
      }
    }
    if (type == 'update' || type == 'insert') {
      delete this.currNode.options.get;
      delete this.currNode.options.delete;
    }
    if (!this.currNode.options.get &&
      !this.currNode.options.update &&
      !this.currNode.options.insert &&
      !this.currNode.options.delete) {
      this.currNode.options.insert = true;
    }
    this.setDefaultData();
  }
}
