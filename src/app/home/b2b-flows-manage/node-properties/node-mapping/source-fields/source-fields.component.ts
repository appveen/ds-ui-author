import { Component, Input, OnInit } from '@angular/core';
import * as uuid from 'uuid/v4';

import { MappingService } from '../mapping.service';

@Component({
  selector: 'odp-source-fields',
  templateUrl: './source-fields.component.html',
  styleUrls: ['./source-fields.component.scss']
})
export class SourceFieldsComponent implements OnInit {

  @Input() edit: any;
  @Input() node: any;
  @Input() index: number;
  @Input() definition: any;
  toggle: any;
  constructor(private mappingService: MappingService) {
    this.edit = { status: false };
    this.toggle = {};
    this.toggle['object'] = true;
  }

  ngOnInit(): void {
    if (!this.definition._id) {
      this.definition._id = uuid();
    }
  }

  selectField(event: MouseEvent) {
    this.mappingService.selectedSourceNode = {
      definition: this.definition,
      node: this.node
    };
    this.mappingService.tryMapping();
  }

  reCreatePaths() {
    this.mappingService.reCreatePaths.emit();
  }

  get showToggle() {
    if (this.definition.type == 'Object') {
      return true;
    }
    if (this.definition.type == 'Array'
      && this.definition.definition
      && this.definition.definition[0]
      && this.definition.definition[0].type == 'Object') {
      return true;
    }
    return false;
  }

  get isSelected() {
    if (this.mappingService.selectedSourceNode
      && this.mappingService.selectedSourceNode.definition
      && this.mappingService.selectedSourceNode.definition._id == this.definition._id) {
      return true;
    }
    return false;
  }
}
