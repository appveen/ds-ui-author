import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';

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
  selectedTargetField: any;
  showFormulaBuilder: boolean;
  showAddSource: boolean;
  prevNode: any;
  fuzzyMapping: EventEmitter<any>;
  clearMapping: EventEmitter<any>;

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
  }

  ngOnInit(): void {
    this.prevNode = this.nodeList.find(e => e.onSuccess.findIndex(es => es._id == this.currNode._id) > -1);
    let tempSourceFields = [];
    if (this.currNode && this.currNode.mappings) {
      this.currNode.mappings.forEach(item => {
        const temp = this.appService.cloneObject(item);
        delete temp.target;
        temp.type = item.target.type;
        temp.dataPath = item.target.dataPath;
        this.customTargetFields.push(temp);
        if (temp.source && temp.source.length > 0) {
          tempSourceFields = tempSourceFields.concat(this.appService.cloneObject(temp.source));
          tempSourceFields = _.uniqBy(tempSourceFields, 'dataPath');
        }
      });
    }
    if (this.sourceFields) {
      this.customSourceFields = this.prevNode.dataStructure.outgoing.definition.map((e) => this.convertDefinition(e));
    } else if (!this.sourceFields) {
      this.customSourceFields = tempSourceFields;
    }
    if (this.targetFields) {
      this.customTargetFields = this.currNode.dataStructure.outgoing.definition.map((e) => this.convertDefinition(e));
    }
    if (this.currNode && this.currNode.mappings && this.currNode.mappings.length > 0) {
      this.findTargetMappings(this.customTargetFields);
    }
    if (this.customTargetFields && this.customTargetFields.length > 0) {
      this.selectedTargetField = this.customTargetFields[0];
    }
  }

  convertDefinition(def: any) {
    const temp: any = {};
    temp.name = def.properties.name;
    temp.dataPath = def.properties.dataPath;
    temp.type = def.type;
    if (temp.type == 'Object') {
      temp.definition = def.definition.map((e) => this.convertDefinition(e));
    }
    return temp;
  }

  findTargetMappings(data: any) {
    if (data && data.length > 0) {
      data.forEach(def => {
        if (def.definition && def.definition.length > 0) {
          this.findTargetMappings(def.definition);
        } else {
          const temp = this.currNode.mappings.find(e => e.target.dataPath == def.dataPath);
          if (temp && temp.source && temp.source.length > 0) {
            def.source = temp.source;
            def.formula = temp.formula;
          }
        }
      });
    }
  }

  cancel() {
    this.close.emit(false);
  }

  addField(type: string, data?: any) {
    let newField = {
      type: 'String'
    };
    if (data) {
      newField = Object.assign(newField, data);
    }
    if (type == 'source') {
      this.customSourceFields.push(newField);
    } else {
      this.customTargetFields.push(newField);
      this.selectedTargetField = newField;
    }
  }

  onPaste(event: any, type: string, pasteIndex: number) {
    let val = event.clipboardData.getData('text/plain');
    try {
      const obj = JSON.parse(val);
      Object.keys(this.appService.flattenObject(obj)).forEach(key => {
        this.addField(type, {
          dataPath: key,
          type: typeof obj[key]
        });
      });
    } catch (err) {
      let fields = val.split(/\n/).filter(e => {
        if (e && e.trim() && e.trim() !== ',') {
          return e;
        }
      }).map(e => e.trim());
      if (fields && fields.length < 2) {
        fields = val.split(/\t/).filter(e => {
          if (e && e.trim() && e.trim() !== ',') {
            return e;
          }
        }).map(e => e.trim());
      }
      if (fields && fields.length < 2) {
        fields = val.split(/,/).filter(e => {
          if (e && e.trim() && e.trim() !== ',') {
            return e;
          }
        }).map(e => e.trim());
      }
      fields.forEach(key => {
        this.addField(type, {
          dataPath: key,
          type: 'String'
        });
      });
    }
    if (pasteIndex > -1) {
      this.removeField(type, pasteIndex);
    }
  }

  removeField(type: string, index: number) {
    if (type == 'source') {
      this.customSourceFields.splice(index, 1);
    } else {
      this.customTargetFields.splice(index, 1);
    }
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

  get sourceFields() {
    if (this.prevNode
      && this.prevNode.dataStructure
      && this.prevNode.dataStructure.outgoing
      && this.prevNode.dataStructure.outgoing.definition
      && this.prevNode.dataStructure.outgoing.definition[0]) {
      return true;
    }
    return null;
  }

  get targetFields() {
    if (this.currNode
      && this.currNode.dataStructure
      && this.currNode.dataStructure.outgoing
      && this.currNode.dataStructure.outgoing.definition
      && this.currNode.dataStructure.outgoing.definition[0]) {
      return true;
    }
    return null;
  }
}
