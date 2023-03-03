import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { AppService } from 'src/app/utils/services/app.service';
import { environment } from 'src/environments/environment';
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
  @Input() nodeList: Array<any>;
  @Output() close: EventEmitter<any>;
  allSources: Array<any>;
  allTargets: Array<any>;
  tempMappings: Array<any>;
  pathList: Array<any>;
  svgStyle: any;
  constructor(private appService: AppService,
    private mappingService: MappingService) {
    this.nodeList = [];
    this.close = new EventEmitter();
    this.edit = {
      status: false
    };
    this.allSources = [];
    this.allTargets = [];
    this.pathList = [];
    this.svgStyle = {};
  }

  ngOnInit(): void {
    let customTargetFields;
    if (this.currNode.dataStructure && this.currNode.dataStructure.outgoing && this.currNode.dataStructure.outgoing.definition) {
      customTargetFields = this.appService.cloneObject(this.currNode.dataStructure.outgoing.definition) || [];
    }
    this.allTargets = this.mappingService.flatten(customTargetFields);
    this.nodeList.forEach((node: any) => {
      let incoming, outgoing;
      if (node._id != this.currNode._id) {
        if (node.dataStructure.incoming && node.dataStructure.incoming.definition) {
          incoming = this.appService.cloneObject(node.dataStructure.incoming.definition);
          this.allSources = this.allSources.concat(this.flattenSource(node, incoming, 'body'));
        }
        if (node.dataStructure.outgoing && node.dataStructure.outgoing.definition) {
          outgoing = this.appService.cloneObject(node.dataStructure.outgoing.definition);
          this.allSources = this.allSources.concat(this.flattenSource(node, outgoing, 'responseBody'));
        }
      }
    });
    // if (this.currNode.mappings && this.currNode.mappings.length > 0) {
    //   this.tempMappings = this.appService.cloneObject(this.currNode.mappings);
    //   this.allTargets.forEach((item: any) => {
    //     let temp = this.tempMappings.find((e: any) => e.target.dataPath == item.dataPath);
    //     if (temp && temp.source) {
    //       item.source = (temp.source || []).map((source: any) => this.allSources.find((src: any) => src.dataPath == source.dataPath)).filter(e => e);
    //     }
    //   });
    // }

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
    };
    temp.source = (item.source || []).map((s) => {
      let temp: any = {};
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
      this.pathList.push({ path });
    }
  }

  flattenSource(node: any, definition: Array<any>, bodyKey: string, parentDef?: any) {
    let list = [];
    try {
      if (definition && definition.length > 0) {
        definition.forEach((def, i) => {
          delete def._id;
          let key = parentDef ? parentDef.dataPath + '.' + def.key : def.key;
          let name = parentDef ? parentDef.properties.name + '/' + def.properties.name : def.properties.name;
          def._id = node._id + '.' + bodyKey + '.' + key;
          def.nodeId = node._id;
          def.properties.name = name;
          def.properties.dataPath = key;
          def.name = name;
          def.dataPath = key;
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
}
