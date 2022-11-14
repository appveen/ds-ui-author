import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { CommonService } from '../../../../utils/services/common.service';
import * as _ from 'lodash'
import { AppService } from '../../../../utils/services/app.service';

@Component({
  selector: 'odp-connector-settings',
  templateUrl: './connector-settings.component.html',
  styleUrls: ['./connector-settings.component.scss']
})
export class FileSettingsComponent implements OnInit {
  @Input() form: FormGroup;
  @Input() edit: any;
  type: any;
  fileSettingForm: FormGroup
  showConnectors: boolean = true;
  connectorId: any;
  connectorList: any;
  selectedType: any = {};
  storageTypes: any;
  uniqueTypes: Array<any>
  subscriptions: any = {};
  fileStorageTypes: any;
  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private appService: AppService
  ) {
    // this.type = 'MONGODB';
  }

  ngOnInit() {
    this.getAvailableConnectors();
    if (!this.appService.connectorsList) {
      this.getConnectorsApi();
    }
    else {
      this.getConnectors()
    }
  }

  getAvailableConnectors() {
    this.storageTypes = this.appService.storageTypes;
  }


  getConnectorsApi() {
    this.subscriptions['getConnectors'] = this.commonService.get('user', `/${this.commonService.app._id}/connector/utils/count`)
      .pipe(switchMap((ev: any) => {
        return this.commonService.get('user', `/${this.commonService.app._id}/connector`, { count: ev });
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
    const temp=this.connectorList.find(ele=> ele._id===this.form.value.connectors.file._id).type;
    const temp1=this.connectorList.find(ele=> ele._id===this.form.value.connectors.data._id).type;
    this.selectedType['file']=this.storageTypes.find(ele=>ele.type===temp).label;
    this.selectedType['data']=this.storageTypes.find(ele=>ele.type===temp1).label;
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

  selectConnector(event, type) {
    this.form.get('connectors').get(type).setValue({
      _id: event.target.value
    })
    const connectorType=this.connectorList.find(ele=> ele._id===event.target.value).type;
    this.selectedType[type]=this.storageTypes.find(ele=>ele.type===connectorType).label;
  }

  get dataConnectors() {
    const list = this.connectorList?.filter(ele => ele.category === 'DB').sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    }) || []
    return list
  }

  get fileConnectors() {
    return this.connectorList?.filter(ele => ele.category === 'STORAGE').sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    }) || []
  }

  checkDefault(id) {
    const defaultIds = [this.commonService.serviceData['connectors']?.data?._id, this.commonService.serviceData['connectors']?.file?._id];
    return defaultIds.indexOf(id) > -1
  }

}
