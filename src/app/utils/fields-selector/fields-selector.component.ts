import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'odp-fields-selector',
  templateUrl: './fields-selector.component.html',
  styleUrls: ['./fields-selector.component.scss']
})
export class FieldsSelectorComponent implements OnInit {

  @Input() definitionList: Array<any>;
  @Output() definitionListChange: EventEmitter<Array<any>>;
  @Output() selectedField: EventEmitter<any>;
  @Input() definition: any;
  @Input() safeType: string;
  constructor() {
    this.definitionList = [];
    this.definitionListChange = new EventEmitter();
    this.selectedField = new EventEmitter();
  }

  ngOnInit(): void {
    if (typeof this.definition === 'string') {
      this.definition = JSON.parse(this.definition);
    }
    if (this.definition) {
      // this.definitionList = this.parseDefinition(this.definition);
      this.definitionList = this.definition;
    }
  }

  parseDefinition(definition, parentDef?: any) {
    const arr = [];
    if (definition) {
      Object.keys(definition).forEach(key => {
        const def = definition[key];
        def.key = key;
        if (parentDef) {
          def.path = parentDef.path + '.' + key;
        } else {
          if (def.type === 'Array') {
            def.path = key + '[#]';
          } else {
            def.path = key;
          }
        }
        if (def.type === 'Object' || def.type === 'Array') {
          def.definition = this.parseDefinition(def.definition, def);
        }
        arr.push(def);
      });
    }
    return arr;
  }

  selectField(def) {
    if (def.type !== 'Object') {
      this.selectedField.emit(def);
    }
  }
}
