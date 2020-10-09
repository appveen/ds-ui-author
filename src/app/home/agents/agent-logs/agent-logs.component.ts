import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AgGridAngular, AgGridColumn } from 'ag-grid-angular';
import { IDatasource, IGetRowsParams } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { environment } from 'src/environments/environment';
import { APIConfig } from 'src/app/utils/interfaces/apiConfig';
import { LogsGridCellComponent } from './logs-grid-cell/logs-grid-cell.component';
import { LogsGridFilterComponent } from './logs-grid-filter/logs-grid-filter.component';

@Component({
  selector: 'odp-agent-logs',
  templateUrl: './agent-logs.component.html',
  styleUrls: ['./agent-logs.component.scss']
})
export class AgentLogsComponent implements OnInit {

  @ViewChild('agGrid') agGrid: AgGridAngular;
  @ViewChild('newAgentModalTemplate', { static: false }) newAgentModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('alertModalTemplate', { static: false }) alertModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('downloadAgentModalTemplate', { static: false }) downloadAgentModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('changePasswordModalTemplate', { static: false }) changePasswordModalTemplate: TemplateRef<HTMLElement>;
  agentId: string;
  subscriptions: any;
  apiConfig: APIConfig;
  agentDetails: any;
  alertModalData: any;
  passwordCopied: boolean;
  agentConfig: any;
  agentPasswordModel: any;
  agentData: any;
  agentType: string;
  newAgentModalTemplateRef: NgbModalRef;
  alertModalTemplateRef: NgbModalRef;
  downloadAgentModalTemplateRef: NgbModalRef;
  changePasswordModalTemplateRef: NgbModalRef;

  columnDefs: AgGridColumn[];
  dataSource: IDatasource;
  totalCount: number;
  loadedCount: number;
  filterModel: any;
  sortModel: any;
  togglePassword: boolean;
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
      filter: {},
      select: 'rawData,logLevel,content,timeStamp,ipAddress',
      noApp: true
    };
    self.agentPasswordModel = {
      password: '',
      cpassword: ''
    };
    self.agentDetails = {};
    self.agentConfig = {};
    self.subscriptions = [];
  }

  ngOnInit() {
    const self = this;
    self.agentConfig.arch = 'amd64';
    self.agentConfig.os = 'windows';
    self.route.params.subscribe(params => {
      if (params.id) {
        self.columnDefs = null;
        self.agentId = params.id;
        self.configureColumns();
        self.getAgentDetails();
      }
    });
    self.dataSource = {
      getRows: async (params: IGetRowsParams) => {
        self.agGrid.api.showLoadingOverlay();
        self.apiConfig.page = Math.ceil((params.endRow / 30));
        if (self.apiConfig.page === 1) {
          self.loadedCount = 0;
        }
        if (!self.apiConfig.filter) {
          self.apiConfig.filter = {};
        }
        self.apiConfig.filter['agentId'] = self.agentId;
        self.apiConfig.sort = self.appService.getSortFromModel(self.agGrid.api.getSortModel());
        self.totalCount = await self.getLogsCount();
        if (self.totalCount > 0) {
          if (self.subscriptions['getRows_' + self.apiConfig.page]) {
            self.subscriptions['getRows_' + self.apiConfig.page].unsubscribe();
          }
          self.subscriptions['getRows_' + self.apiConfig.page] = self.getLogs().subscribe((docs: Array<any>) => {
            self.loadedCount += docs.length;
            self.agGrid.api.hideOverlay();
            if (self.loadedCount < self.totalCount) {
              params.successCallback(docs);
            } else {
              self.totalCount = self.loadedCount;
              params.successCallback(docs, self.totalCount);
            }
          }, err => {
            self.agGrid.api.hideOverlay();
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
    col1.cellRendererFramework = LogsGridCellComponent;
    col1.width = 50;
    self.columnDefs.push(col1);
    const col2 = new AgGridColumn();
    col2.headerName = 'Time Stamp';
    col2.field = 'timeStamp';
    col2.floatingFilterComponentFramework = LogsGridFilterComponent;
    col2.cellRendererFramework = LogsGridCellComponent;
    col2.sortable = true;
    col2.resizable = true;
    col2.suppressMovable = true;
    col2.filter = 'agTextColumnFilter';
    col2.width = 180;
    col2.sort = 'desc';
    self.columnDefs.push(col2);
    const col3 = new AgGridColumn();
    col3.headerName = 'Level';
    col3.field = 'logLevel';
    col3.floatingFilterComponentFramework = LogsGridFilterComponent;
    col3.cellRendererFramework = LogsGridCellComponent;
    col3.sortable = true;
    col3.resizable = true;
    col3.suppressMovable = true;
    col3.filter = 'agTextColumnFilter';
    col3.width = 100;
    self.columnDefs.push(col3);
    const col4 = new AgGridColumn();
    col4.headerName = 'Message';
    col4.field = 'content';
    col4.floatingFilterComponentFramework = LogsGridFilterComponent;
    col4.cellRendererFramework = LogsGridCellComponent;
    col4.sortable = true;
    col4.resizable = true;
    col4.suppressMovable = true;
    col4.filter = 'agTextColumnFilter';
    col4.minWidth = 400;
    col4.flex = true;
    self.columnDefs.push(col4);
  }

  getAgentDetails() {
    const self = this;
    const options = {
      count: 1,
      select: 'name,status,type,agentID,agentId,ipAddress,macAddress,encryptFile,retainFileOnError,retainFileOnSuccess',
      filter: {
        agentID: self.agentId
      }
    };
    self.commonService.get('partnerManager', '/agentRegistry', options).subscribe(res => {
      if (res.length > 0) {
        self.agentDetails = res[0];
        self.fetchPassword();
      }
    });
  }

  getLogsCount() {
    const self = this;
    return self.commonService.get('mon', `/${self.commonService.app._id}/agent/logs/count`, {
      filter: self.apiConfig.filter,
      noApp: true
    }).toPromise();
  }

  getLogs() {
    const self = this;
    return self.commonService.get('mon', `/${self.commonService.app._id}/agent/logs/`, self.apiConfig);
  }

  gridReady(event) {
    const self = this;
    self.sortModel = self.agGrid.api.getSortModel();
  }


  filterModified(event) {
    const self = this;
    const filter = [];
    const filterModel = self.agGrid.api.getFilterModel();
    self.filterModel = filterModel;
    if (filterModel) {
      Object.keys(filterModel).forEach(key => {
        try {
          if (filterModel[key].filter) {
            filter.push(JSON.parse(filterModel[key].filter));
          }
        } catch (e) {
          console.error(e);
        }
      });
    }
    if (filter.length > 0) {
      self.apiConfig.filter = { $and: filter };
    } else {
      self.apiConfig.filter = null;
    }
    if (!environment.production) {
      console.log('Filter Modified', filterModel);
    }
  }

  sortChanged(event) {
    const self = this;
    const sortModel = self.agGrid.api.getSortModel();
    self.sortModel = sortModel;
    if (!environment.production) {
      console.log('Sort Modified', sortModel);
    }
  }

  fetchPassword() {
    const self = this;
    if (!self.agentDetails.decPassword) {
      self.commonService.get('partnerManager', '/agentRegistry/' + self.agentDetails._id + '/password').subscribe(res => {
        self.agentDetails.decPassword = res.password;
      }, err => {
        self.commonService.errorToast(err);
      });
    }
  }

  downloadAgent(event: Event, agentId: string, type: string) {
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
        self.commonService.put('partnerManager', '/agentRegistry/' + agent._id, self.agentData).subscribe(res => {
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
    self.commonService.put('partnerManager', '/agentRegistry/' + self.agentPasswordModel.agent._id + '/password', {
      password: self.agentPasswordModel.password
    }).subscribe(res => {
      self.ts.success(res.message);
      self.agentPasswordModel.agent.decPassword = self.agentPasswordModel.password;
      self.agentDetails.decPassword = self.agentPasswordModel.password;
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
        self.commonService.put('partnerManager', `/agentRegistry/${agent._id}/${type}`).subscribe(res => {
          self.ts.success(res.message);
        }, err => {
          self.commonService.errorToast(err);
        });
      }
    }, dismiss => { });
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


  clearFilter() {
    const self = this;
    self.filterModel = null;
    self.apiConfig.filter = {
      agentId: self.agentId,
      app: self.commonService.app._id
    };
    self.agGrid.api.setFilterModel(null);
  }

  clearSort() {
    const self = this;
    self.sortModel = null;
    self.agGrid.api.setSortModel([{ colId: 'timeStamp', sort: 'desc' }]);
  }

  get hasFilter() {
    const self = this;
    if (self.filterModel) {
      return Object.keys(self.filterModel).length > 0;
    }
    return false;
  }

  get hasSort() {
    const self = this;
    if (!self.sortModel
      || self.sortModel.findIndex(e => e.colId === 'timeStamp') === -1
      || self.sortModel.length !== 1) {
      return true;
    }
    return false;
  }
}
