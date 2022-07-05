import { Component, OnInit, AfterContentChecked, Input, Output, EventEmitter } from '@angular/core';
import { Rule } from '../manage-permissions.component';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { SchemaBuilderService } from '../../schema-builder.service';
import * as momentTz from 'moment-timezone';

@Component({
  selector: 'odp-dynamic-condition',
  templateUrl: './dynamic-condition.component.html',
  styleUrls: ['./dynamic-condition.component.scss']
})
export class DynamicConditionComponent implements OnInit, AfterContentChecked {

  @Input() edit: {
    id?: string;
    status?: boolean;
  };
  @Input() definition: any;
  @Input() index: number;
  @Input() rules: Array<Rule>;
  @Output() rulesChange: EventEmitter<Array<Rule>>;
  @Output() isInvalid: EventEmitter<boolean>;
  rule: Rule;
  conditions: Array<Condition>;
  optionsDropDown: boolean;
  pathInvalid: any;
  apiCallStack: any;
  userAttributes: Array<any>;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private schemaService: SchemaBuilderService) {
    this.rulesChange = new EventEmitter();
    this.isInvalid = new EventEmitter();
    this.conditions = [];
    this.optionsDropDown = false;
    this.edit = {};
    this.pathInvalid = {};
    this.apiCallStack = {};
    this.userAttributes = [];
  }

  ngOnInit() {
    if (this.rules) {
      this.rule = this.rules[this.index];
    }
    this.getUserAttributes();
    this.addCondition('$and');
    if (this.rule.conditions) {
      this.conditions = this.rule.conditions;
    }
  }

  ngAfterContentChecked() {
    let count = 0;
    if (Object.keys(this.pathInvalid).length > 0) {
      Object.keys(this.pathInvalid).forEach(key => {
        if (this.pathInvalid[key]) {
          count++;
        }
      });
      if (count > 0) {
        this.isInvalid.emit(true);
      } else {
        this.isInvalid.emit(false);
      }
    } else {
      this.isInvalid.emit(true);
    }
  }

  getUserAttributes() {
    this.apiCallStack.getUserAttributes = true;
    this.commonService.get('user', `/${this.commonService.app._id}/user/utils/distinctAttributes`).subscribe(res => {
      this.apiCallStack.getUserAttributes = false;
      this.userAttributes = res.attributes.map((usrAttr) => { usrAttr.key = usrAttr.key + '.value'; return usrAttr; });
    }, err => {
      this.apiCallStack.getUserAttributes = false;
      this.userAttributes = [];
    });
  }

  addCondition(type: string) {
    this.optionsDropDown = false;
    this.conditions.push({
      type,
      condition: '$eq',
      valueType: 'value'
    });
  }

  updatePathValidators(index) {
    const pathInvalidKeys = Object.keys(this.pathInvalid);

    pathInvalidKeys.forEach(pathKey => {
      if (index === +pathKey.split('_')[0]) {
        delete this.pathInvalid[pathKey];
      }
    });
  }

  removeCondition(index) {
    this.updatePathValidators(index);
    this.conditions.splice(index, 1);
    this.constructFilter();
  }

  removeThis() {
    this.pathInvalid = {};
    this.isInvalid.emit(false);
    this.rules.splice(this.index, 1);
  }


  dateFormatter(dateStr) {
    if (!!dateStr) {
      const date = new Date(dateStr);
      return momentTz(date.toISOString()).toISOString();
    }
    return;
  }

  constructFilter() {
    if (this.conditions) {
      this.rulesChange.emit(this.rules);
    }
  }

  getValueDefinition(index: number) {
    if (this.conditions[index].valueType == 'user') {
      const def: any = this.schemaService.createDefiniition({
        basicDetails: {
          name: '',
          alternateEmail: '',
          phone: ''
        },
        _id: '',
        username: '',
        attributes: {}
      });
      const attrIndex = def.findIndex(data => data.key == 'attributes')

      def[attrIndex].definition = this.userAttributes;
      return def;
    }
    return null;
  }

  convertToObject(defList: Array<any>) {
    const temp = {};
    if (!defList) {
      return temp;
    }
    defList.forEach(def => {
      const newKey = def.key + '.value';
      temp[newKey] = this.appService.cloneObject(def);
      delete temp[newKey].key;
      temp[newKey].type = this.appService.toCapitalize(temp[newKey].type);
      if (temp[newKey]?.definition && temp[newKey]?.definition.length > 0) {
        temp[newKey].definition = this.convertToObject(temp[newKey].definition);
      }
    });
    return temp;
  }

  get loading() {
    if (Object.keys(this.apiCallStack).length > 0 && Object.values(this.apiCallStack).filter(e => e).length > 0) {
      return true;
    }
    return false;
  }
}

export interface Condition {
  type?: string;
  key?: string;
  condition?: string;
  valueType?: string;
  value?: any;
  dataService?: any;
}
