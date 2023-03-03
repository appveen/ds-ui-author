import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { B2bFlowService } from '../../../b2b-flow.service';

@Component({
  selector: 'odp-data-creator',
  templateUrl: './data-creator.component.html',
  styleUrls: ['./data-creator.component.scss']
})
export class DataCreatorComponent implements OnInit {

  @Input() class: string;
  @Input() disabled: boolean;
  @Input() nodeList: Array<any>;
  @Input() data: any;
  @Output() dataChange: EventEmitter<any>;
  searchTerm: string;
  tempData: any;
  configureWindow: boolean;
  variableSuggestions: Array<{ label: string, value: string }>;
  availableMethods: Array<any>;
  constructor(private flowService: B2bFlowService) {
    this.nodeList = [];
    this.dataChange = new EventEmitter();
    this.variableSuggestions = [];
    this.availableMethods = [];
  }

  ngOnInit(): void {
    this.availableMethods = this.flowService.getAvailableTransformMethods();
    this.tempData = this.data;
    const temp = this.nodeList.map(node => {
      let list = [];
      let statusCode: any = {};
      statusCode.nodeId = node._id;
      statusCode.label = (node.name || node.type) + '/statusCode'
      statusCode.value = `node['${node._id}']` + '.statusCode'
      list.push(statusCode);
      let status: any = {};
      status.nodeId = node._id;
      status.label = (node.name || node.type) + '/status'
      status.value = `node['${node._id}']` + '.status'
      list.push(status);
      let headers: any = {};
      headers.nodeId = node._id;
      headers.label = (node.name || node.type) + '/headers'
      headers.value = `node['${node._id}']` + '.headers'
      list.push(headers);
      if (!node.dataStructure) {
        node.dataStructure = {};
      }
      if (!node.dataStructure.incoming) {
        node.dataStructure.incoming = {};
      }
      if (!node.dataStructure.outgoing) {
        node.dataStructure.outgoing = {};
      }
      if (node.dataStructure.incoming.definition) {
        list = list.concat(this.getNestedSuggestions(node, node.dataStructure.incoming.definition, 'body'));
      }
      if (node.dataStructure.outgoing.definition) {
        list = list.concat(this.getNestedSuggestions(node, node.dataStructure.outgoing.definition, 'responseBody'));
      }
      return list;
    })
    this.variableSuggestions = _.flatten(temp);
  }

  placeValue(item: any) {
    console.log(item);
    if (!this.tempData) {
      this.tempData = '';
    }
    // this.tempData += ' {{' + item.value + '}} ';
    this.tempData += ' ' + item.value + ' ';
  }

  placeMethod(item: any) {
    console.log(item);
    if (!this.tempData) {
      this.tempData = '';
    }
    this.tempData += item.value;
  }

  cancel() {
    this.configureWindow = false;
    this.tempData = this.data;
  }

  done() {
    this.configureWindow = false;
    this.data = this.tempData;
    this.dataChange.emit(this.data);
  }

  getLableAsArray(label: string) {
    if (label) {
      return label.split('/');
    }
    return [];
  }

  getNestedSuggestions(node: any, definition: Array<any>, bodyKey: string, parentKey?: any) {
    let list = [];
    if (definition && definition.length > 0) {
      definition.forEach((def: any) => {
        let key = parentKey ? parentKey + '.' + def.key : def.key;
        if (def.type == 'Object') {
          list = list.concat(this.getNestedSuggestions(node, def.definition, bodyKey, key));
        } else {
          let item: any = {};
          item.nodeId = node._id;
          item.label = (node.name || node.type) + `/${bodyKey}/` + key;
          item.value = `node['${node._id}']` + `.${bodyKey}.` + key;
          list.push(item);
        }
      });
    }
    return list;
  }
}
