import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { CommonService } from '../../../../utils/services/common.service';
import * as _ from 'lodash'
import { AppService } from '../../../../utils/services/app.service';

@Component({
  selector: 'odp-file-settings',
  templateUrl: './file-settings.component.html',
  styleUrls: ['./file-settings.component.scss']
})
export class FileSettingsComponent implements OnInit {
  @Input() form: FormGroup;
  @Input() edit: any;
  type: any;
  fileSettingForm: FormGroup
  showConnectors: boolean = true;
  connectorId: any;
  connectorList: any;
  storageTypes: any;
  uniqueTypes: Array<any>
  subscriptions: any = {};
  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private appService: AppService
  ) {
    // this.type = 'MONGODB';
  }

  ngOnInit() {
    this.fileSettingForm = this.fb.group({
      type: [''],
      connectorId: ['']
    })
    if (!this.form.get('fileStorage')) {
      this.form.addControl('fileStorage', this.fileSettingForm)
    }
    else {
      this.type = this.form.get('fileStorage').value['type'] || 'MONGODB';
      this.connectorId = this.form.get('fileStorage').value['connectorId']
      this.form.removeControl('fileStorage');
      this.form.addControl('fileStorage', this.fileSettingForm)
    }
    this.getAvailableConnectors();
    if (!this.appService.connectorsList) {
      this.getConnectorsApi();
    }
    else {
      this.getConnectors()
    }
    this.form.get('fileStorage').get('type').setValue(this.type)
    this.form.get('fileStorage').get('connectorId').setValue(this.connectorId)

  }

  getAvailableConnectors() {
    this.storageTypes = this.appService.storageTypes;
  }


  getConnectorsApi() {
    this.subscriptions['getConnectors'] = this.commonService.get('user', `/${this.commonService.app._id}/connector/utils/count`)
      .pipe(switchMap((ev: any) => {
        return this.commonService.get('user', `/${this.commonService.app._id}/connector`, { count: ev, select: 'name,type,_id' });
      }))
      .subscribe(res => {
        this.appService.connectorsList = res;
        this.getConnectors()
      }, err => {
        this.commonService.errorToast(err, 'We are unable to fetch records, please try again later');
      });

  }

  getConnectors() {
    this.connectorList = this.appService.connectorsList;
    if (this.connectorList.length > 0) {
      const differentTypes = this.connectorList.map(ele => ele.type)
      this.uniqueTypes = _.uniq(differentTypes);
      if (this.fileStorageTypes.length > 0) {
        this.form.get('fileStorage').get('connectorId').setValidators([Validators.required])
      }
      if (this.fileStorageTypes.length === 1) {
        this.form.get('fileStorage').get('type').setValue(this.fileStorageTypes[0].label)
      }
    }
  }

  changeType() {

    this.form.get('fileStorage').get('connectorId').setValidators([Validators.required])
    this.connectorId = ''
    this.form.get('fileStorage').get('connectorId').reset()

    this.form.get('fileStorage').get('type').setValue(this.type)
    // this.form.get('fileStorage').get('connectorId').updateValueAndValidity()
  }

  selectConnector() {
    this.form.get('fileStorage').get('connectorId').setValue(this.connectorId)
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



  hasPermission(type: string, entity?: string) {
    return this.commonService.hasPermission(type, entity);
  }

  hasPermissionStartsWith(type: string, entity?: string) {
    return this.commonService.hasPermissionStartsWith(type, entity);
  }

  get typeBasedConnectors() {
    return this.connectorList.length > 0 ? this.connectorList.filter(ele => ele.type === this.type) : []
  }

  get fileStorageTypes() {
    const list = this.connectorList.length > 0 && this.storageTypes.length > 0 ? this.storageTypes.filter(ele => this.uniqueTypes.indexOf(ele.type) > -1 && (ele.category === 'FILE' || ele.category === 'STORAGE')) : []
    return list;
  }

}
