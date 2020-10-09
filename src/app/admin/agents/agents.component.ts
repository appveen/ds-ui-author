import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, EventEmitter } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { GetOptions, CommonService } from 'src/app/utils/services/common.service';
import { DataGridColumn } from 'src/app/utils/data-grid/data-grid.directive';
import { AppService } from 'src/app/utils/services/app.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'odp-agents',
  templateUrl: './agents.component.html',
  styleUrls: ['./agents.component.scss']
})
export class AgentsComponent implements OnInit, OnDestroy {

  @ViewChild('enterPasswordModalTemplate', { static: false }) enterPasswordModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('downloadAgentModalTemplate', { static: false }) downloadAgentModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('viewPasswordModalTemplate', { static: false }) viewPasswordModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('alertModalTemplate', { static: false }) alertModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('changePasswordModalTemplate', { static: false }) changePasswordModalTemplate: TemplateRef<HTMLElement>;
  logs: Array<any>;
  apiConfig: GetOptions;
  showLazyLoader: boolean;
  agentType: string;
  alertModalTemplateRef: NgbModalRef;
  downloadAgentModalTemplateRef: NgbModalRef;
  viewPasswordModalTemplateRef: NgbModalRef;
  enterPasswordModalTemplateRef: NgbModalRef;
  agentConfig: any;
  totalRecords: number;
  passwordCopied: boolean;
  subscriptions: any;
  tableColumns: Array<DataGridColumn>;
  currentPage: number;
  pageSize: number;
  certificateDetails: any;
  certificateDownloadUrl: string;
  caCertificateDownloadUrl: string;
  odpUpgraded: boolean;
  openDeleteModal: EventEmitter<any>;
  userPassword: string;
  apiCalls: any;
  constructor(public commonService: CommonService,
    private appService: AppService,
    private ts: ToastrService,
    private router: Router) {
    const self = this;
    self.apiConfig = {};
    self.apiConfig.page = 1;
    self.apiConfig.count = 30;
    self.apiConfig.noApp = true;
    self.logs = [];
    self.agentType = 'gateway';
    self.agentConfig = {};
    self.tableColumns = [];
    self.currentPage = 1;
    self.pageSize = 30;
    self.certificateDetails = {};
    self.openDeleteModal = new EventEmitter();
    self.apiCalls = {};
  }

  ngOnInit() {
    const self = this;
    self.agentConfig.arch = 'amd64';
    self.agentConfig.os = 'windows';
    self.tableColumns.push({
      label: 'Name',
      dataKey: 'name',
      show: true
    });
    self.tableColumns.push({
      label: 'Password',
      dataKey: 'password',
      width: 100,
      show: true
    });
    self.tableColumns.push({
      label: 'IP Address',
      dataKey: 'ipAddress',
      width: 130,
      show: true
    });
    self.tableColumns.push({
      label: 'MAC Address',
      dataKey: 'macAddress',
      width: 130,
      show: true
    });
    self.tableColumns.push({
      label: 'Heartbeat',
      dataKey: 'heartbeat',
      width: 80,
      show: true
    });
    self.tableColumns.push({
      label: 'Streak',
      dataKey: 'streak',
      width: 80,
      show: true
    });
    self.tableColumns.push({
      label: 'Status',
      dataKey: 'status',
      width: 100,
      show: true
    });
    self.tableColumns.push({
      label: 'Last Invoked',
      dataKey: 'lastInvokedAt',
      width: 180,
      show: true
    });
    self.tableColumns.push({
      label: '',
      dataKey: '_options',
      width: 420,
      show: true
    });
    // self.getAgentLogs(true);
    self.getCertificateDetails();
    self.checkForUpgrade();
    if (environment.production) {
      self.caCertificateDownloadUrl = `${environment.url.sec}/keys/download/CA`;
      self.certificateDownloadUrl = `${environment.url.sec}/keys/download/IEG`;
    } else {
      self.caCertificateDownloadUrl = `http://localhost/api/a/sec/keys/download/CA`;
      self.certificateDownloadUrl = `http://localhost/api/a/sec/keys/download/IEG`;
    }
    self.getAgentPassword();
  }

  ngOnDestroy() {
    const self = this;
    if (self.downloadAgentModalTemplateRef) {
      self.downloadAgentModalTemplateRef.close();
    }
    if (self.viewPasswordModalTemplateRef) {
      self.viewPasswordModalTemplateRef.close();
    }
    if (self.alertModalTemplateRef) {
      self.alertModalTemplateRef.close();
    }
    if (self.enterPasswordModalTemplateRef) {
      self.enterPasswordModalTemplateRef.close();
    }
  }

  checkForUpgrade() {
    const self = this;
    self.commonService.get('sec', `/keys/b2b`)
      .subscribe(res => {
        self.odpUpgraded = false;
      }, err => {
        self.odpUpgraded = true;
      });
  }

  getCertificateDetails() {
    const self = this;
    self.apiCalls.certDetails = true;
    self.commonService.get('sec', `/keys/IEG`)
      .subscribe(res => {
        self.apiCalls.certDetails = false;
        self.certificateDetails = res;
      }, err => {
        self.apiCalls.certDetails = false;
        self.commonService.errorToast(err);
      });
  }

  resetKeyCertificate() {
    const self = this;
    self.enterPasswordModalTemplateRef = self.commonService.modal(self.enterPasswordModalTemplate);
    self.enterPasswordModalTemplateRef.result.then(close1 => {
      if (close1) {
        self.apiCalls.reLogin = true;
        self.commonService.login({
          username: self.commonService.userDetails.username,
          password: self.userPassword
        }).then(res => {
          self.apiCalls.reLogin = false;
          if (self.odpUpgraded) {
            self.alertModalTemplateRef = self.commonService.modal(self.alertModalTemplate);
            self.alertModalTemplateRef.result.then(close2 => {
              if (close2) {
                self.triggerResetKeyCertificate();
              }
            }, dismiss => { });
          } else {
            self.triggerResetKeyCertificate();
          }
        }).catch(err => {
          self.apiCalls.reLogin = false;
          self.commonService.errorToast(err);
        });
      }
    }, dismiss => { });
  }

  triggerResetKeyCertificate() {
    const self = this;
    self.apiCalls.resetKeyCert = true;
    self.commonService.put('sec', `/keys/reset/IEG`)
      .subscribe(res => {
        self.apiCalls.resetKeyCert = false;
        self.ts.success(res.message);
      }, err => {
        self.apiCalls.resetKeyCert = false;
        self.commonService.errorToast(err);
      });
  }

  getAgentLogsCount() {
    const self = this;
    self.commonService.get('mon', `/${self.agentType}/agent/logs/count`, self.apiConfig)
      .subscribe(res => {
        self.totalRecords = res;
      }, err => {
        self.commonService.errorToast(err);
      });
  }

  getAgentLogs(refresh?: boolean) {
    const self = this;
    if (refresh) {
      self.getAgentLogsCount();
      self.logs = [];
    }
    self.showLazyLoader = true;
    self.commonService.get('mon', `/${self.agentType}/agent/logs`, self.apiConfig).subscribe(res => {
      self.showLazyLoader = false;
      res.forEach((element) => {
        // element['logLevel'] = element.logLevel.charAt(0).toUpperCase() + element.logLevel.slice(1).toLowerCase();
        self.logs.push(element);
      });
    }, err => {
      self.showLazyLoader = false;
    });
  }

  search(value) {
    const self = this;
    if (!value || !value.trim() || value.trim().length < 3) {
      return;
    }
    if (!self.apiConfig.filter) {
      self.apiConfig.filter = {
        type: self.agentType,
        app: self.commonService.app._id
      };
    }
    self.apiConfig.page = 1;
    self.apiConfig.filter.name = '/' + value.trim() + '/';
    self.logs = [];
    self.getAgentLogs(true);
  }

  clearSearch() {
    const self = this;
    self.logs = [];
    self.apiConfig = {
      page: 1,
      count: 30,
      filter: {
        type: self.agentType,
        app: self.commonService.app._id
      },
      noApp: true
    };
    self.getAgentLogs(true);
  }

  downloadIEG() {
    const self = this;
    self.downloadAgentModalTemplateRef = self.commonService.modal(self.downloadAgentModalTemplate, { size: 'lg' });
    self.downloadAgentModalTemplateRef.result.then(close => {
      if (close) {
        self.agentConfig.os = close;
        if (close === 'k8s') {
          self.agentConfig.type = 'k8s';
        } else {
          self.agentConfig.type = 'others';
        }
        self.triggerAgentDownload();
      }
    }, dismiss => { });
  }

  triggerAgentDownload() {
    const self = this;
    const ele: HTMLAnchorElement = document.createElement('a');
    ele.target = '_blank';
    let queryParams;
    if (self.agentConfig.type !== 'k8s') {
      queryParams = `ieg/download/exec?` +
        `os=${self.agentConfig.os}&arch=${self.agentConfig.arch}`;
    } else {
      queryParams = `ieg/download/k8s`;
    }
    if (environment.production) {
      ele.href = `${environment.url.partnerManager}/${queryParams}`;
    } else {
      ele.href = `http://localhost/api/a/pm/${queryParams}`;
    }
    ele.click();
    ele.remove();
  }

  getAgentPassword() {
    const self = this;
    if (!self.agentConfig.password) {
      self.commonService.get('partnerManager', '/agentRegistry/IEG/password').subscribe(res => {
        self.agentConfig.password = res.password;
      }, err => { });
    }
  }

  copyPassword() {
    const self = this;
    self.agentConfig.copied = true;
    self.appService.copyToClipboard(self.agentConfig.password);
    setTimeout(() => {
      self.agentConfig.copied = false;
    }, 3000);
  }


  getStrength(streak: Array<string>) {
    if (streak && streak.length > 0) {
      const successLen = streak.filter(e => e === 'T').length;
      if (successLen === streak.length || successLen === streak.length - 1) {
        return 'high';
      }
      if (successLen === streak.length - 2 || successLen === streak.length - 3) {
        return 'medium';
      }
    }
    return 'low';
  }

  toCapitalize(text: string) {
    const self = this;
    return text ? self.appService.toCapitalize(text) : null;
  }

  sortModelChange(model: any) {
    const self = this;
    self.apiConfig.sort = self.appService.getSortQuery(model);
    self.loadMore({
      page: 1
    });
  }

  loadMore(data: any) {
    const self = this;
    self.apiConfig.page = data.page;
    self.getAgentLogs(true);
  }

  get apiCallsPending() {
    const self = this;
    if (self.apiCalls) {
      return Object.values(self.apiCalls).filter(e => e).length > 0;
    }
    return false;
  }

}
