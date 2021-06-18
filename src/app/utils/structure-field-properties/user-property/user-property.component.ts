import { Component, OnInit, Input, ViewChild, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormControl, FormBuilder } from '@angular/forms';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { CommonService, GetOptions } from '../../services/common.service';
import { AppService } from '../../services/app.service';


@Component({
  selector: 'odp-user-property',
  templateUrl: './user-property.component.html',
  styleUrls: ['./user-property.component.scss']
})
export class UserPropertyComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() edit: any;
  @Input() isLibrary: boolean;
  @Input() isDataFormat: boolean;
  @ViewChild('defaultEle', { static: false }) defaultEle: NgbTypeahead;
  properties: FormGroup;
  openDeleteModal: EventEmitter<any>;
  attributeList: Array<any>;
  documents: Array<any>;
  alertModal: {
    title: string;
    message: string;
    index: number;
    type: string;
  };
  private subscriptions: any;
  private documentAPI: string;
  constructor(private fb: FormBuilder,
    private commonService: CommonService,
    private appService: AppService) {
    const self = this;
    self.openDeleteModal = new EventEmitter();
    self.documents = [];
    self.attributeList = [{
      key: '_id',
      name: 'ID'
    }, {
      key: 'basicDetails.name',
      name: 'Name'
    },
    {
      key: 'username',
      name: 'User Name'
    },
    {
      key: 'basicDetails.alternateEmail',
      name: 'Alternate Email'
    },
    {
      key: 'basicDetails.phone',
      name: 'Phone Number'
    },
    ];
    self.alertModal = {
      title: '',
      message: '',
      index: -1,
      type: ''
    };
    self.subscriptions = {};

  }

  ngOnInit() {
    const self = this;
    if (self.form) {
      self.properties = self.form.get('properties') as FormGroup;
    }
    self.getDocuments();
    if(!self.properties.get('_default')){
      self.properties.addControl('_default', new FormControl());
    }
  }

  ngAfterViewInit(): void {
    const self = this;
    if (self.properties.get('default') && self.properties.get('default').value) {
      self.writeData(self.properties.get('default'));
    }
  }


  writeData(value) {
    const self = this;
    const options = {
      select: (<any>self.properties).get('relatedSearchField').value,
    };
    self.subscriptions['getRelationData'] =
      self.commonService
        .get('user', `/usr/` + self.properties.get('default').value, options)
        .subscribe(_data => {
          self.properties.get('_default').patchValue(_data);
        }, err => {
          if (err.statusText === 'Forbidden') {
            self.properties.get('default').disable();
          }
        });

  }


  addToList(control, value?) {
   
    const self = this;
    if (!value) {
      value = self.properties.get('_listInput').value;
    }
    if ((!value || !value.toString().trim())) {
      return;
    }
    let list: FormArray = self.properties.get(control) as FormArray;
    self.properties.get('_listInput').patchValue(null);
    
    if (list.value.length > 0) {
      if (list.value.indexOf(value) > -1) {
        return;
      }
    }
    list.push(new FormControl(value));
  }

  clearViewFields() {
    const self = this;
    self.alertModal.title = 'Clear List';
    self.alertModal.message = 'Are you sure you want to clear View Fields List?';
    self.alertModal.type = 'all';
    self.openDeleteModal.emit(self.alertModal);
  }

  removeViewField(index: number) {
    const self = this;
    self.alertModal.title = 'Remove Field';
    self.alertModal.message = 'Are you sure you want to remove <span class="font-weight-bold text-delete">'
      + self.relatedViewFields[index].name
      + '</span> field from view field list?';
    self.alertModal.type = 'one';
    self.alertModal.index = index;
    self.openDeleteModal.emit(self.alertModal);
  }


  getDocuments() {
    const self = this;
    const options: GetOptions = {
      noApp: true,
      count: -1
    };
    if (self.subscriptions['getDocuments']) {
      self.subscriptions['getDocuments'].unsubscribe();
    }
    self.subscriptions['getDocuments'] = self.commonService
      .get('user', `/usr/app/${self.commonService.app._id}`, options)
      .subscribe(data => {
        self.documents = data;
        self.properties.get('default').enable();
      }, err => {
        self.properties.get('default').disable();
      });
  }

  searchDocumments = (text$: Observable<any>) =>
    text$.pipe(debounceTime(200))
      .pipe(distinctUntilChanged())
      .pipe(switchMap(val => {
        const self = this;
        const options: GetOptions = {
          count: 10,
          filter: {},
          noApp: true,
          select: '_id,' + self.relatedSearchField
        };

        options.filter[self.relatedSearchField] = '/' + val + '/';
        return self.commonService.get('user', `/usr/app/${self.commonService.app._id}`, options).toPromise().then(res => {
          return res;
        });
      }))

  documentFormatter = (x: any) => {
    const self = this;
    return self.appService.getValue(self.relatedSearchField, x);
  };

  getFormatedValue(item) {
    const self = this;
    return self.appService.getValue(self.relatedSearchField, item) || 'N.A.';
  }


  closeDeleteModal(data) {
    const self = this;
    if (data) {
      if (data.type === 'all') {
        self.properties.removeControl('relatedViewFields');
        self.properties.addControl('relatedViewFields', self.fb.array([]));
      } else {
        const temp = (self.properties.get('relatedViewFields') as FormArray);
        temp.removeAt(data.index);
      }
    }
  }

  selectDocument(value) {
    const self = this;
    if (self.properties.get('default')) {
      self.properties.get('default').patchValue(value.item._id);
    }
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
  get relatedViewFields() {
    const self = this;
    if (self.properties.get('relatedViewFields')) {
      return self.properties.get('relatedViewFields').value;
    }
    return [];
  }

  get relatedSearchField() {
    const self = this;
    if (self.properties.get('relatedSearchField')) {
      return self.properties.get('relatedSearchField').value;
    }
    return null;
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
