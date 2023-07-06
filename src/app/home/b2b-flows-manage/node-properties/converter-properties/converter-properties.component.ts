import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import Fuse from 'fuse.js';

import { CommonService } from 'src/app/utils/services/common.service';
import { debounceTime } from 'rxjs/operators';
import { AppService } from 'src/app/utils/services/app.service';
import { B2bFlowService } from '../../b2b-flow.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'odp-converter-properties',
  templateUrl: './converter-properties.component.html',
  styleUrls: ['./converter-properties.component.scss']
})
export class ConverterPropertiesComponent implements OnInit {

  @Input() flowData: any;
  @Input() data: any;
  @Output() close: EventEmitter<any>;
  showConverterWindow: boolean;
  dragItem: any;
  allSources: Array<any>;
  allTargets: Array<any>;
  allConstants: Array<any>;
  pathList: Array<any>;
  reCreatePaths: EventEmitter<any>;
  clearMappings: EventEmitter<any>;
  tempMappings: any;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private flowService: B2bFlowService) {
    this.allSources = [];
    this.allTargets = [];
    this.allConstants = [];
    this.pathList = [];
    this.reCreatePaths = new EventEmitter();
    this.clearMappings = new EventEmitter();
    this.close = new EventEmitter();
  }

  ngOnInit(): void {
    if (_.isEmpty(this.data.dataStructure.outgoing)) {
      this.data.dataStructure.outgoing = null;
    }
    if (this.data.dataStructure.incoming && this.data.dataStructure.incoming.definition) {
      this.allSources = this.flatten(this.appService.cloneObject(this.data.dataStructure.incoming.definition));
    }
    if (this.data.dataStructure.outgoing && this.data.dataStructure.outgoing.definition) {
      this.allTargets = this.flatten(this.appService.cloneObject(this.data.dataStructure.outgoing.definition));
    }
    let temp = this.appService.cloneObject(this.flowData.constants);
    temp.map((item) => {
      delete item._id;
      if (item.key == 'true') {
        item.key = '_self';
      }
      item.type = item.dataType;
      item._id = `CONSTANTS.${item.key}`;
      item.dataPath = 'CONSTANTS.' + item.key;
      item.dataPathSegs = ['CONSTANTS', item.key];
      item.name = item.key;
      item.isConstant = true;
      item.properties = {
        dataPath: item.dataPath,
        dataPathSegs: item.dataPathSegs,
        name: item.key
      };
      item.depth = 0;
      this.allConstants.push(item);
    });
    if (this.data.mappings && this.data.mappings.length > 0) {
      this.tempMappings = this.appService.cloneObject(this.data.mappings);
      this.allTargets.forEach((item: any) => {
        let temp = this.tempMappings.find((e: any) => e.target.dataPath == item.dataPath);
        if (temp && temp.source && temp.source.length > 0) {
          item.source = (temp.source || []).map((source: any) => {
            let t = this.allSources.find((src: any) => src._id == source._id);
            if (!t) {
              t = this.allConstants.find((src: any) => src._id == source._id);
            }
            return t;
          }).filter(e => e);
        }
        if (temp && temp.formula) {
          item.formula = temp.formula;
        }
        if (temp && temp.formulaConfig) {
          item.formulaConfig = temp.formulaConfig;
        }
      });
    }
    this.reCreatePaths.pipe(debounceTime(200)).subscribe((data: any) => {
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
    this.clearMappings.subscribe(() => {
      this.allTargets.forEach((target: any) => {
        if (target.source && target.source.length > 0) {
          target.source.splice(0);
        }
      });
    });
  }

  openMapper() {
    this.showConverterWindow = true;
    this.pathList = [];
    this.reCreatePaths.emit(null);
  }

  done() {
    let mappings = this.allTargets.map(item => this.convertToMapping(item));
    this.data.mappings = mappings;
    if (!environment.production) {
      console.log(mappings);
    }
    this.close.emit(false);
    this.showConverterWindow = false;
  }

  cancel() {
    this.close.emit(false);
    this.showConverterWindow = false;
  }

  convertToMapping(item: any) {
    const temp: any = {};
    temp.target = {
      _id: item._id,
      type: item.type,
      dataPath: item.dataPath,
      dataPathSegs: item.properties.dataPathSegs,
      isConstant: item.isConstant
    };
    temp.source = (item.source || []).map((s) => {
      let temp: any = {};
      temp._id = s._id;
      temp.type = s.type;
      temp.dataPath = s.dataPath;
      temp.nodeId = s.nodeId;
      temp.isConstant = s.isConstant;
      temp.dataPathSegs = s.properties.dataPathSegs;
      return temp;
    });
    temp.formula = item.formula;
    temp.formulaConfig = item.formulaConfig;
    return temp;
  }

  renderPaths(source: any, target: any) {
    const sourceIdSegs = source._id.split('.');
    const targetIdSegs = target._id.split('.');
    let sourceId = sourceIdSegs.join('.');
    let targetId = targetIdSegs.join('.');
    const sourceNodeId = source.nodeId;
    const mappingPaths: HTMLElement = document.querySelectorAll('.mapping-paths')[0] as HTMLElement;
    let sourceEle: HTMLElement = document.querySelectorAll(`.source-list [data-id='${sourceId}']`)[0] as HTMLElement;
    let targetEle: HTMLElement = document.querySelectorAll(`.target-field-list [data-id='${targetId}']`)[0] as HTMLElement;
    while (targetId && !targetEle) {
      targetIdSegs.pop();
      targetId = targetIdSegs.join('.');
      if (targetId.endsWith('[#]')) {
        targetId = targetId.replace('[#]', '');
      }
      targetEle = document.querySelectorAll(`.target-field-list [data-id='${targetId}']`)[0] as HTMLElement;
    }

    while (sourceId && !sourceEle) {
      sourceIdSegs.pop();
      sourceId = sourceIdSegs.join('.');
      if (sourceId.endsWith('[#]')) {
        sourceId = sourceId.replace('[#]', '');
      }
      sourceEle = document.querySelectorAll(`.source-list [data-id='${sourceId}']`)[0] as HTMLElement;
    }

    const nodeEle: HTMLElement = document.querySelectorAll(`.source-list [data-id='${sourceNodeId}']`)[0] as HTMLElement;
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
        x: 0,
        y: tempRect.top - pathRect.top + 10
      };
      const targetCoordinates = {
        x: pathRect.width,
        y: targetRect.top - pathRect.top + 10
      };
      let path = `M ${sourceCoordinates.x} ${sourceCoordinates.y} L ${targetCoordinates.x} ${targetCoordinates.y};`
      this.pathList.push({ path, source: source._id, target: target._id });
    }
  }

  flatten(definition: Array<any>, parentDef?: any) {
    let list = [];
    try {
      if (definition && definition.length > 0) {
        definition.forEach((def, i) => {
          delete def._id;
          if (def.key == 'true') {
            def.key = '_self';
          }
          def._id = `${def.properties.dataPath}`;
          def.dataPath = def.properties.dataPath;
          def.dataPathSegs = def.properties.dataPathSegs;
          def.name = def.properties.name;
          def.depth = parentDef ? parentDef.depth + 1 : 0;
          list.push(def);
          if (def.type == 'Array') {
            if (def.definition[0].type == 'Object') {
              list = list.concat(this.flatten(def.definition[0].definition, def));
            }
          } else if (def.type == 'Object') {
            list = list.concat(this.flatten(def.definition, def));
          }
        });
      };
    } catch (err) {
      console.log(err);
    }
    return list;
  }

  onDragStart(event: DragEvent, def: any) {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('text', def.dataPath);
    this.dragItem = def;
  }

  onDragEnter(event: DragEvent, def: any) {
    if (!def.disabled) {
      def.over = true;
    }
  }

  onDragOver(event: DragEvent, def: any) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent, def: any) {
    def.over = false;
  }

  onDrop(event: DragEvent, def: any) {
    def.over = false;
    event.dataTransfer.dropEffect = 'copy';
    if (!this.dragItem) {
      return;
    }
    if (def.disabled) {
      return;
    }

    if (def.type == 'Array') {
      let allTargets = this.allTargets.filter(e => e.dataPath.startsWith(def.dataPath) && e.dataPath != def.dataPath);
      if (allTargets && allTargets.length > 0) {
        allTargets.forEach(e => {
          e.disabled = true;
        });
      }
    } else if (def.dataPath.indexOf('[#]') > -1) {
      let path = def.dataPath.split('[#].')[0];
      let temp = this.allTargets.find(e => e.dataPath == path);
      if (temp) {
        temp.disabled = true;
      }
    }
    if (!def.source) {
      def.source = [];
    }
    if (this.dragItem) {
      def.source.push(this.dragItem);
      this.reCreatePaths.emit();
    }
    this.dragItem = null;
  }

  isMapped(def: any) {
    if (def.source && def.source.length > 0) {
      return true;
    }
    return false;
  }

  isSourceMapped(def: any) {
    let flag = false;
    flag = this.allTargets.find(ele => {
      return (ele.source || []).find(src => {
        return src._id == def._id;
      });
    });
    return flag;
  }

  removeSource(def: any, source: any) {
    let index = def.source.findIndex(src => src._id == source._id);
    if (index > -1) {
      def.source.splice(index, 1);
      this.reCreatePaths.emit();
      this.allTargets.forEach(item => {
        if (item.dataPath.startsWith(def.dataPath)) {
          item.disabled = false;
        }
        let targetPath = def.dataPath.split('[#]')[0];
        let matchingTarget = this.allTargets.find(e => e.dataPath == targetPath);
        if (matchingTarget) {
          if (matchingTarget.definition && matchingTarget.definition[0] && matchingTarget.definition[0].definition.every(e => !e.source || e.source.length == 0)) {
            matchingTarget.disabled = false;
          }
        }
      });
    }
  }

  isValidFunction(def: any) {
    if (def.source && def.source.length > 1 && !def.formula && !def.formulaConfig) {
      return false;
    }
    return true;
  }

  doFuzzyMapping() {
    const options = {
      includeScore: true,
      isCaseSensitive: false,
      useExtendedSearch: true,
      minMatchCharLength: 4,
      keys: ['dataPath']
    };
    this.allTargets.forEach((def: any) => {
      let temp = this.allSources.find(e => (e.dataPath == def.dataPath) || (_.toLower(_.camelCase(e.dataPath)) == _.toLower(_.camelCase(def.dataPath))));
      if (!def.source) {
        def.source = [];
      }
      if (temp && def.type != 'Array' && temp.dataPath.indexOf('[#]') == -1 && def.source.length == 0) {
        def.source.push(temp);
      }
    });
    this.allTargets.forEach((def: any) => {
      if (def.type !== 'Array' && def.dataPath.indexOf('[#]') == -1) {
        const fuse = new Fuse(this.allSources.filter(e => e.type != 'Object'), options);
        let result = fuse.search(def.dataPath).filter(e => e.score < 0.3);
        if (!def.source) {
          def.source = [];
        }
        if (def.source.length == 0) {
          result = result.sort((a, b) => a.score - b.score);
          if (result.length > 0) {
            def.source.push(result[0].item);
          }
        }
      }
    });
    setTimeout(() => {
      this.reCreatePaths.emit();
    }, 200);
  }

  doClearMapping() {
    this.clearMappings.emit(true);
    setTimeout(() => {
      this.reCreatePaths.emit();
    }, 200);
  }

  get sourceNode() {
    return this.data.options.source;
  }

  set sourceNode(val: any) {
    this.data.options.source = {
      _id: val._id,
      name: val.name,
    };
    this.sourceFormat = this.appService.cloneObject(val.dataStructure.outgoing);
  }

  get sourceFormat() {
    return this.data.dataStructure.incoming;
  }

  set sourceFormat(val: any) {
    this.data.dataStructure.incoming = val;
    if (this.data.dataStructure.incoming && this.data.dataStructure.incoming.definition) {
      this.allSources = this.flatten(this.appService.cloneObject(this.data.dataStructure.incoming.definition));
    }
  }

  get targetFormat() {
    return this.data.dataStructure.outgoing;
  }

  set targetFormat(val: any) {
    this.data.dataStructure.outgoing = val;
    if (this.data.dataStructure.outgoing && this.data.dataStructure.outgoing.definition) {
      this.allTargets = this.flatten(this.appService.cloneObject(this.data.dataStructure.outgoing.definition));
    }
  }
}
