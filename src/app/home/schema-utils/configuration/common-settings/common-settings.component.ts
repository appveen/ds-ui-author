import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-common-settings',
  templateUrl: './common-settings.component.html',
  styleUrls: ['./common-settings.component.scss']
})
export class CommonSettingsComponent implements OnInit {

  @Input() form: UntypedFormGroup;
  @Input() edit: any;
  removedTags: Array<any>;
  headerData: any;
  purgeModal: {
    title: string,
    desc: string,
    btnText: string,
    type: string
  };
  subscriptions: any = {};
  showHeaderWindow: boolean;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private ts: ToastrService) {
    this.removedTags = [];
    this.headerData = {};
    this.purgeModal = {
      title: '',
      desc: '',
      btnText: '',
      type: ''
    };
  }

  ngOnInit() {
    if (this.form.get('headers') && !this.form.get('headers').value) {
      this.form.get('headers').patchValue([]);
    }
  }

  addTag(_field, event?) {
    if (event && event.key !== 'Enter') {
      return;
    }
    const _index = this.removedTags.findIndex(_e => {
      if (_e.value === _field.value) {
        return _e;
      }
    });
    if (_index > -1) {
      this.removedTags.splice(_index, 1);
    }
    if (_field.value && _field.value.trim()) {
      (<UntypedFormArray>this.form.controls.tags).push(new UntypedFormControl(_field.value));
    }
    _field.value = null;
  }
  removeTag(_index) {
    this.removedTags.push((<UntypedFormArray>this.form.controls.tags).at(_index));
    (<UntypedFormArray>this.form.controls.tags).removeAt(_index);
  }

  openHeadersModal(data?: any) {
    if (data) {
      this.headerData = data;
      this.headerData.isEdit = true;
    }
    this.showHeaderWindow = true;
  }

  closeHeadersModal() {
    this.headerData = {};
    this.showHeaderWindow = false;
  }

  setHeaderData() {
    let temp: Array<any> = this.form.get('headers').value;
    if (!temp) {
      temp = [];
    }
    const tempIndex = temp.findIndex(e => e.key === this.headerData.key);
    if (tempIndex > -1) {
      temp.splice(tempIndex, 1);
    }
    temp.push({
      key: this.headerData.key,
      value: this.headerData.value,
      header: this.convertHeader(this.headerData.key)
    });
    this.form.get('headers').markAsDirty();
    this.form.get('headers').patchValue(temp);
    this.closeHeadersModal();
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
    const temp = this.form.get('headers').value;
    const tempIndex = temp.findIndex(e => e.key === key);
    if (tempIndex > -1) {
      temp.splice(tempIndex, 1);
    }
    this.form.get('headers').markAsDirty();
    this.form.get('headers').patchValue(temp);
  }


  get definitions() {
    return (<UntypedFormArray>this.form.get('definition')).controls;
  }

  get tags() {
    return (<UntypedFormArray>this.form.get('tags')).controls;
  }

  get headers() {
    return this.form.get('headers').value;
  }

  hasPermission(type: string, entity?: string) {
    return this.commonService.hasPermission(type, entity);
  }

  hasPermissionStartsWith(type: string, entity?: string) {
    return this.commonService.hasPermissionStartsWith(type, entity);
  }

  canEdit(type: string) {
    if (this.hasPermission('PMDS' + type, 'SM')) {
      return true;
    }
    return false;
  }

  canView(type: string) {
    if (this.hasPermission('PMDS' + type, 'SM')
      || this.hasPermission('PVDS' + type, 'SM')) {
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

  get id() {
    return this.edit._id;
  }

  get allowedFileTypes() {
    if (this.commonService.userDetails && this.commonService.userDetails.allowedFileExt) {
      return this.commonService.userDetails.allowedFileExt
    }
    return [];
  }

}
