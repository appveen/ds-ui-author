import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/utils/services/common.service';
import { FormGroup, FormArray, NgModel, FormBuilder, Validators } from '@angular/forms';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-partner-properties',
  templateUrl: './partner-properties.component.html',
  styleUrls: ['./partner-properties.component.scss']
})
export class PartnerPropertiesComponent implements OnInit {

  @Input() partner: FormGroup;
  @Input() edit: any;
  @ViewChild('keyValModalTemplate', { static: false }) keyValModalTemplate: TemplateRef<HTMLElement>;
  keyValModalTemplateRef: NgbModalRef;
  data: any;
  form: FormGroup;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private fb: FormBuilder) {
    const self = this;
    self.data = {};
  
  }

  ngOnInit() {
    const self = this;
    let temp = self.partner.get('headers').value;
    if (!temp || !Array.isArray(temp)) {
      temp = [];
    }
    self.partner.get('headers').patchValue(temp);
    
  }

  openPropertiesModal(data?: any) {
    const self = this;
    if (!self.canUpdateHeaders()) {
      return;
    }
    self.createForm();
    if (data) {
      self.form.patchValue(data);
      self.form.get('key').disable();
      self.data.isEdit = true;
    }
    self.keyValModalTemplateRef = self.commonService
      .modal(self.keyValModalTemplate, { centered: true, windowClass: 'key-value-modal' });
    self.keyValModalTemplateRef.result.then(close => {
      if (close) {
        let temp = self.partner.get('headers').value;
        const data = self.form.getRawValue();
        if (!temp) {
          temp = [];
        }
        const tempIndex = temp.findIndex(e => e.key === data.key);
        if (tempIndex > -1) {
          temp.splice(tempIndex, 1);
        }
        temp.push({
          key: data.key,
          value: data.value,
          header: self.convertHeader(data.key)
        });
        self.partner.get('headers').patchValue(temp);
        self.partner.get('headers').markAsDirty();
        self.form.reset();
      }
      self.data = {};
    }, dismiss => {
      self.data = {};
    });
  }

  removeProperty(key: string) {
    const self = this;
    const temp = self.partner.get('headers').value;
    const tempIndex = temp.findIndex(e => e.key === key);
    if (tempIndex > -1) {
      temp.splice(tempIndex, 1);
    }
    self.partner.get('headers').patchValue(temp);
    self.partner.get('headers').markAsDirty();
  }

  convertHeader(key: string) {
    if (key) {
      return 'ODP-P-' + key.split(' ')
        .filter(e => e)
        .map(e => e.charAt(0).toUpperCase() + e.substr(1, e.length))
        .join('-');
    }
    return null;
  }

  addIP() {
    const self = this;
    const list = self.ipList;
    list.push(self.appService.getIpFormControl());
  }

  removeIP(index: number) {
    const self = this;
    const list = self.ipList;
    list.removeAt(index);
  }

  hasPermission(type: string, entity?: string) {
    const self = this;
    return self.commonService.hasPermission(type, entity);
  }

  hasPermissionStartsWith(type: string, entity?: string) {
    const self = this;
    return self.commonService.hasPermissionStartsWith(type, entity);
  }

  canCreateHeaders() {
    const self = this;
    if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      const list = self.commonService.getEntityPermissions('PM_' + self.id);
      if (list.length > 0) {
        return Boolean(list.find(e => e.id === 'PMPH'));
      } else {
        return self.commonService.hasPermission('PMPH', 'PM');
      }
    }
  }


  canUpdateHeaders() {
    const self = this;
    if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      const list = self.commonService.getEntityPermissions('PM_' + self.id);
      if (list.length > 0) {
        return Boolean(list.find(e => e.id === 'PMPH'));
      } else {
        return self.commonService.hasPermission('PMPH', 'PM');
      }
    }
  }

  canDeleteHeaders() {
    const self = this;
    if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      const list = self.commonService.getEntityPermissions('PM_' + self.id);
      if (list.length > 0) {
        return Boolean(list.find(e => e.id === 'PMPH'));
      } else {
        return self.commonService.hasPermission('PMPH', 'PM');
      }
    }
  }

  canViewHeaders() {
    const self = this;
    if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      const list = self.commonService.getEntityPermissions('PM_' + self.id);
      if (list.length > 0) {
        return Boolean(list.find(e => e.id === 'PVPH'));
      } else {
        return self.commonService.hasPermission('PVPH', 'PM');
      }
    }
  }

  canUpdateTrustedIP() {
    const self = this;
    if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      const list = self.commonService.getEntityPermissions('PM_' + self.id);
      if (list.length > 0) {
        return Boolean(list.find(e => e.id === 'PMPIP'));
      } else {
        return self.commonService.hasPermission('PMPIP', 'PM');
      }
    }
  }
  canViewTrustedIP() {
    const self = this;
    if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      const list = self.commonService.getEntityPermissions('PM_' + self.id);
      if (list.length > 0) {
        return Boolean(list.find(e => e.id === 'PVPIP'));
      } else {
        return self.commonService.hasPermission('PVPIP', 'PM');
      }
    }
  }

  removeInvalidIp() {
    const self = this;
    let invalidIndexes = [];
    self.ipList.controls.forEach((element, index) => {
      if (element.invalid) {
        invalidIndexes.push(index);
      }
    });
    invalidIndexes.reverse();
    invalidIndexes.forEach(ele => {
      self.ipList.removeAt(ele);
    });
  }

  createForm(){
    const self =this;
    self.form = self.fb.group({
      key: [null, [Validators.required, Validators.maxLength(24), Validators.pattern('[a-zA-Z0-9_-]+')]],
      value: [null]
    });
  }

  get trustedIPFeatureActive() {
    const self = this;
    if (self.commonService.userDetails && self.commonService.userDetails.b2BEnableTrustedIp) {
      return true;
    }
    return false;
  }

  set enabledIpWhitelist(val) {
    const self = this;
    if (!val) {
      self.removeInvalidIp();
    }
    self.partner.get('agentIPWhitelisting.enabled').patchValue(val);
  }

  get enabledIpWhitelist() {
    const self = this;
    return Boolean(self.partner.get('agentIPWhitelisting.enabled').value);
  }

  get ipList(): FormArray {
    const self = this;
    return self.partner.get('agentIPWhitelisting.list') as FormArray;
  }

  get keyValueList() {
    const self = this;
    return self.partner.get('headers').value;
  }

  get id() {
    const self = this;
    return self.edit.id;
  }
}
