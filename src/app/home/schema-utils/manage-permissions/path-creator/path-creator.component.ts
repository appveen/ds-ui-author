import { Component, OnInit, AfterContentChecked, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-path-creator',
  templateUrl: './path-creator.component.html',
  styleUrls: ['./path-creator.component.scss']
})
export class PathCreatorComponent implements OnInit, AfterContentChecked {

  @ViewChild('selectorDropdown', { static: false }) selectorDropdown: HTMLElement;
  @Input() edit: {
    id: string;
    status: boolean;
  };
  @Input() definition: any;
  @Input() path: string;
  @Output() pathChange: EventEmitter<string>;
  @Output() isInvalid: EventEmitter<boolean>;
  @Output() field: EventEmitter<boolean>;
  fields: Array<any>;
  showkeys: boolean;
  clientX: number;
  searchTerm: string;
  level: number;
  constructor(private appService: AppService) {
    const self = this;
    self.pathChange = new EventEmitter();
    self.isInvalid = new EventEmitter();
    self.field = new EventEmitter();
    self.fields = [];
    self.level = 0;
  }

  ngOnInit() {
    const self = this;
    if (self.path && self.path.trim()) {
      const segments = self.path.split('.');
      let definition = self.definition;
      let stopPath = false;
      segments.forEach(key => {
        if (definition) {
          let tempDef = definition.find(d => d.key === key || d.key === key + '.value');
          if (!!tempDef) {
            tempDef = self.appService.cloneObject(tempDef);
            self.fields.push(tempDef);
            if (tempDef.type === 'User'
              || tempDef.type === 'Geojson'
              || tempDef.type === 'Relation'
              || tempDef.type === 'File') {
              stopPath = true;
            } else if (tempDef.type === 'Array') {
              if (tempDef.definition.find(d => d.key === '_self')?.type !== 'Object') {
                stopPath = true;
              }
            }
            if (tempDef.type === 'Array') {
              if (tempDef.definition.find(d => d.key === '_self')?.type === 'Object') {
                definition = tempDef.definition.find(d => d.key === '_self')?.definition || {};
              }
            } else {
              definition = tempDef.definition || [];
            }
          } else {

          }
        }
      });
    }
  }

  ngAfterContentChecked() {
    const self = this;
    if (self.canAddMore) {
      self.isInvalid.emit(true);
    } else {
      self.field.emit(self.fields[self.fields.length - 1]);
      self.isInvalid.emit(false);
    }
  }

  selectField(field: any) {
    const self = this;
    self.fields.splice(self.level, self.fields.length - self.level);
    self.fields.push(field);
    self.showkeys = false;
    self.searchTerm = null;
    self.makePath();
    setTimeout(() => {
      const ele = document.querySelector<HTMLElement>('.rule-wrapper');
      ele.scrollLeft = ele.scrollWidth;
    }, 100);
  }

  removeField(index: number) {
    const self = this;
    self.fields.splice(index, self.fields.length - index);
    self.showkeys = false;
    self.makePath();
  }

  setField(event: KeyboardEvent) {
    const self = this;
    const target: HTMLInputElement = event.target as HTMLInputElement;
    if (target.value && target.value.trim()) {
      self.fields.push({
        _manual: true,
        type: 'String',
        key: target.value,
        properties: {
          name: target.value
        }
      });
      self.makePath();
      setTimeout(() => {
        const ele = document.querySelector<HTMLElement>('.rule-wrapper');
        ele.scrollLeft = ele.scrollWidth;
      }, 100);
    }
  }

  changeField(event: any, def: any, index: number) {
    const self = this;
    if (def._manual) {
      self.fields.splice(index, 1);
    } else {
      self.level = index;
      self.openKeysDropdown(event);
    }
  }

  openKeysDropdown(event: any) {
    const self = this;
    if (!self.edit.status) {
      return;
    }
    self.showkeys = true;
    self.clientX = event.layerX;

  }

  makePath() {
    const self = this;
    const keys = [];
    self.fields.forEach(field => {
      if (field.type === 'User') {
        keys.push(field.key + '._id');
      } else if (field.type === 'Relation') {
        keys.push(field.key + '._id');
      } else if (field.type === 'Geojson') {
        keys.push(field.key + '.formattedAddress');
      } else if (field.type === 'File') {
        keys.push(field.key + '.metadata.filename');
      } else if (field.type === 'Date') {
        keys.push(field.key + '.utc');
      } else {
        keys.push(field.key);
      }
    });
    const path = keys.join('.');
    self.pathChange.emit(path);
  }

  get enableManual() {
    const self = this;
    if (self.fields.length === 0) {
      return false;
    }
    const field = self.fields[self.fields.length - 1];
    if (field) {
      if (field.type === 'Object' && (!field.definition || !field.definition.length)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  get canAddMore() {
    const self = this;
    if (self.fields.length === 0) {
      return true;
    }
    const field = self.fields[self.fields.length - 1];
    if (field) {
      if (!field.type
        || field.type === 'String'
        || field.type === 'Number'
        || field.type === 'Date'
        || field.type === 'Boolean'
        || field.type === 'File'
        || field.type === 'Geojson'
        || field.type === 'Relation'
        || field.type === 'User'
        || field.type === 'id')
      {
        return false;
      } else if (field.type === 'Array') {
        if (field.definition.find(d => d.key === '_self')?.type === 'Object') {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  get dropdownPos() {
    const self = this;
    if (self.fields.length === 0) {
      return {};
    }
    return {
      left: self.clientX + 'px'
    };
  }

  get definitionList() {
    const self = this;
    const temp = [];
    if (self.level && self.level > 0) {
      let field = self.fields[self.level - 1].definition;
      if (field) {
        if (field.find(d => d.key === '_self')?.definition) {
          field = field.find(d => d.key === '_self').definition;
        }
        field.forEach(obj => {
          temp.push(obj);
        });
      }
      return temp;
    } else {
      if (self.definition) {
        self.definition.forEach(obj => {
          temp.push(obj);
        });
      }
    }
    return temp;
  }

}
