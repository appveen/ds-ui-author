import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { VersionConfig } from 'src/app/utils/interfaces/schemaBuilder';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-data-settings',
  templateUrl: './data-settings.component.html',
  styleUrls: ['./data-settings.component.scss']
})
export class DataSettingsComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() edit: any;
  @Input() versionConfig: VersionConfig;
  retainDataHistory: boolean;
  defaultVersionValues: Array<any> = [null, '', '-1', '10', '25', '50', '100', '1 months', '3 months', '6 months', '1 years'];
  subscriptions: any = {};
  simpleDate: boolean;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private ts: ToastrService) {
    this.versionConfig = {
      type: 'count',
      value: '-1',
    };
    this.retainDataHistory = true;
  }

  ngOnInit() {
    if (this.versionConfig.value === '0' || this.form.get('versionValidity.validityValue').value.toString() === '0') {
      this.retainDataHistory = false;
    }
    this.form.get('versionValidity').valueChanges.subscribe(_val => {
      if (this.form.get('versionValidity.validityType').value === 'count'
        && this.form.get('versionValidity.validityValue').value === 0) {
        this.retainDataHistory = false;
      } else {
        this.retainDataHistory = true;

      }
    });
    // this.simpleDate = this.form.get('simpleDate').value;
  }

  patchVersionValue(reset?) {
    let value;
    if (reset) {
      if (this.versionConfig.type === 'count') {
        this.versionConfig = {
          type: 'count',
          value: '-1',
          customValue: 10
        };
      } else {
        this.versionConfig = {
          type: 'time',
          value: '',
          customValue: 10,
          customValueSuffix: 'days'
        };
      }
    }
    this.versionConfig.isCustomValue = false;
    if (this.versionConfig.value === 'custom') {
      this.versionConfig.isCustomValue = true;
      value = this.versionConfig.customValue >= 0 ? this.versionConfig.customValue.toString() : null;
      if (value && this.versionConfig.type === 'time') {
        value += ' ' + this.versionConfig.customValueSuffix;
      }
    } else {
      value = this.versionConfig.value;
    }
    this.form.get('versionValidity').markAsDirty();
    this.form.get('versionValidity.validityType').patchValue(this.versionConfig.type);
    this.form.get('versionValidity.validityValue').patchValue(value);
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
    if (value) {
      this.patchVersionValue(true);
    } else {
      this.retainDataHistory = false;
      this.form.get('versionValidity').markAsDirty();
      this.form.get('versionValidity.validityType').patchValue('count');
      this.form.get('versionValidity.validityValue').patchValue(0);
    }

  }

  onDateChange(value) {
    this.form.get('simpleDate').patchValue(value);
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
