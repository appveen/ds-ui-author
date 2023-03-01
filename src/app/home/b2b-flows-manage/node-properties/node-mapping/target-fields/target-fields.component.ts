import { Component, Input, OnInit } from '@angular/core';
import * as uuid from 'uuid/v1';

import { environment } from 'src/environments/environment';
import { MappingService } from '../mapping.service';
import { B2bFlowService } from '../../../b2b-flow.service';

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
  pathList: Array<any>;
  constructor(private mappingService: MappingService,
    private flowService: B2bFlowService) {
    this.edit = { status: false };
    this.pathList = [];
    this.allSources = [];
  }

  ngOnInit(): void {
    if (!environment.production) {
      console.log(this.definition);
    }
    if (!this.definition._id) {
      this.definition._id = uuid();
    }
    if (!this.definition.coordinates) {
      this.definition.coordinates = {};
    }
    this.definition.coordinates.y = (this.index + 1) * 50;
    this.renderPaths();
    this.mappingService.reCreatePaths.subscribe((data: any) => {
      console.log(data);
      // if (data.target == this.definition._id) {
      //   let index = this.allSources.findIndex(e => e._id == data.source);
      //   this.definition.source.push(this.allSources[index]);
      //   this.renderPaths();
      // }
      this.renderPaths();
    });
  }

  selectField() {
    this.mappingService.selectedTargetNode = this.definition;
    this.mappingService.tryMapping();
  }

  renderPaths() {
    this.pathList = [];
    if (this.definition && this.definition.source && this.definition.source.length > 0) {
      this.definition.source.forEach((src) => {
        let index = this.allSources.findIndex(e => e.properties.dataPath == src.properties.dataPath);
        let y = (index + 1) * 50;
        const path = this.flowService.generateLinkPath(336, y+18, 794, this.definition.coordinates.y+18, 1.5);
        this.pathList.push({
          path
        });
      });
    }
  }

  get style() {
    return {
      transform: `translate(800px, ${this.definition.coordinates.y}px)`,
    }
  }

  get selectedNode() {
    if (this.mappingService.selectedTargetNode) {
      return this.mappingService.selectedTargetNode;
    }
    return null;
  }
}
