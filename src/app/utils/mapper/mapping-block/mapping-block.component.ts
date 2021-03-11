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
  @Input() sourceList: any[];
  mapping: Mapping;
  selectedMapping: Mapping;
  toggleFormulaBuilder: boolean;
  toggleFieldSelector: any;
  constructor(private mapperService: MapperService) {
    this.edit = {
      status: false
    };
    this.mappings = [];
    this.mapping = Mapping.getInstance();
    this.toggleFieldSelector = {};
  }

  ngOnInit() {
    this.mapping = this.mappings[this.index];
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
    this.toggleFormulaBuilder = true;
    this.selectedMapping = mapping;
  }

  onFieldSelect(def, mapping) {
    const temp = Definition.getInstance();
    temp.patch(def);
    mapping.source.unshift(temp);
    this.closeAllSelector();
  }

  closeAllSelector() {
    Object.keys(this.toggleFieldSelector).map(key => {
      this.toggleFieldSelector[key] = false;
    });
  }

  get targetDef() {
    if (this.mapping && this.mapping.target) {
      return this.mapping.target;
    }
  }
}
