import { Component, Input, OnInit } from '@angular/core';
import Fuse from 'fuse.js';
import * as uuid from 'uuid/v4';
import * as _ from 'lodash';

import { MappingService } from '../mapping.service';
import { B2bFlowService } from '../../../b2b-flow.service';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-target-fields',
  templateUrl: './target-fields.component.html',
  styleUrls: ['./target-fields.component.scss']
})
export class TargetFieldsComponent implements OnInit {

  @Input() edit: any;
  @Input() index: number;
  @Input() definition: any;
  @Input() nodeList: Array<any>;
  @Input() allSources: Array<any>;
  pathList: Array<any>;
  selectedPathIndex: any;
  colors: Array<string>;
  toggleFormulaEditor: boolean;
  constructor(private mappingService: MappingService,
    private flowService: B2bFlowService,
    private commonService: CommonService) {
    this.edit = { status: false };
    this.pathList = [];
    this.nodeList = [];
    this.colors = ['#F06292', '#BA68C8', '#7986CB', '#64B5F6', '#4DD0E1', '#4DB6AC', '#81C784', '#AED581', '#DCE775', '#FFD54F', '#FF8A65', '#A1887F'];
    this.allSources = [];
  }

  ngOnInit(): void {
    if (!this.definition._id) {
      this.definition._id = uuid();
    }
    this.nodeList.forEach((item: any) => {

    });
    this.mappingService.fuzzyMapping.subscribe(() => {
      if (this.definition.type != 'Object') {
        const options = {
          includeScore: true,
          isCaseSensitive: true,
          useExtendedSearch: true,
          minMatchCharLength: 5,
          keys: ['dataPath']
        }
        const fuse = new Fuse(this.allSources.filter(e => e.type != 'Object'), options);
        let result = fuse.search(this.definition.dataPath).filter(e => e.score < 0.3);
        if (!this.definition.source) {
          this.definition.source = [];
        }
        if (this.definition.source.length == 0) {
          result = result.sort((a, b) => a.score - b.score);
          if (result.length > 0) {
            this.definition.source.push(result[0].item);
            this.definition.formula = `VAR(${result[0].item._id})`;
            // this.mappingService.reCreatePaths.emit();
          }
        }
      }
    });
    this.mappingService.clearMappings.subscribe(() => {
      if (this.definition.source && this.definition.source.length > 0) {
        this.definition.source.splice(0);
      }
    });
  }

  selectField(event: MouseEvent) {
    this.mappingService.selectedTargetNode = {
      definition: this.definition
    };
    this.mappingService.tryMapping();
  }

  showFormulaEditor() {
    this.toggleFormulaEditor = true;
  }

  get isSelected() {
    if (this.mappingService.selectedTargetNode
      && this.mappingService.selectedTargetNode.definition
      && this.mappingService.selectedTargetNode.definition._id == this.definition._id) {
      return true;
    }
    return false;
  }
}
