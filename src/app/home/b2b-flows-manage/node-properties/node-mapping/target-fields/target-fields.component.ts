import { Component, Input, OnInit } from '@angular/core';
import Fuse from 'fuse.js';
import * as uuid from 'uuid/v1';
import * as _ from 'lodash';

import { MappingService } from '../mapping.service';
import { B2bFlowService } from '../../../b2b-flow.service';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: '[odp-target-fields]',
  templateUrl: './target-fields.component.html',
  styleUrls: ['./target-fields.component.scss']
})
export class TargetFieldsComponent implements OnInit {

  @Input() edit: any;
  @Input() index: number;
  @Input() definition: any;
  @Input() allSources: Array<any>;
  @Input() allTargets: Array<any>;
  pathList: Array<any>;
  selectedPathIndex: any;
  colors: Array<string>;
  constructor(private mappingService: MappingService,
    private flowService: B2bFlowService,
    private commonService: CommonService) {
    this.edit = { status: false };
    this.pathList = [];
    this.allSources = [];
    this.allTargets = [];
    this.colors = ['#F06292', '#BA68C8', '#7986CB', '#64B5F6', '#4DD0E1', '#4DB6AC', '#81C784', '#AED581', '#DCE775', '#FFD54F', '#FF8A65', '#A1887F'];
  }

  ngOnInit(): void {
    if (!this.definition._id) {
      this.definition._id = uuid();
    }
    if (!this.definition.coordinates) {
      this.definition.coordinates = {};
    }
    this.definition.coordinates.y = (this.index + 1) * 55;
    this.renderPaths();
    this.mappingService.deSelectPath.subscribe(() => {
      this.selectedPathIndex = null;
    });
    this.mappingService.reCreatePaths.subscribe((data: any) => {
      this.renderPaths();
    });
    this.mappingService.fuzzyMapping.subscribe(() => {
      if (this.definition.type != 'Object') {
        const options = {
          includeScore: true,
          isCaseSensitive: true,
          useExtendedSearch: true,
          minMatchCharLength: 5,
          keys: ['properties.dataPath']
        }
        const fuse = new Fuse(this.allSources.filter(e => e.type != 'Object'), options);
        let result = fuse.search(this.definition.properties.dataPath).filter(e => e.score < 0.4);
        if (!this.definition.source) {
          this.definition.source = [];
        }
        if (this.definition.source.length == 0) {
          result = result.sort((a, b) => a.score - b.score);
          if (result.length > 0) {
            this.definition.source.push(result[0].item);
          }
          // result.forEach(e => {
          //   this.definition.source.push(e.item);
          // });
          this.renderPaths();
        }
      }
    });
    this.mappingService.clearMappings.subscribe(() => {
      if (this.definition.source && this.definition.source.length > 0) {
        this.definition.source.splice(0);
      }
      this.renderPaths();
    });
  }

  selectField() {
    this.mappingService.selectedTargetNode = this.definition;
    this.mappingService.tryMapping();
  }

  selectPath(index: number) {
    this.mappingService.deSelectPath.emit();
    setTimeout(() => {
      this.selectedPathIndex = index;
    }, 200);
  }

  renderPaths() {
    this.pathList = [];
    if (this.definition && this.definition.source && this.definition.source.length > 0) {
      this.definition.source.forEach((src) => {
        let index = this.allSources.findIndex(e => e.properties.dataPath == src.properties.dataPath);
        let source = this.allSources[index];
        let x1 = 336 + (source.depth * 20);
        let y1 = ((index + 1) * 55) + 24;
        let x2 = 894 + (this.definition.depth * 20);
        let y2 = this.definition.coordinates.y + 24;
        const path = this.flowService.generateLinkPath(x1, y1, x2, y2, 1.5);
        this.pathList.push({
          color: _.sample(this.colors),
          src: source,
          path,
          cx: ((x2 - x1) / 2) + x1,
          cy: ((y2 - y1) / 2) + y1
        });
      });
    }
  }

  deletePath(path: any) {
    this.pathList.splice(this.selectedPathIndex, 1);
    this.mappingService.deSelectPath.emit();
    let index = this.definition.source.findIndex(e => e._id == path.src._id);
    if (index > -1) {
      this.definition.source.splice(index, 1);
    }
  }

  get style() {
    let x = (this.definition.depth * 20) + 900;
    return {
      transform: `translate(${x}px, ${this.definition.coordinates.y}px)`,
    }
  }

  get selectedNode() {
    if (this.mappingService.selectedTargetNode) {
      return this.mappingService.selectedTargetNode;
    }
    return null;
  }
}
