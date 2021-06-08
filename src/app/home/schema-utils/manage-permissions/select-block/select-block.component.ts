import { Component, OnInit, AfterContentChecked, Input, Output, EventEmitter } from '@angular/core';
import { Rule } from '../manage-permissions.component';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { SchemaBuilderService } from '../../schema-builder.service';

@Component({
  selector: 'odp-select-block',
  templateUrl: './select-block.component.html',
  styleUrls: ['./select-block.component.scss']
})
export class SelectBlockComponent implements OnInit, AfterContentChecked {

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
  dataService: any;
  prevDataService: any;
  searchList: Array<any>;
  showDataServiceList: boolean;
  conditions: Array<Condition>;
  optionsDropDown: boolean;
  rowDropDown: any;
  rowValueType: any;
  rowValueTypeDropDown: any;
  pathInvalid: any;
  apiCallStack: any;
  userAttributes: Array<any>;
  private conditionStack: Array<string>;
  private valueStack: Array<any>;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private schemaService: SchemaBuilderService) {
    const self = this;
    self.rulesChange = new EventEmitter();
    self.isInvalid = new EventEmitter();
    self.dataService = {};
    self.prevDataService = {};
    self.searchList = [];
    self.conditions = [];
    self.optionsDropDown = false;
    self.rowDropDown = {};
    self.rowValueType = {};
    self.rowValueTypeDropDown = {};
    self.conditionStack = [];
    self.valueStack = [];
    self.edit = {};
    self.pathInvalid = {};
    self.apiCallStack = {};
    self.userAttributes = [];
  }

  ngOnInit() {
    const self = this;
    if (self.rules) {
      self.rule = self.rules[self.index];
    }
    self.getUserAttributes();
    self.addCondition('$where');
    if (self.index > 0 && self.rules) {
      self.apiCallStack.prevDataService = true;
      self.commonService.getService(self.rules[self.index - 1].dataService).then(data => {
        self.apiCallStack.prevDataService = false;
        self.prevDataService = data;
        self.prevDataService.definition = self.schemaService.patchType(self.prevDataService.definition);
      }).catch(err => {
        self.apiCallStack.prevDataService = false;
      });
    }
    if (self.rule && self.rule.dataService) {
      self.apiCallStack.dataService = true;
      self.commonService.getService(self.rule.dataService).then(data => {
        self.apiCallStack.dataService = false;
        self.selectService(data);
        if (self.rule.filter) {
          self.conditions = [];
          self.createCondition(self.rule.filter);
        }
      }).catch(err => {
        self.apiCallStack.dataService = false;
      });
    }
  }

  ngAfterContentChecked() {
    const self = this;
    let count = 0;
    if (Object.keys(self.pathInvalid).length > 0) {
      Object.keys(self.pathInvalid).forEach(key => {
        if (self.pathInvalid[key]) {
          count++;
        }
      });
      if (count > 0) {
        self.isInvalid.emit(true);
      } else {
        self.isInvalid.emit(false);
      }
    } else {
      self.isInvalid.emit(true);
    }
  }

  getUserAttributes() {
    const self = this;
    self.apiCallStack.getUserAttributes = true;
    self.commonService.get('user', `/usr/app/${self.commonService.app._id}/distinctAttributes`).subscribe(res => {
      self.apiCallStack.getUserAttributes = false;
      self.userAttributes = res.attributes.map((usrAttr) => {usrAttr.key = usrAttr.key + '.value'; return usrAttr});
    }, err => {
      self.apiCallStack.getUserAttributes = false;
      self.userAttributes = [];
    });
  }

  createCondition(filter: string) {
    const self = this;
    if (typeof filter === 'string') {
      filter = JSON.parse(filter);
    }
    self.conditionStack = ['$where'];
    self.valueStack = [];
    self.parseCondition(filter);
    const temp = [];
    self.valueStack.forEach((item, i) => {
      const index = self.valueStack.length - 1 - i;
      const condition: Condition = {};
      self.parseObj(item, condition, index);
      condition.type = self.conditionStack.pop();
      temp.push(condition);
    });
    self.conditions = temp.reverse();
  }

  parseCondition(obj) {
    const self = this;
    Object.keys(obj).forEach(key => {
      if (key === '$and' || key === '$or') {
        self.conditionStack.push(key);
        obj[key].forEach((item) => {
          self.parseCondition(item);
        });
      } else {
        self.valueStack.push(obj);
      }
    });
  }

  parseObj(obj: any, condition: Condition, index: number) {
    const self = this;
    Object.keys(obj).forEach(key => {
      const innerKey = Object.keys(obj[key])[0];
      const innerValue = obj[key][innerKey];
      if ((innerValue + '').indexOf('ANS') > -1) {
        self.rowValueType[index] = 'ans';
      } else if ((innerValue + '').indexOf('USER') > -1) {
        self.rowValueType[index] = 'user';
      } else {
        self.rowValueType[index] = 'value';
      }
      if (typeof innerValue === 'string') {
        condition.value = innerValue.replace(/__#(USER|ANS)\.(.*)__/g, '$2');
      } else {
        condition.value = innerValue;
      }
      condition.condition = innerKey;
      condition.key = key;
    });
  }

  searchService(searchTerm) {
    const self = this;
    const options: GetOptions = {};
    options.filter = {
      name: '/' + searchTerm + '/',
      status: "Active"
    };
    if (searchTerm) {
      self.commonService.get('serviceManager', '/service', options).subscribe(res => {
        self.searchList = res;
      }, err => {
        self.searchList = [];
      });
    } else {
      self.searchList = [];
    }
  }

  selectService(service: any) {
    const self = this;
    service.definition = self.schemaService.patchType(service.definition);
    self.rule.dataService = service._id;
    self.dataService = service;
    self.searchList = [];
    self.showDataServiceList = false;
    self.conditions = [];
    self.addCondition('$where');
  }

  removeService() {
    const self = this;
    self.dataService = null;
    self.searchList = [];
    self.showDataServiceList = false;
    self.conditions = [];
  }

  addCondition(type: string) {
    const self = this;
    self.optionsDropDown = false;
    self.conditions.push({
      type,
      condition: '$eq'
    });
    self.rowValueType[self.conditions.length - 1] = self.index > 0 ? 'ans' : 'user';
  }

  updatePathValidators(index) {
    const self = this;
    const pathInvalidKeys = Object.keys(self.pathInvalid);

    pathInvalidKeys.forEach(pathKey => {
      if(index === +pathKey.split('_')[0]){
        delete self.pathInvalid[pathKey];
      }
    });
  }

  removeCondition(index) {
    const self = this;
    self.updatePathValidators(index);
    self.conditions.splice(index, 1);
    delete self.rowDropDown[index];
    delete self.rowValueType[index];
    delete self.rowValueTypeDropDown[index];
    self.constructFilter();
  }

  removeThis() {
    const self = this;
    self.pathInvalid = {};
    self.isInvalid.emit(false);
    self.rules.splice(self.index, 1);
  }

  constructFilter() {
    const self = this;
    let filter;
    if (self.conditions) {
      const temp = self.appService.cloneObject(self.conditions);
      temp.reverse().forEach((cond, i, arr) => {
        const index = temp.length - i - 1;
        let value = cond.value;
        if (self.rowValueType[index] === 'ans') {
          value = '__#ANS.' + cond.value + '__';
        } else if (self.rowValueType[index] === 'user') {
          value = '__#USER.' + cond.value + '__';
        } else {
          value = cond.value;
        }
        const obj = Object.defineProperty({}, cond.key, {
          writable: true,
          enumerable: true,
          configurable: true,
          value: Object.defineProperty({}, cond.condition, {
            writable: true,
            enumerable: true,
            configurable: true,
            value
          })
        });
        if (filter) {
          filter[arr[i - 1].type].push(obj);
          filter = Object.defineProperty({}, cond.type, {
            writable: true,
            enumerable: true,
            configurable: true,
            value: [filter]
          });
        } else {
          filter = {};
          filter[cond.type] = [obj];
        }
      });
      self.rule.filter = JSON.stringify(filter['$where'][0]);
      self.rulesChange.emit(self.rules);
    }
  }

  getValueDefinition(index: number) {
    const self = this;
    if (self.rowValueType[index] === 'ans') {
      return self.prevDataService.definition;
    } else {
      const def: any = self.schemaService.createDefiniition({
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

      def[attrIndex].definition = self.userAttributes;
      return def;
    }
  }

  convertToObject(defList: Array<any>) {
    const self = this;
    const temp = {};
    if (!defList) {
      return temp;
    }
    defList.forEach(def => {
      const newKey = def.key + '.value';
      temp[newKey] = self.appService.cloneObject(def);
      delete temp[newKey].key;
      temp[newKey].type = self.appService.toCapitalize(temp[newKey].type);
      if (temp[newKey]?.definition && temp[newKey]?.definition.length > 0) {
        temp[newKey].definition = self.convertToObject(temp[newKey].definition);
      }
    });
    return temp;
  }

  get serviceDefinition() {
    const self = this;
    return self.dataService?.definition || {};
  }

  get loading() {
    const self = this;
    if (Object.keys(self.apiCallStack).length > 0 && Object.values(self.apiCallStack).filter(e => e).length > 0) {
      return true;
    }
    return false;
  }
}

export interface Condition {
  type?: string;
  key?: string;
  condition?: string;
  value?: any;
  field?: any;
}
