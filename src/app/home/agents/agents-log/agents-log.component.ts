import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AgGridAngular, AgGridColumn } from 'ag-grid-angular';
import { IDatasource, IGetRowsParams } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { environment } from 'src/environments/environment';
import { DataGridColumn } from 'src/app/utils/data-grid/data-grid.directive';
import { APIConfig } from 'src/app/utils/interfaces/apiConfig';

@Component({
  selector: 'odp-agents-log',
  templateUrl: './agents-log.component.html',
  styleUrls: ['./agents-log.component.scss']
})
export class AgentsLogComponent implements OnInit {

  @ViewChild('agGrid') agGrid: AgGridAngular;
  @ViewChild('newAgentModalTemplate', { static: false }) newAgentModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('viewPasswordModalTemplate', { static: false }) viewPasswordModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('alertModalTemplate', { static: false }) alertModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('downloadAgentModalTemplate', { static: false }) downloadAgentModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('changePasswordModalTemplate', { static: false }) changePasswordModalTemplate: TemplateRef<HTMLElement>;
  agentId: string;
  subscriptions: any;
  apiConfig: APIConfig;
  agentLogObject: any;
  alertModalData: any;
  passwordCopied: boolean;
  agentConfig: any;
  agentPasswordModel: any;
  agentData: any;
  agentType: string;
  newAgentModalTemplateRef: NgbModalRef;
  viewPasswordModalTemplateRef: NgbModalRef;
  alertModalTemplateRef: NgbModalRef;
  downloadAgentModalTemplateRef: NgbModalRef;
  changePasswordModalTemplateRef: NgbModalRef;

  columnDefs: AgGridColumn[];
  dataSource: IDatasource;
  totalCount: number;
  loadedCount: number;
  filterModel: any;
  sortModel: any;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private route: ActivatedRoute,
    private ts: ToastrService) {
    const self = this;
    self.totalCount = 0;
    self.loadedCount = 0;
    self.apiConfig = {
      page: 1,
      count: 30,
      filter: {}
    };
    self.agentPasswordModel = {
      password: '',
      cpassword: ''
    };
    self.agentLogObject = [];
    self.agentConfig = {};
    self.subscriptions = [];
  }

  ngOnInit() {
    const self = this;
    self.agentLogObject = [];
    self.agentConfig.arch = 'amd64';
    self.agentConfig.os = 'windows';
    self.route.params.subscribe(params => {
      if (params.id) {
        self.columnDefs = null;
        self.agentId = params.id;
        self.configureColumns();
      }
    });
    self.dataSource = {
      getRows: async (params: IGetRowsParams) => {
        self.agGrid.api.showLoadingOverlay();
        self.apiConfig.page = Math.ceil((params.endRow / 30));
        self.totalCount = await self.getLogsCount();
        if (self.totalCount > 0) {
          if (self.subscriptions['getLogs_' + self.apiConfig.page]) {
            self.subscriptions['getLogs_' + self.apiConfig.page].unsubscribe();
          }
          self.subscriptions['getLogs_' + self.apiConfig.page] = self.getLogs().subscribe((docs: Array<any>) => {
            self.loadedCount += docs.length;
            if (self.loadedCount < self.totalCount) {
              params.successCallback(docs);
            } else {
              self.totalCount = self.loadedCount;
              params.successCallback([], self.totalCount);
            }
          }, err => {
            console.error(err);
            params.failCallback();
          });
        } else {
          self.agGrid.api.hideOverlay();
          self.agGrid.api.showNoRowsOverlay();
        }
      }
    };
  }

  configureColumns() {
    const self = this;
    self.columnDefs = [];
    const col1 = new AgGridColumn();
    col1.headerName = '#';
    col1.field = '_checkbox';
    col1.checkboxSelection = true;
    col1.pinned = 'left';
    col1.lockPosition = true;
    col1.width = 50;
    self.columnDefs.push(col1);
    const col2 = new AgGridColumn();
    col2.headerName = 'Time Stamp';
    col2.field = 'timeStamp';
    self.columnDefs.push(col2);
    const col3 = new AgGridColumn();
    col3.headerName = 'Level';
    col3.field = 'logLevel';
    self.columnDefs.push(col3);
    const col4 = new AgGridColumn();
    col4.headerName = 'Message';
    col4.field = 'content';
    col4.minWidth = 400;
    col4.flex = true;
    self.columnDefs.push(col4);
  }

  getLogsCount() {
    const self = this;
    return self.commonService.get('mon', `/${self.commonService.app._id}/agent/logs/count`, { filter: self.apiConfig.filter }).toPromise();
  }

  getLogs() {
    const self = this;
    return self.commonService.get('mon', `/${self.commonService.app._id}/agent/logs/`, self.apiConfig);
  }


  filterModified(event) {
    const self = this;

  }

  sortChanged(event) {
    const self = this;
  }

  getAgentDetails() {
    const self = this;
    self.apiConfig.filter['agentID'] = self.agentId;
    self.commonService.get('partnerManager', `/${this.commonService.app._id}/agent`, self.apiConfig).subscribe(res => {
      if (res.length > 0) {
        self.agentLogObject = res;
        self.getHeartbeats();
        self.getInteractions();
        self.fetchPassword();
      }
    });
  }
  getHeartbeats() {
    const self = this;
    const options: GetOptions = {
      select: 'timestamp,heartBeatFrequency,status',
      filter: {
        agentID: self.agentId
      },
      count: 5,
      sort: '-timestamp',
      noApp: true
    };
    self.commonService.get('partnerManager', '/agentMonitoring', options).subscribe(res => {
      if (res.length === 0) {

        self.agentLogObject[0].heartbeat = -1;
        self.agentLogObject[0].streak = [];
      } else {
        self.agentLogObject[0].heartbeat = res[0].heartBeatFrequency;
        self.agentLogObject[0].streak = res.map(e => e.status === 'RUNNING' ? 'T' : 'F').reverse();
      }
    }, err => {
      self.agentLogObject[0].heartbeat = -1;
      self.agentLogObject[0].streak = [];
    });
  }
  getInteractions() {
    const self = this;
    const options: GetOptions = {
      select: 'status',
      filter: {
        '$or': [
          {
            'flowData.block.meta.source': self.agentId
          },
          {
            'flowData.block.meta.target': self.agentId
          }
        ]
      },
      count: 5,
      sort: '-completedTimestamp',
      noApp: true
    };
    self.commonService.get('partnerManager', `/${self.commonService.app._id}/interaction`, options).subscribe(res => {
      if (res.length === 0) {
        self.agentLogObject[0].interactions = [];
      } else {
        self.agentLogObject[0].interactions = res.map(e => {
          if (e.status === 'ERROR') {
            return 'E';
          }
          if (e.status === 'PENDING') {
            return 'P';
          }
          if (e.status === 'SUCCESS') {
            return 'S';
          }
        }).reverse();
        const remain = 5 - self.agentLogObject[0].interactions.length;
        if (remain) {
          for (let i = 0; i < remain; i++) {
            self.agentLogObject[0].interactions.unshift('N');
          }
        }
      }
    }, err => {
      self.agentLogObject[0].heartbeat = -1;
      self.agentLogObject[0].streak = [];
    });
  }
  fetchPassword() {
    const self = this;
    if (!self.agentLogObject.decPassword) {
      self.commonService.get('partnerManager', `/${this.commonService.app._id}/agent/utils/${self.agentLogObject[0]._id}/password`).subscribe(res => {
        self.agentLogObject[0].decPassword = res.password;
      }, err => {
        self.commonService.errorToast(err);
      });
    }
  }
  downloadAppAgent(event: Event, agentId: string) {
    event.preventDefault();
    event.stopPropagation();
    const self = this;
    self.downloadAgentModalTemplateRef = self.commonService.modal(self.downloadAgentModalTemplate, {
      centered: true,
      windowClass: 'download-agent-modal'
    });
    self.downloadAgentModalTemplateRef.result.then(close => {
      if (close) {
        self.triggerAgentDownload(close, 'appagent', agentId);
      }
    }, dismiss => { });
  }

  downloadPartnerAgent(event: Event, agentId: string) {
    event.preventDefault();
    event.stopPropagation();
    const self = this;
    self.downloadAgentModalTemplateRef = self.commonService.modal(self.downloadAgentModalTemplate, {
      centered: true,
      windowClass: 'download-agent-modal'
    });
    self.downloadAgentModalTemplateRef.result.then(close => {
      if (close) {
        self.triggerAgentDownload(close, 'partneragent', agentId);
      }
    }, dismiss => { });
  }
  editAgent(agent: any) {
    const self = this;

    self.agentData = agent;
    self.agentData.isEdit = true;
    self.newAgentModalTemplateRef = self.commonService.modal(self.newAgentModalTemplate);
    self.newAgentModalTemplateRef.result.then(close => {
      if (close) {
        if (!self.agentData.name) {
          return;
        }
        delete self.agentData.isEdit;
        self.commonService.put('partnerManager', `/${this.commonService.app._id}/agent/` + agent._id, self.agentData).subscribe(res => {
          if (res) {
            self.ts.success('Agent Saved Sucessfully');
          }

        }, err => {
          self.commonService.errorToast(err);
        });
      }
    }, dismiss => { });
  }
  openChangePasswordModel(agent: any) {
    const self = this;
    self.agentPasswordModel.agent = agent;
    self.changePasswordModalTemplateRef = self.commonService.modal(self.changePasswordModalTemplate);
    self.changePasswordModalTemplateRef.result.then(close => {
      self.agentPasswordModel = {};
    }, dismiss => {
      self.agentPasswordModel = {};
    });
  }

  changePassword() {
    const self = this;
    self.agentPasswordModel.message = null;
    if (!self.agentPasswordModel || !self.agentPasswordModel.agent) {
      if (self.changePasswordModalTemplateRef) {
        self.changePasswordModalTemplateRef.close(false);
      }
      return;
    }
    if (self.agentPasswordModel.password !== self.agentPasswordModel.cpassword) {
      self.agentPasswordModel.message = 'Passwords do not match';
      return;
    }
    self.commonService.put('partnerManager', `/${this.commonService.app._id}/agent/utils/${self.agentPasswordModel.agent._id}/password`, {
      password: self.agentPasswordModel.password
    }).subscribe(res => {
      self.ts.success(res.message);
      self.agentPasswordModel.agent.decPassword = self.agentPasswordModel.password;
      if (self.changePasswordModalTemplateRef) {
        self.changePasswordModalTemplateRef.close(false);
      }
    }, err => {
      if (self.changePasswordModalTemplateRef) {
        self.changePasswordModalTemplateRef.close(false);
      }
      self.commonService.errorToast(err);
    });
  }


  hasPermission(type: string) {
    const self = this;
    return self.commonService.hasPermission(type);
  }

  toggleAgentStatus(agent: any, type: string) {
    const self = this;
    self.alertModalData = {};
    if (type === 'disable') {
      self.alertModalData.title = 'Disable agent';
      self.alertModalData.message = 'Are you sure you want to disable <span class="text-dark font-weight-bold">'
        + agent.name + '</span> agent?';
    } else if (type === 'enable') {
      self.alertModalData.title = 'Enable agent';
      self.alertModalData.message = 'Are you sure you want to enable <span class="text-dark font-weight-bold">'
        + agent.name + '</span> agent?';
    } else {
      self.alertModalData.title = 'Stop agent';
      self.alertModalData.message = 'Are you sure you want to stop <span class="text-dark font-weight-bold">'
        + agent.name + '</span> agent?';
    }
    self.alertModalTemplateRef = self.commonService.modal(self.alertModalTemplate);
    self.alertModalTemplateRef.result.then(close => {
      if (close) {
        self.commonService.put('partnerManager', `/${this.commonService.app._id}/agent/utils/${agent._id}/${type}`).subscribe(res => {
          self.ts.success(res.message);
        }, err => {
          self.commonService.errorToast(err);
        });
      }
    }, dismiss => { });
  }
  showPassword() {
    const self = this;
    self.viewPasswordModalTemplateRef = self.commonService.modal(self.viewPasswordModalTemplate);
    self.viewPasswordModalTemplateRef.result.then(close => {
    }, dismiss => {
    });
  }
  copyPassword(text: string) {
    const self = this;
    self.appService.copyToClipboard(text);
    self.passwordCopied = true;
    setTimeout(() => {
      self.passwordCopied = false;
    }, 3000);
  }

  triggerAgentDownload(os: string, type: string, agentId?: string) {
    const self = this;
    const ele: HTMLAnchorElement = document.createElement('a');
    ele.target = '_blank';
    let queryParams = `${self.commonService.app._id}/download/${type}${agentId ? '/' + agentId : ''}/`;
    if (os === 'k8s') {
      queryParams += 'k8s';
    } else {
      queryParams += `exec?os=${os}&arch=${self.agentConfig.arch}`;
    }
    if (environment.production) {
      ele.href = `${environment.url.partnerManager}/${queryParams}`;
    } else {
      ele.href = `http://localhost/api/a/pm/${queryParams}`;
    }
    ele.click();
    ele.remove();
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


  clearFilter() {
    const self = this;
    self.filterModel = null;
    self.apiConfig.filter = {
      agentId: self.agentId,
      app: self.commonService.app._id
    };
    self.agGrid.api.purgeInfiniteCache();
  }
}
