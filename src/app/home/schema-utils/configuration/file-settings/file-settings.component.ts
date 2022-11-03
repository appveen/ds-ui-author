import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { CommonService } from '../../../../utils/services/common.service';
import * as _ from 'lodash'

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
    private fb: FormBuilder
  ) {
    this.type = 'MongoDB';
    this.storageTypes = [{ label: 'MongoDB', category: 'DB' },
    { label: 'MySQL', category: 'DB' },
    { label: 'PostgreSQL', category: 'DB' },
    { label: 'SFTP', category: 'SFTP' },
    { label: 'Apache Kafka', category: 'MESSAGING' },
    { label: 'Azure Blob Storage', category: 'STORAGE' },
    { label: 'Amazon S3', category: 'STORAGE' },
    { label: 'Google Cloud Storage', category: 'STORAGE' }]
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
      this.type = this.form.get('fileStorage').value['type'] || 'MongoDB';
      this.connectorId = this.form.get('fileStorage').value['connectorId']
      this.form.removeControl('fileStorage');
      this.form.addControl('fileStorage', this.fileSettingForm)
    }
    this.getConnectors();
    this.form.get('fileStorage').get('type').setValue(this.type)
    this.form.get('fileStorage').get('connectorId').setValue(this.connectorId)

  }

  getConnectors() {
    let differentTypes = []
    if (this.subscriptions?.['getConnectors']) {
      this.subscriptions['getConnectors'].unsubscribe();
    }
    this.connectorList = [];
    this.subscriptions['getConnectors'] = this.commonService.get('user', `/${this.commonService.app._id}/connector/utils/count`)
      .pipe(switchMap((ev: any) => {
        return this.commonService.get('user', `/${this.commonService.app._id}/connector`, { count: ev, select: 'name,type,_id' });
      }))
      .subscribe(res => {
        if (res.length > 0) {
          res.forEach(_connector => {
            this.connectorList.push(_connector);
            differentTypes.push(_connector.type)
          });
          this.uniqueTypes = _.uniq(differentTypes);
          if (this.fileStorageTypes.length > 0) {
            this.form.get('fileStorage').get('connectorId').setValidators([Validators.required])
          }
          if (this.fileStorageTypes.length === 1) {
            this.form.get('fileStorage').setValue(this.fileStorageTypes[0].label)
          }
        }
      }, err => {
        this.commonService.errorToast(err, 'We are unable to fetch records, please try again later');
      });

  }

  changeType() {
    if (this.type !== 'MongoDB') {
      this.form.get('fileStorage').get('connectorId').setValidators([Validators.required])
    }
    else {
      this.form.get('fileStorage').get('connectorId').clearValidators()
      this.connectorId = ''
      this.form.get('fileStorage').get('connectorId').reset()
    }
    this.form.get('fileStorage').get('type').setValue(this.type)
    this.form.get('fileStorage').get('connectorId').updateValueAndValidity()
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
    const list = this.connectorList.length > 0 && this.storageTypes.length > 0 ? this.storageTypes.filter(ele => this.uniqueTypes.indexOf(ele.label) > -1) : []
    return list;
  }

}
