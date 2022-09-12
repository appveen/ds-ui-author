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
  @Input() prevNode: any;
  @Input() currNode: any;
  @Input() nodeList: Array<any>;
  @Output() close: EventEmitter<any>;
  customSourceFields: Array<any>;
  customTargetFields: Array<any>;
  selectedTargetField: any;
  showFormulaBuilder: boolean;
  constructor(private appService: AppService) {
    this.nodeList = [];
    this.close = new EventEmitter();
    this.customSourceFields = [];
    this.customTargetFields = [];
    this.edit = {
      status: true
    };
  }

  ngOnInit(): void {
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
    if (!this.sourceFields) {
      this.customSourceFields = tempSourceFields;
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

  isSourceSelected(item: any) {
    if (this.selectedTargetField && this.selectedTargetField.source && this.selectedTargetField.source.find(e => e.dataPath == item.dataPath)) {
      return true;
    }
    return false;
  }

  toggleSource(flag: boolean, item: any) {
    if (this.selectedTargetField && !this.selectedTargetField.source) {
      this.selectedTargetField.source = [];
    }
    if (this.selectedTargetField && this.selectedTargetField.source) {
      const index = this.selectedTargetField.source.findIndex(e => e.dataPath == item.dataPath);
      if (flag && index == -1) {
        this.selectedTargetField.source.push(item);
      }
      if (!flag && index > -1) {
        this.selectedTargetField.source.splice(index, 1);
      }
    }
  }

  done() {
    const mappings = this.customTargetFields.map(item => {
      const temp: any = {};
      temp.target = {
        type: item.type,
        dataPath: item.dataPath,
      };
      temp.source = (item.source || []).map((s) => {
        const t = this.appService.cloneObject(s);
        return t
      });
      temp.formula = item.formula;
      return temp;
    }).filter(e => e);
    this.currNode.mappings = mappings;
    this.cancel();
    console.log(mappings);
  }

  get baseCode() {
    return 'return ' + (this.selectedTargetField.source || []).map((src, i) => {
      return 'input' + (i + 1);
    }).join(' + ') + ';';
  }

  get sourceFields() {
    if (this.prevNode && this.prevNode.dataStructure && this.prevNode.dataStructure.outgoing && this.prevNode.dataStructure.outgoing._id) {
      return [];
    }
    return null;
  }

  get targetFields() {
    if (this.currNode && this.currNode.dataStructure && this.currNode.dataStructure.outgoing && this.currNode.dataStructure.outgoing._id) {
      return [];
    }
    return null;
  }
}
