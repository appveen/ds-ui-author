import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { VersionConfig } from 'src/app/utils/interfaces/schemaBuilder';

@Component({
  selector: 'odp-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {

  @ViewChild('keyValModalTemplate', { static: false }) keyValModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('purgeModalTemplate', { static: false }) purgeModalTemplate: TemplateRef<HTMLElement>;
  @Input() form: FormGroup;
  @Input() edit: any;
  @Input() versionConfig: VersionConfig;
  removedTags: Array<any>;
  retainDataHistory: boolean;
  confirmServiceName: string;
  defaultVersionValues: Array<any> = [null, '', '-1', '10', '25', '50', '100', '1 months', '3 months', '6 months', '1 years'];
  keyValModalTemplateRef: NgbModalRef;
  purgeModalTemplateRef: NgbModalRef;
  headerData: any;
  purgeModal: {
    title: string,
    desc: string,
    btnText: string,
    type: string
  };
  subscriptions: any = {};
  constructor(private commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private ts: ToastrService) {
    const self = this;
    self.removedTags = [];
    self.versionConfig = {
      type: 'count',
      value: '-1',
    };
    self.retainDataHistory = true;
    self.headerData = {};
    self.purgeModal = {
      title: '',
      desc: '',
      btnText: '',
      type: ''
    };
    self.confirmServiceName = '';
  }

  ngOnInit() {
    const self = this;
    if (self.versionConfig.value === '0' || self.form.get('versionValidity.validityValue').value.toString() === '0') {
      self.retainDataHistory = false;
    }
    self.form.get('api').valueChanges.subscribe(_val => {
      if (!_val && !_val.trim()) {
        (<FormControl>self.form.get('api')).patchValue('/', { onlySelf: true, emitEvent: false });
      }
    });
    self.form.get('versionValidity').valueChanges.subscribe(_val => {
      if (self.form.get('versionValidity.validityType').value === 'count'
        && self.form.get('versionValidity.validityValue').value === 0) {
        self.retainDataHistory = false;
      } else {
        self.retainDataHistory = true;

      }
    });
    if (self.form.get('headers') && !self.form.get('headers').value) {
      self.form.get('headers').patchValue([]);
    }
  }

  addTag(_field, event?) {
    if (event && event.key !== 'Enter') {
      return;
    }
    const self = this;
    const _index = self.removedTags.findIndex(_e => {
      if (_e.value === _field.value) {
        return _e;
      }
    });
    if (_index > -1) {
      self.removedTags.splice(_index, 1);
    }
    if (_field.value && _field.value.trim()) {
      (<FormArray>self.form.controls.tags).push(new FormControl(_field.value));
    }
    _field.value = null;
  }
  removeTag(_index) {
    const self = this;
    self.removedTags.push((<FormArray>self.form.controls.tags).at(_index));
    (<FormArray>self.form.controls.tags).removeAt(_index);
  }

  patchVersionValue(reset?) {
    const self = this;
    let value;
    if (reset) {
      if (self.versionConfig.type === 'count') {
        self.versionConfig = {
          type: 'count',
          value: '-1',
          customValue: 10
        };
      } else {
        self.versionConfig = {
          type: 'time',
          value: '',
          customValue: 10,
          customValueSuffix: 'days'
        };
      }
    }
    self.versionConfig.isCustomValue = false;
    if (self.versionConfig.value === 'custom') {
      self.versionConfig.isCustomValue = true;
      value = self.versionConfig.customValue >= 0 ? self.versionConfig.customValue.toString() : null;
      if (value && self.versionConfig.type === 'time') {
        value += ' ' + self.versionConfig.customValueSuffix;
      }
    } else {
      value = self.versionConfig.value;
    }
    self.form.get('versionValidity').markAsDirty();
    self.form.get('versionValidity.validityType').patchValue(self.versionConfig.type);
    self.form.get('versionValidity.validityValue').patchValue(value);
  }

  /*This method is called on click of any of the purge action links and displays the purge modal for confirmation*/
  purgeData(dataType?: string) {
    const self = this;
    switch (dataType) {
      case 'logs': {
        self.purgeModal = {
          title: 'Purge all saved logs?',
          desc: 'This action cannot be undone. This will permanently delete logs.',
          btnText: 'I understand, clear logs',
          type: 'log'
        };
        break;
      }
      case 'audits': {
        self.purgeModal = {
          title: 'Purge all saved audits?',
          desc: 'This action cannot be undone. This will permanently delete audits.',
          btnText: 'I understand, clear audits',
          type: 'audit'
        };
        break;
      }
      case 'all': {
        self.purgeModal = {
          title: 'Purge all data?',
          desc: 'This action cannot be undone. This will permanently delete all data.',
          btnText: 'I understand, clear data',
          type: 'all'
        };
        break;
      }
      default: {
        break;
      }
    }
    self.confirmServiceName = '';
    self.purgeModalTemplateRef = self.commonService.modal(self.purgeModalTemplate, { centered: true, windowClass: 'purge-model' });
    self.purgeModalTemplateRef.result.then((close) => {
      if (close) {
        if (self.confirmServiceName === self.form.value.name) {
          self.subscriptions['purge'] = self.commonService.delete('serviceManager',
            `/${self.appService.purgeServiceId}/purge/${self.purgeModal.type}`)
            .subscribe(() => {
              self.confirmServiceName = '';
              self.purgeModalTemplateRef.close();
              self.router.navigate(['/app/', self.commonService.app._id, 'sm']);
            }, (err) => {
              self.ts.error(err.error.message);
              self.confirmServiceName = '';
              self.purgeModalTemplateRef.close();
            });
        } else {
          self.ts.warning('Sorry, Service name mismatch');
          self.confirmServiceName = null;
        }
      }
    }, dismiss => { });
  }

  openHeadersModal(data?: any) {
    const self = this;
    if (data) {
      self.headerData = data;
      self.headerData.isEdit = true;
    }
    self.keyValModalTemplateRef = self.commonService
      .modal(self.keyValModalTemplate, { centered: true, windowClass: 'key-value-modal' });
    self.keyValModalTemplateRef.result.then(close => {
      if (close) {
        let temp: Array<any> = self.form.get('headers').value;
        if (!temp) {
          temp = [];
        }
        const tempIndex = temp.findIndex(e => e.key === self.headerData.key);
        if (tempIndex > -1) {
          temp.splice(tempIndex, 1);
        }
        temp.push({
          key: self.headerData.key,
          value: self.headerData.value,
          header: self.convertHeader(self.headerData.key)
        });
        self.form.get('headers').markAsDirty();
        self.form.get('headers').patchValue(temp);
      }
      self.headerData = {};
    }, dismiss => {
      self.headerData = {};
    });
  }

  convertHeader(key: string) {
    if (key) {
      return 'Data-Stack-DS-' + key.split(' ')
        .filter(e => e)
        .map(e => e.charAt(0).toUpperCase() + e.substr(1, e.length))
        .join('-');
    }
    return null;
  }

  removeHeader(key: string) {
    const self = this;
    const temp = self.form.get('headers').value;
    const tempIndex = temp.findIndex(e => e.key === key);
    if (tempIndex > -1) {
      temp.splice(tempIndex, 1);
    }
    self.form.get('headers').markAsDirty();
    self.form.get('headers').patchValue(temp);
  }


  get definitions() {
    const self = this;
    return (<FormArray>self.form.get('definition')).controls;
  }

  get tags() {
    const self = this;
    return (<FormArray>self.form.get('tags')).controls;
  }

  get headers() {
    const self = this;
    return self.form.get('headers').value;
  }

  get validityValidator() {
    if (this.versionConfig.customValue > 0 && this.versionConfig.customValue !== null) {
      this.form.setErrors(null);
      return true;
    } else if (this.versionConfig.customValue === 0) {
      this.form.setErrors({ 'duration': true });
      return false;
    }
  }
  onVersionChange(value) {
    const self = this;
    if (value) {
      self.patchVersionValue(true);
    } else {
      self.retainDataHistory = false;
      self.form.get('versionValidity').markAsDirty();
      self.form.get('versionValidity.validityType').patchValue('count');
      self.form.get('versionValidity.validityValue').patchValue(0);
    }

  }

  hasPermission(type: string, entity?: string) {
    const self = this;
    return self.commonService.hasPermission(type, entity);
  }

  hasPermissionStartsWith(type: string, entity?: string) {
    const self = this;
    return self.commonService.hasPermissionStartsWith(type, entity);
  }

  canEdit(type: string) {
    const self = this;
    if (self.hasPermission('PMDS' + type, 'SM')) {
      return true;
    }
    return false;
  }

  canView(type: string) {
    const self = this;
    if (self.hasPermission('PMDS' + type, 'SM')
      || self.hasPermission('PVDS' + type, 'SM')) {
      return true;
    }
    return false;
  }

  isAdmin() {

    if (!this.commonService.userDetails.isSuperAdmin
      && this.commonService.isAppAdmin) {
      return true;
    } else
      return false
  }

  setFileExtention(checked: boolean, ext: string) {
    const allowedFileTypes = this.form.get('allowedFileTypes').value || [];
    const index = allowedFileTypes.indexOf(ext)
    if (checked) {
      if (index < 0) {
        allowedFileTypes.push(ext);
      }
    } else {
      allowedFileTypes.splice(index, 1);
    }
    this.form.get('allowedFileTypes').setValue(allowedFileTypes);
  }

  getFileExtention(ext: string) {
    const allowedFileTypes = this.form.get('allowedFileTypes').value || [];
    if (allowedFileTypes.indexOf(ext) > -1) {
      return true;
    }
    return false;
  }

  set fuzzySearch(val: boolean) {
    const self = this;
    self.form.get('enableSearchIndex').patchValue(val);
  }

  get fuzzySearch() {
    const self = this;
    return self.form.get('enableSearchIndex').value;
  }

  get id() {
    const self = this;
    return self.edit._id;
  }

  get allowedFileTypes() {
    if (this.commonService.userDetails && this.commonService.userDetails.allowedFileExt) {
      return this.commonService.userDetails.allowedFileExt
    }
    return [];
  }
}
