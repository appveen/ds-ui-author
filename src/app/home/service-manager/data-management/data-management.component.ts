import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { App } from 'src/app/utils/interfaces/app';
import { AppService } from 'src/app/utils/services/app.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'odp-data-management',
  templateUrl: './data-management.component.html',
  styleUrls: ['./data-management.component.scss']
})
export class DataManagementComponent implements OnInit {
  @ViewChild('startStopServiceModalTemplate') startStopServiceModalTemplate: TemplateRef<HTMLElement>;
  startStopServiceModalRef: NgbModalRef;
  startStopServiceModal: any;
  retainDataHistory: boolean;
  serviceStatus: any = {};
  showLazyLoader: boolean;
  appData: App;
  oldData: App;
  versionConfig: any;
  defaultVersionValues: Array<any> = [null, '', '-1', '10', '25', '50', '100', '1 months', '3 months', '6 months', '1 years'];
  connectorList: Array<any>

  constructor(
    private commonService: CommonService,
    private ts: ToastrService,
    private appService: AppService
  ) {
    const self = this;
    self.appData = {};
    self.oldData = {};
    self.versionConfig = {};
    self.startStopServiceModal = {};
  }

  ngOnInit(): void {
    const self = this;
    self.getManagementDetails();
    self.getApp(self.commonService.app._id);
    this.connectorList = this.appService.connectorsList
    if (!this.connectorList) {
      this.getConnectors()
    }
  }

  getManagementDetails() {
    const self = this;
    self.commonService.get('serviceManager', `/${this.commonService.app._id}/service/utils/status/count`, { filter: { app: this.commonService.app._id } }).subscribe(res => {
      self.serviceStatus = res;
    }, (err) => {
      self.ts.warning(err.error.message);
    });
  }


  getApp(id: string) {
    const self = this;
    self.showLazyLoader = true;
    self.retainDataHistory = true;
    self.commonService.get('user', '/data/app/' + id, { noApp: true }).subscribe(res => {
      self.appData = Object.assign(self.appData, res);
      if (!self.appData['connectors']) {
        self.appData['connectors'] = {
          data: {
            _id: ''
          },
          file: {
            _id: ''
          }
        };
      }
      self.oldData = self.appService.cloneObject(self.appData);
      self.configureVersionSettings();
      self.showLazyLoader = false;
    }, err => {
      self.showLazyLoader = false;
    });
  }

  configureVersionSettings() {
    const self = this;
    if (!self.appData.serviceVersionValidity) {
      self.appData.serviceVersionValidity = {
        validityType: 'count',
        validityValue: -1
      };
    }
    if (self.appData.serviceVersionValidity.validityValue === '0' || self.appData.serviceVersionValidity.validityValue === 0) {
      self.retainDataHistory = false;
    }
    self.versionConfig.type = self.appData.serviceVersionValidity.validityType;
    const validityValue = self.appData.serviceVersionValidity.validityValue.toString();
    if (+validityValue.split(' ')[0] > 0) {
      const defaultIndex = self.defaultVersionValues.findIndex(e => {
        if (e === validityValue) {
          return e;
        }
      });
      if (!(defaultIndex > -1)) {
        self.versionConfig.value = 'custom';
        self.versionConfig.customValue = validityValue.split(' ')[0];
        self.versionConfig.customValueSuffix = validityValue.split(' ')[1];
        self.versionConfig.isCustomValue = true;
      } else {
        self.versionConfig.value = validityValue;
      }
    } else {
      self.versionConfig.value = validityValue;
    }
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
    self.appData.serviceVersionValidity.validityType = self.versionConfig.type;
    self.appData.serviceVersionValidity.validityValue = value;
  }

  get validityValidator() {
    if (this.versionConfig.customValue > 0 && this.versionConfig.customValue !== null) {
      return true;
    } else if (this.versionConfig.customValue === 0) {
      return false;
    }
  }

  onVersionChange(value) {
    const self = this;
    if (value) {
      self.patchVersionValue(true);
    } else {
      self.retainDataHistory = false;
      self.appData.serviceVersionValidity.validityType = 'count';
      self.appData.serviceVersionValidity.validityValue = 0;
    }
  }

  save() {
    const self = this;
    if (!this.changesDone) {
      return;
    }

    if (this.dataConnectors.length === 1 || !this.appData['connectors']['data']['_id']) {
      this.appData['connectors']['data']['_id'] = this.dataConnectors[0]._id
    }
    if (this.fileConnectors.length === 1 || !this.appData['connectors']['file']['_id']) {
      this.appData['connectors']['file']['_id'] = this.fileConnectors[0]._id
    }
    // if (this.connectorList.length === 1) {
    //   this.appData['connectors']['data']['_id'] = this.connectorList[0]._id
    // }
    self.commonService.put('user', '/data/app/' + self.appData._id, self.appData).subscribe(res => {
      self.oldData = self.appService.cloneObject(self.appData);
      self.ts.success('App saved successfully');
      self.commonService.appUpdates.emit(self.appData);
      self.commonService.app = res;
      self.commonService.appData = res;
    }, err => {
      self.commonService.errorToast(err);
    });
  }



  getConnectors() {
    this.commonService.get('user', `/${this.commonService.app._id}/connector/utils/count`)
      .pipe(switchMap((ev: any) => {
        return this.commonService.get('user', `/${this.commonService.app._id}/connector`, { count: ev });
      }))
      .subscribe(res => {
        this.connectorList = res;
      }, err => {
        this.commonService.errorToast(err, 'We are unable to fetch records, please try again later');
      });

  }


  startStopServiceModel(value) {
    const self = this;
    self.startStopServiceModal.title = `${value} all Services`
    self.startStopServiceModal.message = `Do you want to ${value} all services ?`
    self.startStopServiceModalRef = self.commonService.modal(self.startStopServiceModalTemplate);
    self.startStopServiceModalRef.result.then((close) => {
      if (close) {
        self.updateServicesState(value)
      }
    }, dismiss => { });

  }


  updateServicesState(value) {
    const self = this;
    let endpoint = value == 'Start' ? 'startAll' : 'stopAll'
    self.commonService.put('serviceManager', `/${self.appData._id}/service/utils/${endpoint}`, { app: this.commonService.app._id }).subscribe(res => {
      self.ts.info(`${value} all process initiated !`)
      self.getManagementDetails();
    })

  }


  selectConnector(event, type) {
    this.appData['connectors'][type]['_id'] = event.target.value
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

  get changesDone() {
    const self = this;
    if (JSON.stringify(self.appData) === JSON.stringify(self.oldData)) {
      return false;
    } else {
      return true;
    }
  }

}
