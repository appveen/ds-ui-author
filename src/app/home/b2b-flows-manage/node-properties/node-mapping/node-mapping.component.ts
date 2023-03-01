import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { fromEvent } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-node-mapping',
  templateUrl: './node-mapping.component.html',
  styleUrls: ['./node-mapping.component.scss']
})
export class NodeMappingComponent implements OnInit {

  @Input() edit: any;
  @Input() currNode: any;
  @Input() nodeList: Array<any>;
  @Output() close: EventEmitter<any>;
  customSourceFields: Array<any>;
  customTargetFields: Array<any>;
  showFormulaBuilder: boolean;
  fuzzyMapping: EventEmitter<any>;
  clearMapping: EventEmitter<any>;

  selectedField: any;
  allSources: Array<any>;
  constructor(private appService: AppService) {
    this.nodeList = [];
    this.close = new EventEmitter();
    this.customSourceFields = [];
    this.customTargetFields = [];
    this.edit = {
      status: false
    };
    this.fuzzyMapping = new EventEmitter();
    this.clearMapping = new EventEmitter();
    this.allSources = [];
  }

  ngOnInit(): void {
    this.customSourceFields = this.currNode.dataStructure.incoming.definition || [];
    this.customTargetFields = this.currNode.dataStructure.outgoing.definition || [];
    this.allSources = this.flatten(this.customSourceFields);
  }

  cancel() {
    this.close.emit(false);
  }


  done() {
    let mappings = this.customTargetFields.map(item => {
      const temp: any = this.convertToMapping(item);
      let arr = [temp];
      if (item.definition) {
        arr = arr.concat(item.definition.map(e => this.convertToMapping(e)));
      }
      return arr;
    });
    mappings = _.flatten(mappings);
    this.currNode.mappings = mappings;
    this.cancel();
    console.log(mappings);
  }

  convertToMapping(item: any) {
    const temp: any = {};
    temp.target = {
      type: item.type,
      dataPath: item.dataPath,
    };
    temp.source = (item.source || []).map((s) => {
      const t = this.appService.cloneObject(s);
      delete t.definition;
      return t
    });
    temp.formula = item.formula;
    return temp;
  }

  doFuzzyMapping() {
    this.fuzzyMapping.emit(true);
  }

  doClearMapping() {
    this.clearMapping.emit(true);
  }

  flatten(definition: Array<any>, parentKey?: string) {
    let list = [];
    if (definition && definition.length > 0) {
      definition.forEach((item, i) => {
        let key = parentKey ? parentKey + '.' + item.key : item.key;
        if (item.type == 'Array') {
          if (item.definition[0].type == 'Object') {
            list = list.concat(this.flatten(item.definition[0].definition, key));
          } else {
            list.push(item);
          }
        } else if (item.type == 'Object') {
          list = list.concat(this.flatten(item.definition, key));
        } else {
          list.push(item);
        }
      });
    };
    return list;
  }

  get viewBox() {
    return `0 0 1300 670`;
  }
}
