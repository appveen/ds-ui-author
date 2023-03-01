import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MappingService {

  selectedSourceNode: any;
  selectedTargetNode: any;
  reCreatePaths: EventEmitter<any>;
  deSelectPath: EventEmitter<any>;
  clearMappings: EventEmitter<any>;
  fuzzyMapping: EventEmitter<any>;
  constructor() {
    this.reCreatePaths = new EventEmitter();
    this.deSelectPath = new EventEmitter();
    this.clearMappings = new EventEmitter();
    this.fuzzyMapping = new EventEmitter();
  }

  tryMapping() {
    if (this.selectedSourceNode && this.selectedTargetNode) {
      if (!this.selectedTargetNode.source) {
        this.selectedTargetNode.source = [];
      }
      this.selectedTargetNode.source.push(this.selectedSourceNode);
      this.reCreatePaths.emit({ source: this.selectedSourceNode._id, target: this.selectedTargetNode._id });
      this.selectedSourceNode = null;
      this.selectedTargetNode = null;
    }
  }

  flatten(definition: Array<any>, parentDef?: any) {
    let list = [];
    try {
      if (definition && definition.length > 0) {
        definition.forEach((item, i) => {
          let key = parentDef ? parentDef.key + '.' + item.key : item.key;
          let name = parentDef ? parentDef.properties.name + '/' + item.properties.name : item.properties.name;
          item.properties.name = name;
          item.properties.dataPath = key;
          item.name = name;
          item.dataPath = key;
          item.depth = parentDef ? parentDef.depth + 1 : 0;
          if (item.type == 'Array') {
            if (item.definition[0].type == 'Object') {
              list.push(item);
              list = list.concat(this.flatten(item.definition[0].definition, item));
            } else {
              list.push(item);
            }
          } else if (item.type == 'Object') {
            list.push(item);
            list = list.concat(this.flatten(item.definition, item));
          } else {
            list.push(item);
          }
        });
      };
    } catch (err) {
      console.log(err);
    }
    return list;
  }

}
