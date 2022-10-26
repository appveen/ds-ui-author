import { Component, OnInit, AfterContentChecked, Input, Output, EventEmitter } from '@angular/core';
import { Rule } from '../manage-permissions.component';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { SchemaBuilderService } from '../../schema-builder.service';

@Component({
  selector: 'odp-traverse-block',
  templateUrl: './traverse-block.component.html',
  styleUrls: ['./traverse-block.component.scss']
})
export class TraverseBlockComponent implements OnInit, AfterContentChecked {

  @Input() edit: {
    id: string;
    status: boolean;
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
  rowValueTypeDropDown: boolean;
  valueType: string;
  pathInvalid: any;
  apiCallStack: any;
  rowDropDown: any;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private schemaService: SchemaBuilderService) {
    const self = this;
    self.rulesChange = new EventEmitter();
    self.isInvalid = new EventEmitter();
    self.dataService = {};
    self.prevDataService = {};
    self.searchList = [];
    self.valueType = 'ans';
    self.pathInvalid = {};
    self.apiCallStack = {};
    self.rowDropDown = {};
  }

  ngOnInit() {
    const self = this;
    self.rule = self.rules[self.index];
    if (self.index > 0) {
      self.apiCallStack.prevDataService = true;
      self.commonService.getService(self.rules[self.index - 1].dataService).then(data => {
        self.apiCallStack.prevDataService = false;
        self.prevDataService = data;
        self.prevDataService.definition = self.schemaService.patchType(self.prevDataService.definition);
      }).catch(err => {
        self.apiCallStack.prevDataService = false;
      });
    }
    if (self.rule.dataService) {
      self.apiCallStack.dataService = true;
      self.commonService.getService(self.rule.dataService).then(data => {
        self.apiCallStack.dataService = false;
        self.selectService(data);
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

  searchService(searchTerm) {
    const self = this;
    const options: GetOptions = {};
    options.filter = {
      name: '/' + searchTerm + '/',
      status: "Active",
      app: this.commonService.app._id
    };
    if (searchTerm) {
      self.commonService.get('serviceManager', `/${this.commonService.app._id}/service`, options).subscribe(res => {
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
  }

  removeService() {
    const self = this;
    self.rule.dataService = null;
    self.dataService = null;
    self.searchList = [];
    self.showDataServiceList = false;
  }

  removeThis() {
    const self = this;
    self.pathInvalid = {};
    self.isInvalid.emit(false);
    self.rules.splice(self.index, 1);
  }

  get valueDefinition() {
    const self = this;
    if (self.valueType === 'ans') {
      return self.prevDataService.definition;
    } else {
      const def = self.schemaService.createDefiniition({
        basicDetails: {
          name: '',
          alternateEmail: '',
          phone: ''
        },
        _id: '',
        username: '',
        attributes: {}
      });
      return def;
    }
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
