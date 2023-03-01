import { Component, Input, OnInit } from '@angular/core';
import * as uuid from 'uuid/v1';

import { MappingService } from '../mapping.service';

@Component({
  selector: '[odp-source-fields]',
  templateUrl: './source-fields.component.html',
  styleUrls: ['./source-fields.component.scss']
})
export class SourceFieldsComponent implements OnInit {

  @Input() edit: any;
  @Input() index: number;
  @Input() definition: any;
  constructor(private mappingService: MappingService) {
    this.edit = { status: false };
  }

  ngOnInit(): void {
    if (!this.definition._id) {
      this.definition._id = uuid();
    }
    if (!this.definition.coordinates) {
      this.definition.coordinates = {};
    }
    this.definition.coordinates.y = (this.index + 1) * 55;
  }

  selectField() {
    this.mappingService.selectedSourceNode = this.definition;
    this.mappingService.tryMapping();
  }

  get style() {
    let x = (this.definition.depth * 20) + 30;
    return {
      transform: `translate(${x}px, ${this.definition.coordinates.y}px)`,
    }
  }

  get selectedNode() {
    if (this.mappingService.selectedSourceNode) {
      return this.mappingService.selectedSourceNode;
    }
    return null;
  }
}
