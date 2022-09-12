import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppService } from 'src/app/utils/services/app.service';
import * as uuid from 'uuid/v1';

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
  }

  cancel() {
    this.close.emit(false);
  }

  addField(type: string, data?: any) {
    let newField = {
      uuid: uuid(),
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
    if (this.selectedTargetField && this.selectedTargetField.source && this.selectedTargetField.source.find(e => e.uuid == item.uuid)) {
      return true;
    }
    return false;
  }

  toggleSource(flag: boolean, item: any) {
    if (this.selectedTargetField && !this.selectedTargetField.source) {
      this.selectedTargetField.source = [];
    }
    if (this.selectedTargetField && this.selectedTargetField.source) {
      const index = this.selectedTargetField.source.findIndex(e => e.uuid == item.uuid);
      if (flag && index == -1) {
        this.selectedTargetField.source.push(item);
      }
      if (!flag && index > -1) {
        this.selectedTargetField.source.splice(index, 1);
      }
    }
  }

  get baseCode() {
    return 'return ' + this.selectedTargetField.source.map((src, i) => {
      return 'input' + (i + 1);
    }).join(' + ');
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
