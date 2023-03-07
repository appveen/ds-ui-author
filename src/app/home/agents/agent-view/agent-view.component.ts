import { Component, EventEmitter, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { AppService } from 'src/app/utils/services/app.service';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Breadcrumb } from '../../../utils/interfaces/breadcrumb';
import * as _ from 'lodash'
import * as moment from 'moment';

@Component({
  selector: 'odp-agent-view',
  templateUrl: './agent-view.component.html',
  styleUrls: ['./agent-view.component.scss']
})
export class AgentViewComponent implements OnInit {

  @ViewChild('alertModalTemplate', { static: false }) alertModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('downloadAgentModal') downloadAgentModal: HTMLElement;
  @ViewChild('agentDetailsModal') agentDetailsModal: HTMLElement;
  alertModalTemplateRef: NgbModalRef;
  downloadAgentModalRef: NgbModalRef;
  agentDetailsModalRef: NgbModalRef;
  agentId: string;
  subscriptions: any;
  alertModalData: any;
  agentConfig: any;
  agentPasswordModel: any;
  agentData: any;
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
  selectedTab: number;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private ts: ToastrService) {
    this.agentPasswordModel = {
      password: '',
      cpassword: ''
    };
    this.agentConfig = {};
    this.subscriptions = [];
    this.resetPasswordForm = this.fb.group({
      password: [null],
      cpassword: [null, [Validators.required]],
    });
    this.alertModal = {
      statusChange: false,
      title: '',
      message: '',
    };
    this.breadcrumbPaths = [];
  }

  ngOnInit() {
    this.agentConfig.arch = 'amd64';
    this.agentConfig.os = 'windows';
    this.route.params.subscribe(params => {
      if (params.id) {
        this.agentId = params.id;
      }
    });
    this.breadcrumbPaths.push({
      active: false,
      label: 'Agents',
      url: '/app/' + this.commonService.app._id + '/agent'
    });
    this.getAgentDetails();

  }


  getAgentDetails() {
    this.showLazyLoader = true;
    this.commonService.get('partnerManager', `/${this.commonService.app._id}/agent/${this.agentId}`).subscribe(res => {
      this.showLazyLoader = false;
      this.agentDetails = res;
      this.breadcrumbPaths.push({
        active: true,
        label: this.agentDetails.name
      });
      this.selectedTab = 0;
      this.commonService.changeBreadcrumb(this.breadcrumbPaths)
      if (this.hasPermission('PVAPW')) {
        this.getAgentPassword(this.agentDetails._id)
      }
      else {
        this.agentDetails['thePassword'] = '********'
      }
    }, err => {
      this.showLazyLoader = false;
      this.commonService.errorToast(err);
    });
  }
  getHeartbeats() {
    const options: GetOptions = {
      select: 'timestamp,heartBeatFrequency,status',
      filter: {
        agentID: this.agentId
      },
      count: 5,
      sort: '-timestamp',
      noApp: true
    };
    this.commonService.get('partnerManager', '/agentMonitoring', options).subscribe(res => {
      if (res.length === 0) {
        this.agentDetails.heartbeat = -1;
        this.agentDetails.streak = [];
      } else {
        this.agentDetails.heartbeat = res[0].heartBeatFrequency;
        this.agentDetails.streak = res.map(e => e.status === 'RUNNING' ? 'T' : 'F').reverse();
      }
    }, err => {
      this.agentDetails.heartbeat = -1;
      this.agentDetails.streak = [];
    });
  }

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
        list2.find((e: any) => e.id.startsWith('PMAB'))
      );
    }
  }


  editAgent() {
    this.showLazyLoader = true;
    this.commonService.put('partnerManager', `/${this.commonService.app._id}/agent/` + this.agentDetails._id, this.agentDetails).subscribe(res => {
      this.showLazyLoader = false;
      if (res) {
        this.ts.success('Agent Saved Sucessfully');
        this.showEditAgentWindow = false;
      }
    }, err => {
      this.showLazyLoader = false;
      this.commonService.errorToast(err);
      this.showEditAgentWindow = false;
    });
  }

  hasPermission(type: string) {
    return this.commonService.hasPermission(type);
  }

  toggleAgentStatus(agent: any, type: string) {
    this.alertModalData = {};
    if (type === 'disable') {
      this.alertModalData.title = 'Disable agent';
      this.alertModalData.message = 'Are you sure you want to disable <span class="text-dark font-weight-bold">'
        + agent.name + '</span> agent?';
    } else if (type === 'enable') {
      this.alertModalData.title = 'Enable agent';
      this.alertModalData.message = 'Are you sure you want to enable <span class="text-dark font-weight-bold">'
        + agent.name + '</span> agent?';
    } else {
      this.alertModalData.title = 'Stop agent';
      this.alertModalData.message = 'Are you sure you want to stop <span class="text-dark font-weight-bold">'
        + agent.name + '</span> agent?';
    }
    this.alertModalTemplateRef = this.commonService.modal(this.alertModalTemplate);
    this.alertModalTemplateRef.result.then(close => {
      if (close) {
        this.commonService.put('partnerManager', `/${this.commonService.app._id}/agent/utils/${agent._id}/${type}`).subscribe(res => {
          this.ts.success(res.message);
        }, err => {
          this.commonService.errorToast(err);
        });
      }
    }, dismiss => { });
  }

  triggerAgentDownload(os: string, type: string, agentId?: string) {
    const ele: HTMLAnchorElement = document.createElement('a');
    ele.target = '_blank';
    let queryParams = `${this.commonService.app._id}/download/${type}${agentId ? '/' + agentId : ''}/`;
    if (os === 'k8s') {
      queryParams += 'k8s';
    } else {
      queryParams += `exec?os=${os}&arch=${this.agentConfig.arch}`;
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

  test() {
    this.showPasswordSide = true;
  }

  copyPassword(password: string) {
    this.appService.copyToClipboard(password);
    this.ts.success('Password copied successfully');
  }


  getAgentPassword(id: string) {
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
      this.showLazyLoader = true;
      this.commonService.put('partnerManager', `/${this.commonService.app._id}/agent/utils/${this.agentDetails._id}/password`, payload)
        .subscribe(() => {
          this.resetPasswordForm.reset()
          this.ts.success('Password changed successfully');
          this.showLazyLoader = false;
          this.showPassword = false
          this.showPasswordSide = false
        }, err => {
          this.resetPasswordForm.reset()
          this.showLazyLoader = false;
          this.showPassword = false
          this.showPasswordSide = false
          this.commonService.errorToast(err, 'Unable to process request');
        });
    }
  }

  triggerAgentEdit() {
    if (!this.agentDetails || !this.agentDetails.name) {
      return;
    }
    delete this.agentDetails.isEdit;
    this.showEditAgentWindow = false;
    this.showLazyLoader = true;
    this.commonService.put('partnerManager', `/${this.commonService.app._id}/agent/`+this.agentDetails._id, this.agentDetails).subscribe(res => {
      this.showLazyLoader = false;
      if(res){
        this.ts.success('Agent Saved Sucessfully');
      }
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
    if (this.hasPermission('PVAPW')) {
      this.getAgentPassword(agent._id)
    }
    else {
      this.agentDetails['thePassword'] = '********'
    }
    this.agentDetailsModalRef = this.commonService.modal(this.agentDetailsModal, { size: 'md' });
    this.agentDetailsModalRef.result.then(close => { }, dismiss => { });
  }

  convertDate(dateString) {
    const date = new Date(dateString);
    return moment(date).format('DD MMM YYYY, hh:mm:ss A')
  }

  closeDeleteModal(data) {
    const url = this.router.url;
    const previousUrl = url.split('/').slice(0, -1).join('/');
    if (data) {
      this.subscriptions['deleteAgent'] = this.commonService.delete('partnerManager', `/${this.commonService.app._id}/agent/` + this.agentDetails._id, this.agentDetails).subscribe(res => {
        if (res) {
          this.ts.success('Agent Deleted Sucessfully');
          this.router.navigate([previousUrl]);
        }

      }, err => {
        this.commonService.errorToast(err, 'Unable to delete, please try again later');
        // this.showNewAgentWindow = false;
      });
    }
  }


  get matchPwd() {
    return (
      this.resetPasswordForm.get('password').value !==
      this.resetPasswordForm.get('cpassword').value
    );
  }

  get pwdError() {
    return (
      (this.resetPasswordForm.get('password').dirty &&
        this.resetPasswordForm.get('password').hasError('required')) ||
      (this.resetPasswordForm.get('password').dirty &&
        this.resetPasswordForm.get('password').hasError('minlength')) ||
      (this.resetPasswordForm.get('password').dirty &&
        this.resetPasswordForm.get('password').hasError('pattern'))
    );
  }

  get cPwdError() {
    return (
      (this.resetPasswordForm.get('cpassword').dirty &&
        this.resetPasswordForm.get('cpassword').hasError('required')) ||
      (this.resetPasswordForm.get('cpassword').dirty && this.matchPwd)
    );
  }
}
