import { Component, OnInit, AfterContentChecked, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Observable, of, OperatorFunction } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService } from 'src/app/utils/services/common.service';

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
  noInitalDefinition: boolean;
  serviceList: Array<any>;
  searching: boolean;
  searchFailed: boolean;
  constructor(private appService: AppService,
    private commonService: CommonService) {
    this.pathChange = new EventEmitter();
    this.isInvalid = new EventEmitter();
    this.field = new EventEmitter();
    this.fields = [];
    this.level = 0;
  }

  ngOnInit() {
    if (!this.definition) {
      this.noInitalDefinition = true;
    }
    if (this.path && this.path.trim()) {
      const segments = this.path.split('.');
      let definition = this.definition;
      let stopPath = false;
      segments.forEach(key => {
        if (definition) {
          let tempDef = definition.find(d => d.key === key || d.key === key + '.value');
          if (!!tempDef) {
            tempDef = this.appService.cloneObject(tempDef);
            this.fields.push(tempDef);
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
          }
        }
      });
    }
  }

  ngAfterContentChecked() {
    if (this.canAddMore) {
      this.isInvalid.emit(true);
    } else {
      this.field.emit(this.fields[this.fields.length - 1]);
      this.isInvalid.emit(false);
    }
  }

  formatter = (data: any) => data.name;

  searchDataService: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this.commonService.get('serviceManager', `/${this.commonService.app._id}/service`, { filter: { name: '/' + term + '/', status: "Active" } }).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ),
      tap(() => this.searching = false)
    )

  selectField(field: any) {
    this.fields.splice(this.level, this.fields.length - this.level);
    this.fields.push(field);
    this.showkeys = false;
    this.searchTerm = null;
    this.makePath();
    setTimeout(() => {
      const ele = document.querySelector<HTMLElement>('.rule-wrapper');
      ele.scrollLeft = ele.scrollWidth;
    }, 100);
  }

  removeField(index: number) {
    this.fields.splice(index, this.fields.length - index);
    this.showkeys = false;
    this.makePath();
  }

  setField(event: KeyboardEvent) {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    if (target.value && target.value.trim()) {
      this.fields.push({
        _manual: true,
        type: 'String',
        key: target.value,
        properties: {
          name: target.value
        }
      });
      this.makePath();
      setTimeout(() => {
        const ele = document.querySelector<HTMLElement>('.rule-wrapper');
        ele.scrollLeft = ele.scrollWidth;
      }, 100);
    }
  }

  changeField(event: any, def: any, index: number) {
    if (def._manual) {
      this.fields.splice(index, 1);
    } else {
      this.level = index;
      this.openKeysDropdown(event);
    }
  }

  openKeysDropdown(event: any) {
    if (!this.edit.status) {
      return;
    }
    this.showkeys = true;
    this.clientX = event.layerX;

  }

  makePath() {
    const keys = [];
    this.fields.forEach(field => {
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
    this.pathChange.emit(path);
  }

  get enableManual() {
    if (this.fields.length === 0) {
      return false;
    }
    const field = this.fields[this.fields.length - 1];
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
    if (!this.definition) {
      return false;
    }
    if (this.fields.length === 0) {
      return true;
    }
    const field = this.fields[this.fields.length - 1];
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
        || field.type === 'id') {
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
    if (this.fields.length === 0) {
      return {};
    }
    return {
      left: this.clientX + 'px'
    };
  }

  get definitionList() {
    const temp = [];
    if (this.level && this.level > 0) {
      let field = this.fields[this.level - 1].definition;
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
      if (this.definition) {
        this.definition.forEach(obj => {
          temp.push(obj);
        });
      }
    }
    return temp;
  }

}
