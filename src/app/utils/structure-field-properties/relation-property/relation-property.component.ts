import { Component, OnInit, OnDestroy, Input, EventEmitter, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { CommonService, GetOptions } from '../../services/common.service';

@Component({
  selector: 'odp-relation-property',
  templateUrl: './relation-property.component.html',
  styleUrls: ['./relation-property.component.scss']
})
export class RelationPropertyComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() form: FormGroup;
  @Input() edit: any;
  @Input() isLibrary: boolean;
  @Input() isDataFormat: boolean;
  @Input() type;
  @ViewChild('defaultEle', { static: false }) defaultEle: NgbTypeahead;
  properties: FormGroup;
  definition: Array<any>;
  services: Array<any>;
  documents: Array<any>;
  openDeleteModal: EventEmitter<any>;
  relatedDSDef: any;
  isSerachFieldSecureTxt: boolean;

  private subscriptions: any;
  private documentAPI: string;
  private alertModal: {
    title: string;
    message: string;
    index: number;
    type: string;
  };
  attributeList: Array<any>;
  constructor(private commonService: CommonService, private fb: FormBuilder) {
    const self = this;
    self.subscriptions = {};
    self.definition = [];
    self.services = [];
    self.documents = [];
    self.edit = {
      status: false
    };
    self.alertModal = {
      title: '',
      message: '',
      index: -1,
      type: ''
    };
    self.openDeleteModal = new EventEmitter();
    this.attributeList = [];
  }

  ngOnInit() {
    const self = this;
    self.properties = self.form.get('properties') as FormGroup;
    self.getServices();
    self.getDefinition();
    if (!self.properties.get('_default')) {
      self.properties.addControl('_default', new FormControl());
    }
  }

  ngAfterViewInit(): void {
    const self = this;
    if (self.properties.get('relatedTo') && self.properties.get('relatedTo').value) {
      self.getAPI(self.properties.get('relatedTo').value);
    }
  }
  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach(key => {
      if (self.subscriptions[key]) {
        self.subscriptions[key].unsubscribe();
      }
    });
  }

  getServices() {
    const self = this;
    const options: GetOptions = {
      select: 'name,version,app,api,definition',
      count: 30,
      filter: { app: this.commonService.app._id }
    };
    if (self.subscriptions['getServices']) {
      self.subscriptions['getServices'].unsubscribe();
    }
    self.subscriptions['getServices'] = self.commonService.get('serviceManager', `/${this.commonService.app._id}/service`, options).subscribe(
      data => {
        self.services = data;

      },
      err => {
        self.services = [];
      }
    );
  }

  searchService = (text$: Observable<any>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(val => {
        const self = this;
        const options: GetOptions = {
          count: 10,
          select: 'name,version,app,api,definition',
          filter: {
            name: '/' + val + '/',
            app: self.commonService.app._id
          }
        };
        return self.commonService
          .get('serviceManager', `/${this.commonService.app._id}/service`, options)
          .toPromise()
          .then(res => {
            return res;
          });
      })
    );

  serviceFormatter = (x: any) => x.name;

  selectService(value) {
    const self = this;
    self.attributeList = [];
    self.properties.get('relatedTo').patchValue(value._id);
    self.properties.get('relatedToName').patchValue(value.name);
    self.properties.get('relatedSearchField').patchValue('_id');
    self.properties.removeControl('relatedViewFields');
    self.properties.addControl('relatedViewFields', self.fb.array([]));
    if (self.properties.get('default')) {
      self.properties.get('default').patchValue(null);
      if (self.defaultEle) {
        self.defaultEle.writeValue(null);
      }
    }
    self.definition = value.definition;
    if (!!this.definition) {
      this.getAllAttributeNames(this.definition);
      self.addToList('relatedViewFields', self.attributeList[0]);
    }

    self.getDocuments(value);
  }

  selectServiceDropdown() {
    const self = this;
    const item = self.services.find(service => service._id === self.properties.get('relatedTo').value);
    self.selectService(item);
  }

  getDocuments(value) {
    const self = this;
    const url = '/' + self.commonService.app._id + value.api;
    const options: GetOptions = {
      noApp: true,
      select: '_id,' + self.relatedSearchField,
      count: 30
    };
    self.documentAPI = url;
    if (self.subscriptions['getDocuments']) {
      self.subscriptions['getDocuments'].unsubscribe();
    }
    self.subscriptions['getDocuments'] = self.commonService.get('api', url, options).subscribe(
      _data => {
        self.documents = _data;
        self.properties.get('default').enable();
      },
      err => {
        self.properties.get('default').disable();
      }
    );
  }

  searchDocumments = (text$: Observable<any>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(_val => {
        const self = this;
        if (!_val) {
          if (self.properties.get('default')) {
            self.properties.get('default').patchValue(null);
          }
        }
        const filter = {
          $or: []
        };
        filter['$or'].push({ [self.relatedSearchField]: '/' + _val + '/' });
        filter['$or'].push({ [self.relatedSearchField + '.value']: _val });
        const options: GetOptions = {
          count: 10,
          filter,
          noApp: true,
          select: '_id,' + self.relatedSearchField
        };
        return self.commonService
          .get('api', self.documentAPI, options)
          .toPromise()
          .then(res => {
            return res;
          });
      })
    );

  documentFormatter = (x: any) => {
    let retValue = x[this.relatedSearchField];
    if (retValue && typeof retValue === 'object') {
      if (retValue.checksum) {
        retValue = retValue.value;
      } else if (retValue.metadata) {
        retValue = retValue.metadata.file;
      } else if (retValue.userInput || retValue.formattedAddress) {
        retValue = retValue.userInput ? retValue.userInput : retValue.formattedAddress;
      }
    }
    if (!retValue) {
      retValue = 'N.A';
    }
    return retValue;
  };

  selectDocument(value) {
    const self = this;
    if (self.properties.get('default')) {
      self.properties.get('default').patchValue(value.item._id);
    }
  }

  get getViewLabel() {
    const self = this;
    let key = self.form.get('properties.relatedSearchField').value
    if (self.definition && self.definition.length) {
      const val = self.definition.filter(e => e.properties.dataPath === key);
      if (val && val[0]) {
        return val[0].properties.name;
      } else {
        return null
      }
    } else {
      return null;
    }
  }

  removeViewField(index: number) {
    const self = this;
    self.alertModal.title = 'Remove Field';
    self.alertModal.message =
      'Are you sure you want to remove <span class="font-weight-bold text-delete">' +
      self.relatedViewFields[index]?.properties?.name +
      '</span> field from view field list?';
    self.alertModal.type = 'one';
    self.alertModal.index = index;
    self.openDeleteModal.emit(self.alertModal);
  }

  clearViewFields() {
    const self = this;
    self.alertModal.title = 'Clear List';
    self.alertModal.message = 'Are you sure you want to clear View Fields List?';
    self.alertModal.type = 'all';
    self.openDeleteModal.emit(self.alertModal);
  }

  closeDeleteModal(data) {
    const self = this;
    if (data) {
      if (data.type === 'all') {
        self.properties.removeControl('relatedViewFields');
        self.properties.addControl('relatedViewFields', self.fb.array([]));
      } else {
        const temp = self.properties.get('relatedViewFields') as FormArray;
        temp.removeAt(data.index);
      }
    }
  }

  getDefinition() {
    const self = this;
    const options: GetOptions = {
      select: 'definition name',
      filter: { app: this.commonService.app._id }
    };
    if (self.subscriptions['getRelationAttributes']) {
      self.subscriptions['getRelationAttributes'].unsubscribe();
    }
    self.subscriptions['getRelationAttributes'] = self.commonService
      .get('serviceManager', `/${this.commonService.app._id}/service/` + self.properties.get('relatedTo').value, options)
      .subscribe(
        res => {
          self.definition = res.definition;
          if (!!this.definition) {
            this.getAllAttributeNames(this.definition);
          }

        },
        err => {
          self.commonService.errorToast(err);
        }
      );
  }

  addToList(control, _value?) {
    const self = this;
    if (!_value) {
      _value = self.properties.get('_listInput').value;
    }
    if ((!_value || !_value.toString().trim()) && typeof _value !== 'number') {
      return;
    }
    let list: FormArray = <FormArray>self.properties.get(control);
    self.properties.get('_listInput').patchValue(null);
    if (!list.value) {
      self.properties.removeControl(control);
      self.properties.addControl(control, self.fb.array([]));
      list = <FormArray>self.properties.get(control);
    }
    if (list.value.length > 0) {
      if (list.value.indexOf(_value) > -1) {
        return;
      }
    }
    list.push(new FormControl(_value));
  }
  writeData(value) {
    const self = this;
    const url = '/' + self.commonService.app._id + value;
    const options = {
      select: (<any>self.properties).get('relatedSearchField').value,
      srvcID: value.relatedTo
    };
    if (!self.properties.get('default').value) {
      return;
    }
    self.subscriptions['getRelationData'] = self.commonService
      .get('api', url + '/' + self.properties.get('default').value, options)
      .subscribe(
        _data => {
          self.properties.get('_default').patchValue(_data);
        },
        err => {
          if (err.statusText === 'Forbidden') {
            self.properties.get('default').disable();
          }
          // self.commonService.errorToast(err, 'Unable to fetch reference data');
        }
      );
  }
  getAPI(relatedTo) {
    const self = this;
    self.subscriptions['getRelation'] = self.commonService.get('serviceManager', `/${this.commonService.app._id}/service/` + relatedTo, { filter: { app: this.commonService.app._id } }).subscribe(
      res => {
        self.relatedDSDef = res.definition;
        if (self.relatedDSDef[self.relatedSearchField] && self.relatedDSDef[self.relatedSearchField].properties && self.relatedDSDef[self.relatedSearchField].properties.password) {
          self.isSerachFieldSecureTxt = true;
        }
        // self.docApi = res.api;
        self.getDocuments(res);
        self.writeData(res.api);
      },
      err => {
        self.commonService.errorToast(err, 'Unable to fetch reference');
      }
    );
  }
  changeDefault(event) {
    const self = this;
    const value = event.target.value;
    if (!value || value === 'null' || value === null) {
      self.form.get('properties.default').patchValue(null);
    } else {
      self.form.get('properties.default').patchValue(value);
    }
  }


  onSelectSearchField(selectedSearchField) {
    const self = this;
    self.addToList('relatedViewFields', selectedSearchField);
    const service = self.services.find(e => e._id === self.properties.get('relatedTo').value);
    self.getDocuments(service);
  }

  clearDefaultValue() {
    const self = this;
    self.form.get('properties.default').patchValue(null);
  }

  getAllAttributeNames(definition, parentKey?) {
    definition.forEach(element => {
      let ele = JSON.parse(JSON.stringify(element));
      if (element.type === 'Object' && element.properties && !element.properties.password && !element.properties.relatedTo) {
        let key = element.key;
        if (parentKey) {
          key = parentKey + '.' + element.key
        }
        if (!!element.definition) {
          this.getAllAttributeNames(element.definition, key)
        }
      } else if (element.type !== 'Array') {
        if (parentKey) {
          ele.properties.name = parentKey + '.' + element.properties.name;
          ele.properties.dataPath = element.properties.dataPath;
        }
        this.attributeList.push(ele);
      }
    });

  }

  get relatedToName() {
    const self = this;
    if (self.properties.get('relatedToName')) {
      return self.properties.get('relatedToName').value;
    }
    return null;
  }

  get relatedSearchField() {
    const self = this;
    if (self.properties.get('relatedSearchField')) {
      return self.properties.get('relatedSearchField').value;
    }
    return null;
  }

  get relatedViewFields() {
    const self = this;
    if (self.properties.get('relatedViewFields')) {
      return self.properties.get('relatedViewFields').value;
    }
    return [];
  }

  get default() {
    const self = this;
    if (self.properties.get('default')) {
      return self.properties.get('default').value;
    }
    return null;
  }

  get required() {
    const self = this;
    if (self.properties.get('required')) {
      return self.properties.get('required').value;
    }
    return false;
  }

  set allowDeletion(val: boolean) {
    const self = this;
    if (val) {
      self.properties.get('deleteAction').patchValue('setnull');
    } else {
      self.properties.get('deleteAction').patchValue('restrict');
    }
  }

  get allowDeletion() {
    const self = this;
    const val = self.properties.get('deleteAction').value;
    if (val === 'restrict') {
      return false;
    }
    return true;
  }
}
