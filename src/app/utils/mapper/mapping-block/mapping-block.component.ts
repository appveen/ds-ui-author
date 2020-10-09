import { Component, OnInit, Input } from '@angular/core';

import { Mapping, Definition } from '../mapper.model';
import { MapperService } from '../mapper.service';

@Component({
  selector: 'odp-mapping-block',
  templateUrl: './mapping-block.component.html',
  styleUrls: ['./mapping-block.component.scss']
})
export class MappingBlockComponent implements OnInit {

  @Input() edit: any;
  @Input() index: number;
  @Input() mappings: Mapping[];
  mapping: Mapping;
  selectedMapping: Mapping;
  toggleFormulaBuilder: boolean;
  constructor(private mapperService: MapperService) {
    const self = this;
    self.edit = {
      status: false
    };
    self.mappings = [];
    self.mapping = Mapping.getInstance();
  }

  ngOnInit() {
    const self = this;
    self.mapping = self.mappings[self.index];
  }

  dropEvent(event, droppedDef: Definition, mapping: Mapping) {
    const self = this;
    if (event.target.classList.contains('field-placeholder')) {
      event.target.classList.remove('over');
    }
    if (self.mapperService.selectedEle) {
      if (!droppedDef.valid) {
        droppedDef.patch(self.mapperService.selectedEle);
      } else {
        const temp = Definition.getInstance();
        temp.patch(self.mapperService.selectedEle);
        mapping.source.pop();
        mapping.source.push(temp);
      }
      self.mapperService.selectedEle = null;
    }
  }

  dragEnterEvent(event, mapping: Mapping) {
    if (event.target.classList.contains('field-placeholder') && !event.target.classList.contains('disabled')) {
      if (!event.target.classList.contains('mapped')) {
        event.target.classList.add('over');
      } else {
        mapping.source.push(Definition.getInstance());
      }
    }
  }

  dragLeaveEvent(event, mapping: Mapping) {
    if (event.target.classList.contains('field-placeholder') && !event.target.classList.contains('disabled')) {
      if (!event.target.classList.contains('mapped')) {
        event.target.classList.remove('over');
      } else {
        mapping.source.pop();
      }
    }
  }

  removeMapping(mapping: Mapping, index: number) {
    mapping.source.splice(index, 1);
    mapping.target.properties.operation = '';
    delete mapping.target.properties._args;
    if (mapping.source.length === 0) {
      mapping.source.push(Definition.getInstance());
    }
  }

  verticalLineClass(definition: Definition, depth: boolean, depthFirst: boolean, depthLast: boolean) {
    let style = [];

    if (definition.lastChild || definition.name === '_self') {
      style.push('h-50');
    } else {
      style = [];
      style.push('h-100');
    }
    if (!depth || (definition.name === '_self' && definition.lastChild && depthFirst && !depthLast)) {
      style.push('border-0');
    }
    if (definition.depth.length > 1 && depthFirst) {
      if (style.indexOf('h-50') > -1) {
        style.splice(style.indexOf('h-50'), 1);
      }
      style.push('h-100');
    }
    return style.join(' ');
  }

  openFormulaBuilder(mapping: Mapping) {
    const self = this;
    self.toggleFormulaBuilder = true;
    self.selectedMapping = mapping;
  }

  get targetDef() {
    const self = this;
    if (self.mapping && self.mapping.target) {
      return self.mapping.target;
    }
  }
}
