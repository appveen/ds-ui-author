import { Component, OnInit, ViewChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-user-bulk-upload',
  templateUrl: './user-bulk-upload.component.html',
  styleUrls: ['./user-bulk-upload.component.scss']
})
export class UserBulkUploadComponent implements OnInit {
  @ViewChild('conflictModel', { static: false }) conflictModel: TemplateRef<HTMLElement>;
  @Output() emitData: EventEmitter<any> = new EventEmitter();
  activeStep: number;
  userList: Array<any>;
  apiConfig: GetOptions;
  conflictModelRef: NgbModalRef;
  subscriptions: any = {};
  fileData: any = {};
  fileSettings: any = {
    headers: false
  };
  errorLog: any;
  fileMappingData: any = {};
  fileMapping: any = {};
  conflictRecords: any;
  selectedConflictRecords: any;
  errorRecords: any;
  totalUserCount;
  selectedRecord: any;
  resolveArray: Array<any> = [];
  finalLog: any;
  displayRecord: string;
  timer;
  showLazyLoader: boolean;
  tableLoader: boolean;
  fileMappingFrom: FormGroup;
  parseObj;
  uploadObj;
  ripple;
  uploadError;
  currentPage: number;
  pageSize: number;

  constructor(
    private commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private ts: ToastrService,
    private fb: FormBuilder,
  ) {
    const self = this;
    self.apiConfig = {
      noApp: true,
      page: 1,
      count: 10
    };
    self.displayRecord = 'All';
    self.userList = [];
    self.fileData = {};
    self.fileSettings = {
      fileHeaders: false
    };
    self.fileMappingData = {};
    self.fileMapping = {};
    self.timer = 30;
    self.parseObj = {
      showParseSpinner: false,
      parseError: false,
      showParseTag: false
    };
    self.uploadObj = {
      showUploadSpinner: false,
      uploadError: false,
      showUploadTag: false,
      errorMsg: '',
      uploadProgress: 0
    };
    self.ripple = false;
    self.uploadError = 'Upload failed';
    self.conflictRecords = [];
    self.currentPage = 1;
    self.pageSize = 10;
  }

  ngOnInit() {
    const self = this;
    self.activeStep = 0;
    self.createForm();

  }
  createForm() {
    const self = this;
    self.fileMappingFrom = self.fb.group({
      username: ['', [Validators.required]],
      'basicDetails.name': ['', [Validators.required]],
      password: ['', [Validators.required]],
      'basicDetails.phone': ''
    });
  }
  selectAndUpload(event) {
    const self = this;
    const file = event.target.files[0];
    const formData: FormData = new FormData();
    formData.append('file', file);
    self.uploadFile(formData);
  }

  dragAndUpload(file) {
    const self = this;
    const formData: FormData = new FormData();
    formData.append('file', file[0]);
    self.uploadFile(formData);
  }

  uploadFile(formData) {
    const self = this;
    self.ripple = false;
    self.uploadObj.showUploadSpinner = true;
    self.uploadObj.showUploadTag = true;
    self.uploadObj.uploadError = false;
    self.subscriptions['uploadFile_'] = self.commonService.uploadFile('user', `/${this.commonService.app._id}/user/utils/bulkCreate/upload`, formData)
      .subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          self.uploadObj.uploadProgress = Math.round(event.loaded / event.total * 100);
        }
        if (event.type === HttpEventType.Response) {
          self.activeStep = 1;
          self.fileData = event.body;
          self.showLazyLoader = false;
          self.clearForms();
        }
      }, err => {
        self.uploadObj.showUploadSpinner = false;
        self.uploadObj.uploadError = true;
        self.uploadObj.errorMsg = err.error.message;
        self.showLazyLoader = false;
        self.commonService.errorToast(err);
      });
  }


  clearForms() {
    const self = this;
    self.parseObj.showParseTag = false;
    self.uploadObj.showUploadTag = false;
    self.uploadObj.uploadProgress = 0;
    self.getCount();
    self.fileSettings = {
      fileHeaders: false
    };
    self.createForm();
    self.errorLog = {};
    self.userList = [];
  }

  parseFile() {
    const self = this;
    self.parseObj.showParseSpinner = true;
    self.parseObj.showParseTag = true;
    self.parseObj.parseError = false;
    if (self.fileData.type === 'csv') {
      self.fileSettings.sheet = 'Sheet1';
    }
    if (!self.fileSettings.sheet) {
      self.ts.error('Please select the sheet');
      self.parseObj.showParseSpinner = false;
      self.parseObj.showParseTag = false;

      return;
    }
    self.fileSettings.type = self.fileData.type;
    self.fileSettings.fileName = self.fileData.fileName;
    self.fileSettings.fileId = self.fileData.fileId;
    const path = `/${this.commonService.app._id}/user/bulkCreate/utils/` + self.fileData.fileId + '/sheetSelect';
    self.subscriptions['connector-settings'] = self.commonService.put('user', path, self.fileSettings)
      .subscribe(res => {
        self.parseObj.showParseTag = false;
        self.uploadObj.showUploadTag = false;
        self.fileMappingData = res;
        if (res.headerMapping) {
          self.fileMappingFrom.patchValue(res.headerMapping);
        }
        self.activeStep++;
      }, err => {
        self.parseObj.showParseSpinner = false;
        self.parseObj.parseError = true;
        self.showLazyLoader = false;
        self.commonService.errorToast(err);
      });
  }
  continue() {
    const self = this;
    const data = {
      headers: {
        fileKeys: self.fileMappingData.headers.fileKeys
      }
    };
    data['type'] = self.fileData.type;
    data['fileName'] = self.fileData.fileName;
    data['fileId'] = self.fileMappingData.fileId;
    data['fileHeaders'] = self.fileSettings.fileHeaders;
    data['sheet'] = self.fileSettings.sheet;
    data['headerMapping'] = self.fileMappingFrom.value;
    // data['fileKeys'] = self.fileMappingData.headers.fileKeys;
    if (self.fileMappingFrom.valid) {
      self.activeStep++;
      self.getErrorLog(data);
    } else {
      self.fileMappingFrom.get('username').markAsTouched();
      self.fileMappingFrom.get(['basicDetails.name']).markAsTouched();
      self.fileMappingFrom.get('password').markAsTouched();
    }
  }

  getErrorLog(data) {
    const self = this;
    self.showLazyLoader = true;
    const path = `/${this.commonService.app._id}/user/bulkCreate/utils/` + self.fileMappingData.fileId + '/validate';
    self.subscriptions['connector-settings'] = self.commonService.put('user', path, data)
      .subscribe(res => {
        self.showLazyLoader = false;
        self.errorLog = res;
        self.getCount();
        self.getUsers();
        self.getConflictRecords();
      }, err => {
        self.showLazyLoader = false;
        self.commonService.errorToast(err);
      });
  }

  getCount() {
    const self = this;
    self.showLazyLoader = true;
    const path = `/${this.commonService.app._id}/user/bulkCreate/utils/` + self.fileMappingData.fileId + '/count';
    self.subscriptions['getCount'] = self.commonService.get('user', path, { noApp: true, filter: self.apiConfig.filter })
      .subscribe(res => {
        self.totalUserCount = res;
        self.showLazyLoader = false;
      }, err => {
        self.showLazyLoader = false;
        self.commonService.errorToast(err);
      });
  }

  loadMore(config: any) {
    const self = this;
    self.apiConfig = config;
    self.apiConfig.noApp = true;
    self.getUsers();
  }
  prevPage() {
    const self = this;
    self.currentPage -= 1;
    self.loadMore({
      page: self.currentPage
    });
  }

  nextPage() {
    const self = this;
    self.currentPage += 1;
    self.loadMore({
      page: self.currentPage
    });
  }
  get startNo() {
    const self = this;
    return (self.currentPage - 1) * self.pageSize + 1;
  }

  get endNo() {
    const self = this;
    const temp = self.currentPage * self.pageSize;
    if (self.totalUserCount > temp) {
      return temp;
    }
    return self.totalUserCount;
  }
  get disablePrev() {
    const self = this;
    if (self.currentPage === 1) {
      return true;
    }
    return false;
  }

  get disableNext() {
    const self = this;
    if (self.totalUserCount < self.recordsLoaded) {
      return true;
    }
    return false;
  }
  get recordsLoaded() {
    const self = this;
    return self.currentPage * self.pageSize;
  }
  getUsers() {
    const self = this;
    self.tableLoader = true;
    const path = `/${this.commonService.app._id}/user/bulkCreate/utils/` + self.fileMappingData.fileId + '/userList';
    self.subscriptions['getUsers'] = self.commonService.get('user', path, self.apiConfig)
      .subscribe(res => {
        self.userList = res;
        self.tableLoader = false;
      }, err => {
        self.tableLoader = false;
        self.commonService.errorToast(err);
      });
  }


  getConflictRecords() {
    const self = this;
    const apiConfig = {
      noApp: true,
      count: -1,
      filter: {
        conflict: true
      }
    };
    self.tableLoader = true;
    const path = `/${this.commonService.app._id}/user/bulkCreate/utils/` + self.fileMappingData.fileId + '/userList';
    self.subscriptions['getConflicts'] = self.commonService.get('user', path, apiConfig)
      .subscribe(res => {
        self.conflictRecords = res;
        self.tableLoader = false;
      }, err => {
        self.tableLoader = false;
        self.commonService.errorToast(err);
      });
  }



  resolveContinue() {
    const self = this;
    const path = `/${this.commonService.app._id}/user/bulkCreate/utils/` + self.fileMappingData.fileId;
    self.fileSettings['conflictSerialNo'] = self.resolveArray;
    self.fileSettings['fileId'] = self.fileMappingData.fileId;
    self.subscriptions['connector-settings'] = self.commonService.post('user', path, self.fileSettings)
      .subscribe(res => {
        self.finalLog = res;
        self.activeStep++;
        const interval = setInterval(() => {
          self.timer = self.timer - 1;
          if (self.timer === 0) {
            clearInterval(interval);
            self.cancel();
          }
        }, 1000);

      }, err => {
        self.showLazyLoader = false;
        self.commonService.errorToast(err);
      });
  }


  back() {
    const self = this;
    self.activeStep--;
  }
  resolveConflict(userIndex) {
    const self = this;
    const userData = self.userList[userIndex];
    if (userData.conflict && !(userData.status === 'Error')) {
      self.selectedConflictRecords = self.conflictRecords.filter(user => user.data.username === userData.data.username);
      const sltdIndex = self.selectedConflictRecords.findIndex(usr => usr.selected === true);
      if (sltdIndex < 0) {
        self.selectedConflictRecords[0].selected = true;
      }
      const index = self.userList.findIndex(usr => userData.sNo === self.selectedConflictRecords[0].sNo);
      self.conflictModelRef = self.commonService.modal(self.conflictModel, { centered: true, windowClass: 'conflict-modal' });
      self.conflictModelRef.result.then(close => {
        if (close) {
          self.resolve();
        } else {
          self.ignoreAll();
        }
      }, dismiss => {
        self.ignoreAll();
      });
    }
  }

  resolve() {
    const self = this;
    const selectedIndex = self.selectedConflictRecords.findIndex(usr => usr.selected === true);
    const indx = self.conflictRecords.findIndex(usr => usr.sNo === self.selectedConflictRecords[selectedIndex].sNo);
    self.conflictRecords.map(user => {
      if (user.data.username === self.selectedConflictRecords[0].data.username) {
        user.resolve = true;
        user.selected = false;
      }
    });
    self.conflictRecords[indx].selected = true;

    const intersection = self.selectedConflictRecords.filter(user => self.resolveArray.includes(user.sNo));
    if (intersection.length) {
      const temp = self.resolveArray.findIndex(sNo => sNo === intersection[0].sNo);
      self.resolveArray = self.resolveArray.splice(temp, 1);
    }
    self.resolveArray.push(self.conflictRecords[indx].sNo);
  }
  ignoreAll() {
    const self = this;
    self.conflictRecords.map(user => {
      if (user.data.username === self.selectedConflictRecords[0].data.username) {
        user.resolve = false;
        user.selected = false;
      }
    });
  }
  cancel() {
    const self = this;
    self.emitData.emit(true);
  }


  markselected(userIndex) {
    const self = this;
    self.selectedConflictRecords.map(usr => usr.selected = false);
    self.selectedConflictRecords[userIndex].selected = true;
  }
  autoMap() {
    const self = this;
    self.fileMappingFrom.patchValue(self.fileMappingData.headerMapping);

  }


  dragOver(event) {
    const self = this;
    self.ripple = true;
  }
  dragOut(event) {
    const self = this;
    self.ripple = false;
  }

  setFilter(status) {
    const self = this;
    self.apiConfig.filter = {};
    if (status === 'Error') {
      self.apiConfig.filter = { status };
    } else if (status === 'conflict') {
      self.apiConfig.filter = { conflict: true };
    } else if (status === 'Validated') {
      self.apiConfig.filter = {
        conflict: false,
        status: 'Validated',
      };
    }
    self.apiConfig.count = 10;
    self.getCount();
    self.getUsers();
  }
  isConflictRecord(usr) {
    const self = this;
    let retVal = false;
    if (self.conflictRecords.length) {
      const conflictIndex = self.conflictRecords.findIndex(user => user.sNo === usr.sNo);
      if (conflictIndex > -1 && self.conflictRecords[conflictIndex].conflict
        && !self.conflictRecords[conflictIndex].resolve
        && !self.conflictRecords[conflictIndex].selected) {
        retVal = true;
      }
    }
    return retVal;
  }
  isConflictResovedRecord(usr) {
    const self = this;
    let retVal = false;
    const conflictIndex = self.conflictRecords.findIndex(user => user.sNo === usr.sNo);
    if (conflictIndex > -1 && self.conflictRecords[conflictIndex].conflict && self.conflictRecords[conflictIndex].selected) {
      retVal = true;
    }
    return retVal;
  }
  isConflictIgnoredRecord(usr) {
    const self = this;
    let retVal = false;
    const conflictIndex = self.conflictRecords.findIndex(user => user.sNo === usr.sNo);
    if (conflictIndex > -1 && self.conflictRecords[conflictIndex].conflict &&
      self.conflictRecords[conflictIndex].resolve && !self.conflictRecords[conflictIndex].selected) {
      retVal = true;
    }
    return retVal;
  }

}
