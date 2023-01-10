import { Component, EventEmitter, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
// import { AgGridAngular, AgGridColumn } from 'ag-grid-angular';
// import { IDatasource, IGetRowsParams } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';

import * as moment from 'moment';
import { APIConfig } from 'src/app/utils/interfaces/apiConfig';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Breadcrumb } from '../../../utils/interfaces/breadcrumb';
import * as _ from 'lodash'

@Component({
  selector: 'odp-agents-log',
  templateUrl: './agents-log.component.html',
  styleUrls: ['./agents-log.component.scss']
})
export class AgentsLogComponent implements OnInit {

  // @ViewChild('agGrid') agGrid: AgGridAngular;
  @ViewChild('viewPasswordModalTemplate', { static: false }) viewPasswordModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('alertModalTemplate', { static: false }) alertModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('downloadAgentModal') downloadAgentModal: HTMLElement;
  downloadAgentModalRef: NgbModalRef;
  @ViewChild('changePasswordModalTemplate', { static: false }) changePasswordModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('agentDetailsModal') agentDetailsModal: HTMLElement;
  agentDetailsModalRef: NgbModalRef;
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
  viewPasswordModalTemplateRef: NgbModalRef;
  alertModalTemplateRef: NgbModalRef;
  changePasswordModalTemplateRef: NgbModalRef;

  // columnDefs: AgGridColumn[];
  // dataSource: IDatasource;
  totalCount: number;
  loadedCount: number;
  filterModel: any;
  sortModel: any;
  showLazyLoader: boolean = false;
  agentDetails: any;
  showSettingsDropdown: boolean = false;
  showPasswordSide: boolean = false;
  showPassword: boolean = false;
  resetPasswordForm: FormGroup;
  showEditAgentWindow: boolean = false;
  alertModal: {
    statusChange?: boolean;
    title: string;
    message: string;
  };
  openDeleteModal: EventEmitter<any> = new EventEmitter();
  breadcrumbPaths: Array<Breadcrumb>;
  completeLogs: Array<any> = [];
  constructor(private commonService: CommonService,
    private appService: AppService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
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
    self.sortModel = {};
    this.resetPasswordForm = this.fb.group({
      password: [null],
      cpassword: [null, [Validators.required]],
    });
    this.alertModal = {
      statusChange: false,
      title: '',
      message: '',
    };
    self.breadcrumbPaths = [];
  }

  ngOnInit() {
    const self = this;
    self.agentLogObject = [];
    self.agentConfig.arch = 'amd64';
    self.agentConfig.os = 'windows';
    self.route.params.subscribe(params => {
      if (params.id) {
        // self.columnDefs = null;
        self.agentId = params.id;

        // self.configureColumns();
      }
    });
    self.breadcrumbPaths.push({
      active: false,
      label: 'Agents',
      url: '/app/' + self.commonService.app._id + '/agent'
    });
    this.getAgentDetails();

  }

  // getLogsCount() {
  //   const self = this;
  //   return self.commonService.get('mon', `/${self.commonService.app._id}/agent/logs/count`, { filter: self.apiConfig.filter }).toPromise();
  // }

  getLogs() {
    const self = this;
    this.showLazyLoader = true;
    self.commonService.get('partnerManager', `/${self.commonService.app._id}/agent/utils/${this.agentDetails.agentId}/logs`, {}).subscribe(res => {
      this.agentLogObject = res.agentLogs;
      this.completeLogs = res.agentLogs;
      this.showLazyLoader = false;
    });
  }

  filterLevel(event) {
    console.log(event.target.value)
    if (event.target.value !== 'ALL') {
      this.agentLogObject = this.completeLogs.filter(ele => ele.logLevel === event.target.value)
    }
    else {
      this.agentLogObject = _.cloneDeep(this.completeLogs)
    }
  }

  getAgentDetails() {
    const self = this;
    self.apiConfig.filter['_id'] = self.agentId;
    self.commonService.get('partnerManager', `/${this.commonService.app._id}/agent`, self.apiConfig).subscribe(res => {
      if (res.length > 0) {
        self.agentDetails = res[0];
        self.breadcrumbPaths.push({
          active: true,
          label: this.agentDetails.name
        });
        this.commonService.changeBreadcrumb(this.breadcrumbPaths)
        self.getAgentPassword(self.agentDetails._id)
        this.getLogs();
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

  // fetchPassword() {
  //   const self = this;
  //   if (!self.agentLogObject.decPassword) {
  //     self.commonService.get('partnerManager', `/${this.commonService.app._id}/agent/utils/${self.agentLogObject[0]._id}/password`).subscribe(res => {
  //       self.agentLogObject[0].decPassword = res.password;
  //     }, err => {
  //       self.commonService.errorToast(err);
  //     });
  //   }
  // }
  // downloadAppAgent(event: Event, agentId: string) {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   const self = this;
  //   self.downloadAgentModalTemplateRef = self.commonService.modal(self.downloadAgentModalTemplate, {
  //     centered: true,
  //     windowClass: 'download-agent-modal'
  //   });
  //   self.downloadAgentModalTemplateRef.result.then(close => {
  //     if (close) {
  //       self.triggerAgentDownload(close, 'appagent', agentId);
  //     }
  //   }, dismiss => { });
  // }

  openDownloadAgentWindow(agent: any) {
    this.downloadAgentModalRef = this.commonService.modal(this.downloadAgentModal, { size: 'lg' });
    this.downloadAgentModalRef.result.then(close => {
      if (close && typeof close == 'string') {
        const os = close.split('-')[0];
        const arch = close.split('-')[1];
        const url = environment.url.partnerManager + `/${this.commonService.app._id}/agent/utils/${agent._id}/download/exec?os=${os}&arch=${arch}`;
        window.open(url, '_blank');
      }
    }, dismiss => { });
  }

  canEditAgent() {
    if (
      this.commonService.isAppAdmin ||
      this.commonService.userDetails.isSuperAdmin
    ) {
      return true;
    } else {
      const list2 = this.commonService.getEntityPermissions('AGENT');
      return Boolean(
        list2.find((e: any) => e.id.startsWith('PMA'))
      );
    }
  }


  editAgent() {
    const self = this;
    self.commonService.put('partnerManager', `/${this.commonService.app._id}/agent/` + self.agentDetails._id, self.agentDetails).subscribe(res => {
      if (res) {
        self.ts.success('Agent Saved Sucessfully');
        this.showEditAgentWindow = false;
      }

    }, err => {
      self.commonService.errorToast(err);
      this.showEditAgentWindow = false;
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
    // self.agGrid.api.purgeInfiniteCache();
  }

  convertDate(dateString) {
    const date = new Date(dateString);
    return moment(date).format('DD-MMM\'YY, hh:mm:ss A')
  }


  applySort(field: string) {
    if (!this.sortModel[field]) {
      this.sortModel = {};
      this.sortModel[field] = 1;
    } else if (this.sortModel[field] == 1) {
      this.sortModel[field] = -1;
    } else {
      delete this.sortModel[field];
    }
  }

  test() {
    this.showPasswordSide = true;
  }

  copyPassword(password) {
    const self = this;
    self.appService.copyToClipboard(password);
    self.ts.success('Password copied successfully');
  }


  getAgentPassword(id) {
    this.commonService.get('partnerManager', `/${this.commonService.app._id}/agent/utils/${id}/password`
    ).subscribe(res => {
      this.agentDetails['thePassword'] = res?.password || ''
    }, err => {
      this.commonService.errorToast(err);
    });
  }

  resetPassword() {
    this.resetPasswordForm.get('password').markAsDirty();
    this.resetPasswordForm.get('cpassword').markAsDirty();
    const payload = {
      password: this.resetPasswordForm.get('password').value
    }
    if (this.resetPasswordForm.invalid) {
      return;
    } else {
      this.commonService.put('partnerManager', `/${this.commonService.app._id}/agent/utils/${this.agentDetails._id}/password`, payload)
        .subscribe(() => {
          this.resetPasswordForm.reset()
          this.ts.success('Password changed successfully');
          this.showPassword = false
          this.showPasswordSide = false
        }, err => {
          this.resetPasswordForm.reset()
          this.showPassword = false
          this.showPasswordSide = false
          this.commonService.errorToast(err, 'Unable to process request');
        });
    }
  }

  triggerAgentEdit() {
    if (!this.agentData.name) {
      return;
    }
    delete this.agentData.isEdit;
    this.showEditAgentWindow = false;
    this.showLazyLoader = true;
    this.commonService.post('partnerManager', `/${this.commonService.app._id}/agent`, this.agentData).subscribe(res => {
      this.showLazyLoader = false;
      // this.getAgentList();
    }, err => {
      this.showLazyLoader = false;
      this.commonService.errorToast(err);
    });
  }


  deleteAgent() {
    this.alertModal.statusChange = false;
    this.alertModal.title = 'Delete Agent';
    this.alertModal.message = 'Are you sure you want to delete <span class="text-delete font-weight-bold">'
      + this.agentDetails.name + '</span> Agent?';
    this.openDeleteModal.emit(this.alertModal);
  }

  openAgentDetailsWindow(agent: any) {
    this.agentData = agent;
    this.getAgentPassword(agent._id)
    this.agentDetailsModalRef = this.commonService.modal(this.agentDetailsModal, { size: 'md' });
    this.agentDetailsModalRef.result.then(close => { }, dismiss => { });
  }



  closeDeleteModal(data) {
    const self = this;
    if (data) {
      // const url = '/admin/app/' + data._id;
      // self.showLazyLoader = true;
      //   self.subscriptions['deleteApp'] = self.commonService
      //     .delete('user', url)
      //     .subscribe(
      //       (d) => {
      //         self.ts.success('App deleted successfully');
      //         self.appOptions[data.appIndex] = false;
      //         self.getApps();
      //       },
      //       (err) => {
      //         self.showLazyLoader = false;
      //         self.commonService.errorToast(
      //           err,
      //           'Unable to delete, please try again later'
      //         );
      //       }
      //     );
      // }
    }
  }


  get matchPwd() {
    const self = this;
    return (
      self.resetPasswordForm.get('password').value !==
      self.resetPasswordForm.get('cpassword').value
    );
  }

  get pwdError() {
    const self = this;
    return (
      (self.resetPasswordForm.get('password').dirty &&
        self.resetPasswordForm.get('password').hasError('required')) ||
      (self.resetPasswordForm.get('password').dirty &&
        self.resetPasswordForm.get('password').hasError('minlength')) ||
      (self.resetPasswordForm.get('password').dirty &&
        self.resetPasswordForm.get('password').hasError('pattern'))
    );
  }

  get cPwdError() {
    const self = this;
    return (
      (self.resetPasswordForm.get('cpassword').dirty &&
        self.resetPasswordForm.get('cpassword').hasError('required')) ||
      (self.resetPasswordForm.get('cpassword').dirty && self.matchPwd)
    );
  }


}
