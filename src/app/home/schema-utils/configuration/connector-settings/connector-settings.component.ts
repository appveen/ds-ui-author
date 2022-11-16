import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { CommonService } from '../../../../utils/services/common.service';
import * as _ from 'lodash'
import { AppService } from '../../../../utils/services/app.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'odp-connector-settings',
  templateUrl: './connector-settings.component.html',
  styleUrls: ['./connector-settings.component.scss']
})
export class ConnectorSettingsComponent implements OnInit {
  @Input() form: FormGroup;
  @Input() edit: any;
  @ViewChild('schemaToggleTemplate') schemaToggleTemplate: TemplateRef<HTMLElement>;
  schemaToggleTemplateRef: NgbModalRef;
  toggleTemplateRef: NgbModalRef;
  toggleSchemaModal: any;
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
  mongoList: any[];
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
        return this.commonService.get('user', `/${this.commonService.app._id}/connector`, { count: ev, select: '_id, name, category, type, options, _metadata' });
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
    this.mongoList = this.appService.connectorsList.filter(ele => ele.type === 'MONGODB');
    const temp = this.connectorList.find(ele => ele._id === this.form.value.connectors.file._id).type;
    const temp1 = this.connectorList.find(ele => ele._id === this.form.value.connectors.data._id).type;
    this.selectedType['file'] = this.storageTypes.find(ele => ele.type === temp).label;
    this.selectedType['data'] = this.storageTypes.find(ele => ele.type === temp1).label;
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

  selectConnector(event: any, type: string) {
    this.form.get('connectors').get(type).setValue({
      _id: event.target.value
    })
    const connectorType = this.connectorList.find(ele => ele._id === event.target.value).type;
    this.selectedType[type] = this.storageTypes.find(ele => ele.type === connectorType).label;
  }

  set tableName(name: string) {
    const data = this.form.get('connectors').get('data').value;
    data.options = {
      tableName: name
    };
    this.form.get('connectors').get('data').setValue(data);
  }

  get tableName() {
    const data = this.form.get('connectors').get('data').value;
    if (data && data.options && data.options.tableName) {
      return data.options.tableName;
    }
    return null;
  }

  get dataConnectors() {
    const typeList = this.form.get('schemaFree').value ? this.mongoList : this.connectorList
    const list = typeList?.filter(ele => ele.category === 'DB').sort((a, b) => {
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

  toggleSchemaType(schemaFree: boolean) {
    const self = this;
    if (!this.edit || !this.edit.status) {
      return false;
    }
    if (schemaFree) {
      self.toggleSchemaModal = {
        title: 'Enable Schema Free',
        message: 'Allows you to use Appcenter as a repository for unstructured data storage.',
        info: '(Enabling schema free will remove all the Validations)'
      };
    } else {
      self.toggleSchemaModal = {
        title: 'Enabling Schema Designer',
        message: 'Define data in collection, existing data will be maintained but might not be accessible. New documents will require validations',
        info: ''
      };
    }
    if (self.schemaToggleTemplateRef) {
      self.schemaToggleTemplateRef.close(false);
    }
    self.schemaToggleTemplateRef = self.commonService.modal(self.schemaToggleTemplate);
    self.schemaToggleTemplateRef.result.then((response) => {
      if (response) {
        if (self.form && self.form.get('schemaFree')) {
          // if (schemaFree) {
          //   self.schemaFreeConfiguration();
          // }

          self.form.get('schemaFree').patchValue(schemaFree);
        }
      }
    }, dismiss => { });

  }

}
