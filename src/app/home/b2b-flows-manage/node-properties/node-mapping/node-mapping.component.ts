import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { AppService } from 'src/app/utils/services/app.service';
import { environment } from 'src/environments/environment';
import { B2bFlowService } from '../../b2b-flow.service';
import { MappingService } from './mapping.service';

@Component({
  selector: 'odp-node-mapping',
  templateUrl: './node-mapping.component.html',
  styleUrls: ['./node-mapping.component.scss'],
  providers: [MappingService]
})
export class NodeMappingComponent implements OnInit {

  @Input() edit: any;
  @Input() currNode: any;
  @Input() inputNode: any;
  @Input() source: string;
  @Output() close: EventEmitter<any>;
  allSources: Array<any>;
  allTargets: Array<any>;
  tempMappings: Array<any>;
  pathList: Array<any>;
  svgStyle: any;
  nodeList: Array<any>;
  selectedPath: any;
  constructor(private appService: AppService,
    private mappingService: MappingService,
    private flowService: B2bFlowService) {
    this.nodeList = [];
    this.close = new EventEmitter();
    this.edit = {
      status: false
    };
    this.allSources = [];
    this.allTargets = [];
    this.pathList = [];
    this.svgStyle = {};
    this.source = 'outgoing';
  }

  ngOnInit(): void {
    let customTargetFields;
    if (this.currNode.dataStructure && this.currNode.dataStructure[this.source] && this.currNode.dataStructure[this.source].definition) {
      customTargetFields = this.appService.cloneObject(this.currNode.dataStructure[this.source].definition) || [];
    }
    this.allTargets = this.mappingService.flatten((this.currNode.dataStructure?.[this.source]?.formatType || 'JSON'), customTargetFields);

    this.nodeList = this.flowService.getNodesBefore(this.currNode);
    this.nodeList.forEach((node: any) => {
      let outgoing;
      if (node._id != this.currNode._id) {
        if (node.dataStructure.outgoing && node.dataStructure.outgoing.definition) {
          outgoing = this.appService.cloneObject(node.dataStructure.outgoing.definition);
          this.allSources = this.allSources.concat(this.flattenSource(node, outgoing, 'responseBody'));
        }
      }
    });
    if (this.currNode.mappings && this.currNode.mappings.length > 0) {
      this.tempMappings = this.appService.cloneObject(this.currNode.mappings);
      this.allTargets.forEach((item: any) => {
        let temp = this.tempMappings.find((e: any) => e.target.dataPath == item.dataPath);
        if (temp && temp.source && temp.source.length > 0) {
          item.source = (temp.source || []).map((source: any) => this.allSources.find((src: any) => src._id == source._id)).filter(e => e);
        }
        if (temp && temp.formula) {
          item.formula = temp.formula;
        }
      });
      setTimeout(() => {
        this.mappingService.reCreatePaths.emit(null);
      }, 200);
    }

    this.mappingService.reCreatePaths.pipe(debounceTime(200)).subscribe((data: any) => {
      if (data) {
        this.renderPaths(data.source.definition, data.target.definition);
      } else {
        this.pathList = [];
        this.allTargets.forEach((target: any) => {
          (target.source || []).forEach((src) => {
            this.renderPaths(src, target);
          });
        });
      }
    });
    setTimeout(() => {
      const mappingBox: HTMLElement = document.querySelectorAll('.mapping-box')[0] as HTMLElement;
      this.svgStyle = { 'height': mappingBox.scrollHeight + 'px' };
    }, 500);
  }

  cancel() {
    this.close.emit(false);
  }


  done() {
    let mappings = this.allTargets.map(item => this.convertToMapping(item));
    this.currNode.mappings = mappings;
    this.cancel();
    if (!environment.production) {
      console.log(mappings);
    }
  }

  convertToMapping(item: any) {
    const temp: any = {};
    temp.target = {
      type: item.type,
      dataPath: item.dataPath,
      _id: item._id
    };
    temp.source = (item.source || []).map((s) => {
      let temp: any = {};
      temp._id = s._id;
      temp.type = s.type;
      temp.dataPath = s.dataPath;
      return temp;
    });
    temp.formula = item.formula;
    return temp;
  }

  doFuzzyMapping() {
    this.mappingService.fuzzyMapping.emit(true);
    setTimeout(() => {
      this.mappingService.reCreatePaths.emit();
    }, 200);
  }

  doClearMapping() {
    this.mappingService.clearMappings.emit(true);
    setTimeout(() => {
      this.mappingService.reCreatePaths.emit();
    }, 200);
  }

  renderPaths(source: any, target: any) {
    const sourceId = source._id;
    const targetId = target._id;
    const sourceNodeId = source.nodeId;
    const mappingPaths: HTMLElement = document.querySelectorAll('.mapping-paths')[0] as HTMLElement;
    const sourceEle: HTMLElement = document.querySelectorAll(`[data-id='${sourceId}']`)[0] as HTMLElement;
    const targetEle: HTMLElement = document.querySelectorAll(`[data-id='${targetId}']`)[0] as HTMLElement;
    const nodeEle: HTMLElement = document.querySelectorAll(`[data-id='${sourceNodeId}']`)[0] as HTMLElement;
    const pathRect = mappingPaths.getBoundingClientRect();
    const targetRect = targetEle.getBoundingClientRect();
    let tempRect;
    if (sourceEle && targetEle) {
      tempRect = sourceEle.getBoundingClientRect();
    } else if (nodeEle && targetEle) {
      tempRect = nodeEle.getBoundingClientRect();
    }
    if (tempRect) {
      const sourceCoordinates = {
        x: 7,
        y: tempRect.top - pathRect.top + 6
      };
      const targetCoordinates = {
        x: pathRect.width,
        y: targetRect.top - pathRect.top + 6
      };
      let path = this.mappingService.generateLinkPath(sourceCoordinates.x, sourceCoordinates.y, targetCoordinates.x, targetCoordinates.y, 1.5);
      this.pathList.push({ path, source: source._id, target: target._id });
    }
  }

  flattenSource(node: any, definition: Array<any>, bodyKey: string, parentDef?: any) {
    let list = [];
    try {
      if (definition && definition.length > 0) {
        definition.forEach((def, i) => {
          delete def._id;
          let key = parentDef ? parentDef.dataPath + '.' + def.key : def.key;
          let nameAsKey = parentDef ? parentDef.dataPath + '.' + def.properties.name : def.properties.name;
          let name = parentDef ? parentDef.properties.name + '/' + def.properties.name : def.properties.name;
          if (node.dataStructure.outgoing && node.dataStructure.outgoing.formatType == 'JSON') {
            def._id = `${node._id}.${bodyKey}.${key}`;
          } else {
            def._id = `${node._id}.${bodyKey}.${nameAsKey}`;
          }
          def.nodeId = node._id;
          def.properties.name = name;
          if (node.dataStructure.outgoing && node.dataStructure.outgoing.formatType == 'JSON') {
            def.properties.dataPath = key;
            def.dataPath = key;
          } else {
            def.properties.dataPath = nameAsKey;
            def.dataPath = nameAsKey;
          }
          def.name = name;
          def.depth = parentDef ? parentDef.depth + 1 : 0;
          if (def.type == 'Array') {
            if (def.definition[0].type == 'Object') {
              list.push(def);
              list = list.concat(this.flattenSource(node, def.definition[0].definition, bodyKey, def));
            } else {
              list.push(def);
            }
          } else if (def.type == 'Object') {
            list.push(def);
            list = list.concat(this.flattenSource(node, def.definition, bodyKey, def));
          } else {
            list.push(def);
          }
        });
      };
    } catch (err) {
      console.log(err);
    }
    return list;
  }

  selectPath(event: any, path: any, index: number) {
    event.stopPropagation();
    this.selectedPath = path;
  }

  isPathSelected(path: any) {
    if (this.selectedPath && this.selectedPath.source == path.source && this.selectedPath.target == path.target) {
      return true;
    }
    return false;
  }

  getDeleteIconStyle(path: any) {
    const segs = path.path.split(" ");
    let x = segs[8] - 100;
    let y = segs[9];
    return { transform: `translate(${x}px,${y}px)` };
  }

  deletePath(event: any, path: any, index: number) {
    event.stopPropagation();
    this.pathList.splice(index, 1);
    const temp = this.allTargets.find(e => e._id == path.target);
    if (temp && temp.source && temp.source.length > 0) {
      let tempIndex = temp.source.findIndex(e => e._id == path.source);
      temp.source.splice(tempIndex, 1);
    }
  }
}
