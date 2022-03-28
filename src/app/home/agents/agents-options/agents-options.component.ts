import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, Input, EventEmitter, Output } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'odp-agents-options',
  templateUrl: './agents-options.component.html',
  styleUrls: ['./agents-options.component.scss']
})
export class AgentsOptionsComponent implements OnInit, OnDestroy {

  @Input() activateOption: EventEmitter<any>;
  @Output() output: EventEmitter<any>;
  @ViewChild('newAgentModalTemplate', { static: false }) newAgentModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('alertModalTemplate', { static: false }) alertModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('downloadAgentModalTemplate', { static: false }) downloadAgentModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('viewPasswordModalTemplate', { static: false }) viewPasswordModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('changePasswordModalTemplate', { static: false }) changePasswordModalTemplate: TemplateRef<HTMLElement>;
  newAgentModalTemplateRef: NgbModalRef;
  downloadAgentModalTemplateRef: NgbModalRef;
  viewPasswordModalTemplateRef: NgbModalRef;
  alertModalTemplateRef: NgbModalRef;
  changePasswordModalTemplateRef: NgbModalRef;
  alertModalData: any;
  agentConfig: any;
  agentData: any;
  passwordCopied: boolean;
  openDeleteModal: EventEmitter<any>;
  alertModal: {
    statusChange?: boolean;
    title: string;
    message: string;
    _id: string;
  };
  agentPasswordModel: any;
  apiCalls: any;
  agent: any;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private ts: ToastrService) {
    const self = this;
    self.alertModalData = {};
    self.openDeleteModal = new EventEmitter();
    self.alertModal = {
      statusChange: false,
      title: '',
      message: '',
      _id: null
    };
    self.agentPasswordModel = {
      password: '',
      cpassword: ''
    };
    self.apiCalls = {};
    self.activateOption = new EventEmitter();
    self.output = new EventEmitter();
  }

  ngOnInit(): void {
    const self = this;
    self.agentConfig = {};
    self.agentConfig.arch = 'amd64';
    self.agentConfig.os = 'windows';
    self.activateOption.subscribe(data => {
      self.agent = data.agent;
      console.log('data found');
      if (data.type === 'changePassword') {
        self.openChangePasswordModel();
      } else if (data.type === 'showPassword') {
        self.showPassword();
      } else if (data.type === 'download') {
        self.downloadAgent();
      } else if (data.type === 'edit') {
        self.editAgent();
      } else if (data.type === 'delete') {
        self.deleteAgent();
      } else if (data.type === 'disable') {
        self.toggleAgentStatus(data.type);
      } else if (data.type === 'enable') {
        self.toggleAgentStatus(data.type);
      } else if (data.type === 'stop') {
        self.toggleAgentStatus(data.type);
      } else if (data.type === 'update') {
        self.updateAgent();
      }
    });
  }

  ngOnDestroy() {
    const self = this;
    if (self.downloadAgentModalTemplateRef) {
      self.downloadAgentModalTemplateRef.close(false);
    }
    if (self.viewPasswordModalTemplateRef) {
      self.viewPasswordModalTemplateRef.close(false);
    }
    if (self.alertModalTemplateRef) {
      self.alertModalTemplateRef.close(false);
    }
    if (self.changePasswordModalTemplateRef) {
      self.changePasswordModalTemplateRef.close(false);
    }
  }

  toggleAgentStatus(type: string) {
    const self = this;
    self.alertModalData = {};
    if (type === 'disable') {
      self.alertModalData.title = 'Disable agent';
      self.alertModalData.message = 'Are you sure you want to disable <span class="text-dark font-weight-bold">'
        + self.agent.name + '</span> agent?';
    } else if (type === 'enable') {
      self.alertModalData.title = 'Enable agent';
      self.alertModalData.message = 'Are you sure you want to enable <span class="text-dark font-weight-bold">'
        + self.agent.name + '</span> agent?';
    } else {
      self.alertModalData.title = 'Stop agent';
      self.alertModalData.message = 'Are you sure you want to stop <span class="text-dark font-weight-bold">'
        + self.agent.name + '</span> agent?';
    }
    self.alertModalTemplateRef = self.commonService.modal(self.alertModalTemplate, { centered: true });
    self.alertModalTemplateRef.result.then(close => {
      if (close) {
        self.commonService.put('partnerManager', `/${this.commonService.app._id}/agent/utils/${self.agent._id}/${type}`).subscribe(res => {
          self.output.emit({ reload: false, type });
          self.ts.success(res.message);
        }, err => {
          self.commonService.errorToast(err);
        });
      }
    }, dismiss => { });
  }

  deleteAgent() {
    const self = this;
    self.alertModal.statusChange = false;
    self.alertModal.title = 'Delete Agent';
    self.alertModal.message = 'Are you sure you want to delete agent <span class="text-delete font-weight-bold">' + self.agent.name
      + '</span>?';
    self.alertModal._id = self.agent._id;
    self.openDeleteModal.emit(self.alertModal);
  }

  closeDeleteModal(data) {
    const self = this;
    if (data) {
      self.commonService.delete('partnerManager', `/${this.commonService.app._id}/agent/${data._id}`).subscribe(res => {
        self.ts.success('Agent deleted successfully');
        self.output.emit({ reload: true });
      }, err => {
        self.commonService.errorToast(err);
      });
    }
  }

  editAgent() {
    const self = this;
    self.agentData = self.agent;
    self.agentData.isEdit = true;
    self.newAgentModalTemplateRef = self.commonService.modal(self.newAgentModalTemplate, { centered: true });
    self.newAgentModalTemplateRef.result.then(close => {
      if (close) {
        if (!self.agentData.name) {
          return;
        }
        delete self.agentData.isEdit;
        self.commonService.put('partnerManager', `/${this.commonService.app._id}/agent/` + self.agent._id, self.agentData).subscribe(res => {
          self.output.emit({ reload: true });
        }, err => {
          self.commonService.errorToast(err);
        });
      }
    }, dismiss => { });
  }

  downloadAgent() {
    const self = this;
    self.downloadAgentModalTemplateRef = self.commonService.modal(self.downloadAgentModalTemplate, {
      centered: true,
      windowClass: 'download-agent-modal'
    });
    self.downloadAgentModalTemplateRef.result.then(close => {
      if (close) {
        self.triggerAgentDownload(close, self.agent.type.toLowerCase(), self.agent._id);
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

  updateAgent() {
    const self = this;
    self.alertModalData.title = 'Update Agent';
    self.alertModalData.message = 'Are you sure you want to update <span class="text-dark font-weight-bold">'
      + self.agent.name + '</span> agent?';
    self.alertModalTemplateRef = self.commonService.modal(self.alertModalTemplate, {
      centered: true,
    });
    self.alertModalTemplateRef.result.then(close => {
      if (close) {
        self.triggerAgentUpdate(self.agent._id);
      }
    }, dismiss => { });
  }

  triggerAgentUpdate(agentId: string) {
    const self = this;
    self.commonService.put('partnerManager', `/${this.commonService.app._id}/agent/utils/${agentId}/triggerOTA`).subscribe(res => {
      let message = res.message;
      if (!message) {
        message = 'Agent Update Triggred';
      }
      self.ts.success(message);
    }, err => {
      self.commonService.errorToast(err);
    });
  }

  fetchPassword() {
    const self = this;
    if (!self.agent.decPassword) {
      self.commonService.get('partnerManager', `/${this.commonService.app._id}/agent/utils/${self.agent._id}/password`).subscribe(res => {
        self.agent.decPassword = res.password;
      }, err => {
        self.commonService.errorToast(err);
      });
    }
  }

  showPassword() {
    const self = this;
    self.fetchPassword();
    self.viewPasswordModalTemplateRef = self.commonService.modal(self.viewPasswordModalTemplate, { centered: true });
    self.viewPasswordModalTemplateRef.result.then(close => { }, dismiss => { });
  }

  openChangePasswordModel() {
    const self = this;
    self.agentPasswordModel.agent = self.agent;
    self.changePasswordModalTemplateRef = self.commonService.modal(self.changePasswordModalTemplate, { centered: true });
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
    if (!self.agentPasswordModel.password || !self.agentPasswordModel.password.trim()) {
      self.agentPasswordModel.message = 'Password cannot be empty';
      return;
    }
    if (self.agentPasswordModel.password !== self.agentPasswordModel.cpassword) {
      self.agentPasswordModel.message = 'Passwords do not match';
      return;
    }
    self.apiCalls.password = true;
    self.commonService.put('partnerManager', `/${this.commonService.app._id}/agent/utils/${self.agentPasswordModel.agent._id}/password`, {
      password: self.agentPasswordModel.password
    }).subscribe(res => {
      self.apiCalls.password = false;
      self.ts.success(res.message);
      self.agentPasswordModel.agent.decPassword = self.agentPasswordModel.password;
      if (self.changePasswordModalTemplateRef) {
        self.changePasswordModalTemplateRef.close(false);
      }
    }, err => {
      self.apiCalls.password = false;
      if (self.changePasswordModalTemplateRef) {
        self.changePasswordModalTemplateRef.close(false);
      }
      self.commonService.errorToast(err);
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

  get apiCallsPending() {
    const self = this;
    return Object.values(self.apiCalls).filter(e => e).length > 0;
  }

}
