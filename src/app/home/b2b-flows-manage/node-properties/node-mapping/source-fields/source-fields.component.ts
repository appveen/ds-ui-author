import { Component, Input, OnInit } from '@angular/core';
import * as uuid from 'uuid/v1';

import { environment } from 'src/environments/environment';
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
  }

  selectField() {
    this.mappingService.selectedSourceNode = this.definition;
    this.mappingService.tryMapping();
  }

  get style() {
    return {
      transform: `translate(30px, ${this.definition.coordinates.y}px)`,
    }
  }

  get selectedNode() {
    if (this.mappingService.selectedSourceNode) {
      return this.mappingService.selectedSourceNode;
    }
    return null;
  }
}
