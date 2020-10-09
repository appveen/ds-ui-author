import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { EditConfig } from 'src/app/utils/interfaces/schemaBuilder';

@Component({
  selector: 'odp-manage-bookmarks',
  templateUrl: './manage-bookmarks.component.html',
  styleUrls: ['./manage-bookmarks.component.scss']
})
export class ManageBookmarksComponent implements OnInit {
  @Output() toggleBookmarkMngChange: EventEmitter<boolean>;
  @Output() cancelBookMarkPage: EventEmitter<boolean>;
  @ViewChild('pageChangeModalTemplate', { static: false }) pageChangeModalTemplate: TemplateRef<HTMLElement>;
  private _bookmark: any;
  bookmarkForm: FormGroup;
  showLazyLoader: boolean;
  breadcrumbPaths: string;
  private _toggleBookmarkMng: boolean;
  subscriptions: any = {};
  addNewKeyValue: boolean;
  keyValuePair: any;
  editIndex = -1;
  _edit: EditConfig;
  cancelClicked: boolean;
  pageChangeModalTemplateRef: NgbModalRef;


  get toggleBookmarkMng(): boolean {
    const self = this;
    return self._toggleBookmarkMng;
  }

  @Input() set toggleBookmarkMng(value: boolean) {
    const self = this;
    self._toggleBookmarkMng = value;
  }
  @Input() set bookmark(value: any) {
    const self = this;
    self._bookmark = value;
    if (self._bookmark && self._bookmark._id) {
      self._edit.status = true;
      self._edit.id = self._bookmark._id;
      self.fillForm();
    }
  }
  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private ts: ToastrService,
    private appservice: AppService) {
    const self = this;
    self.toggleBookmarkMngChange = new EventEmitter<boolean>();
    self.cancelBookMarkPage = new EventEmitter<boolean>();
    self.showLazyLoader = false;
    self.createBookmarkForm();
    self.breadcrumbPaths = '';
    self.addNewKeyValue = false;
    self.keyValuePair = {
      key: '',
      value: ''
    };
    self._edit = {
      loading: true,
      status: true
    };
    self.cancelClicked = false;
  }

  ngOnInit() {
    const self = this;
    if (self._bookmark && self._bookmark._id) {
      self._edit.status = true;
      self._edit.id = self._bookmark._id;
      self.fillForm();
    }
  }
  hideToggleManage() {
    const self = this;
    if (self.bookmarkForm.dirty) {
      if (!self.cancelClicked) {
        self.pageChangeModalTemplateRef = self.commonService.modal(self.pageChangeModalTemplate);
        self.pageChangeModalTemplateRef.result.then(close => {
          if (close) {
            self._toggleBookmarkMng = false;
            self.cancelBookMarkPage.emit(false);
          } else {
            self.cancelClicked = true;
          }
        }, dismiss => {
          self.cancelClicked = true;
        });
      }
    } else {
      self._toggleBookmarkMng = false;
      self.cancelBookMarkPage.emit(false);
    }
    setTimeout(() => {
      self.cancelClicked = false;
    }, 3000);
  }
  hideProperties() {
    const self = this;
    self._toggleBookmarkMng = false;
    self.toggleBookmarkMngChange.emit(false);
  }

  createBookmarkForm() {
    const self = this;
    self.bookmarkForm = self.fb.group({
      name: ['', Validators.required],
      url: [null, [Validators.required, Validators.pattern(/^http(s)?:(.*)\/?(.*)/)]],
      app: self.commonService.app._id,
      options: 'FRAME',
      createdBy: self.commonService.userDetails._id,
      parameters: self.fb.group({
        username: false,
        appname: false,
        token: false,
        custom: self.fb.array([])
      })
    });
  }
  saveBookmark() {
    const self = this;
    const path = '/app/' + self.commonService.app._id + '/bookmark';
    const payload = self.bookmarkForm.value;
    if (self._bookmark && self._bookmark._id) {
      self.subscriptions['addBookmark'] = self.commonService.put('user', path + '/' + self._bookmark._id, payload)
        .subscribe((res) => {
          self.showLazyLoader = false;
          self.ts.success('Bookmark updated successfully');
          self.hideProperties();

        }, (err) => {
          self.commonService.errorToast(err);
        });
    } else {
      self.subscriptions['addBookmark'] = self.commonService.post('user', path, payload)
        .subscribe((res) => {
          self.showLazyLoader = false;
          self.ts.success('Bookmark added successfully');
          self.hideProperties();

        }, (err) => {
          self.commonService.errorToast(err);
        });

    }
  }
  done() {
    const self = this;
    let list: FormArray = <FormArray>(<FormGroup>self.bookmarkForm.get('parameters')).get('custom');
    if (!list.value) {
      (<FormGroup>self.bookmarkForm.get('parameters')).removeControl('custom');
      (<FormGroup>self.bookmarkForm.get('parameters')).addControl('custom', self.fb.array([]));
      list = <FormArray>(<FormGroup>self.bookmarkForm.get('parameters')).get('custom');
    }
    if (self.editIndex < 0) {
      const tempIndex = list.value.findIndex(d => d.key === self.keyValuePair.key && d.value === self.keyValuePair.value);
      if (tempIndex < 0) {
        list.push(self.fb.group({
          key: self.keyValuePair.key,
          value: self.keyValuePair.value
        }));
      }
    } else {
      list.get([self.editIndex]).patchValue(self.keyValuePair);
    }
    self.bookmarkForm.markAsDirty();
    self.addNewKeyValue = false;
    self.keyValuePair = {
      key: '',
      value: ''
    };
    self.editIndex = -1;
  }
  addKeyValue() {
    const self = this;
    self.keyValuePair = {
      key: '',
      value: ''
    };
    self.addNewKeyValue = true;
    self.editIndex = -1;
  }
  editkeyValue(index) {
    const self = this;
    if (self._edit.status) {
      self.editIndex = index;
      self.keyValuePair = self.appservice.cloneObject(self.bookmarkForm.get(['parameters', 'custom', index]).value);
    }
  }
  removekeyValue(index?) {
    const self = this;
    const list: FormArray = <FormArray>(<FormGroup>self.bookmarkForm.get('parameters')).get('custom');
    if (!index) {
      index = self.editIndex;
    }
    list.removeAt(index);
    self.editIndex = -1;
    self.keyValuePair = {
      key: '',
      value: ''
    };
  }
  back() {
    const self = this;
    self.editIndex = -1;
    self.keyValuePair = {
      key: '',
      value: ''
    };
    self.addNewKeyValue = false;
  }
  fillForm() {
    const self = this;
    self.bookmarkForm.patchValue(self._bookmark);
    (<FormGroup>self.bookmarkForm.get('parameters')).removeControl('custom');
    (<FormGroup>self.bookmarkForm.get('parameters')).addControl('custom', self.fb.array([]));
    const list: FormArray = <FormArray>(<FormGroup>self.bookmarkForm.get('parameters')).get('custom');
    if (self._bookmark && self._bookmark.parameters && self._bookmark.parameters.custom) {
      self._bookmark.parameters.custom.forEach(element => {
        list.push(self.fb.group({
          key: element.key,
          value: element.value
        }));
      });
    }
  }
  hasPermission(type: string) {
    const self = this;
    return self.commonService.hasPermission(type);
  }

  get isDuplicate() {
    const self = this;
    let retVal = false;
    const list: FormArray = <FormArray>(<FormGroup>self.bookmarkForm.get('parameters')).get('custom');
    const tempIndex = list.value.findIndex(d => d.key === self.keyValuePair.key);
    if (tempIndex > -1) {
      retVal = true;
    }
    return retVal;
  }
  set option(tabOption: boolean) {
    const self = this;
    if (tabOption) {
      self.bookmarkForm.get('options').patchValue('NEW_TAB');
    } else {
      self.bookmarkForm.get('options').patchValue('FRAME');
    }
  }
  get option() {
    const self = this;
    return self.bookmarkForm.get('options').value === 'FRAME' ? false : true;
  }
}
