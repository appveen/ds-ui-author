import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, AfterContentInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService } from 'src/app/utils/services/common.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'odp-azure',
  templateUrl: './azure.component.html',
  styleUrls: ['./azure.component.scss']
})
export class AzureComponent implements OnInit, OnDestroy, AfterContentInit {

  @ViewChild('warningModal', { static: false }) warningModal: TemplateRef<HTMLElement>;
  @ViewChild('applyingChangesModal', { static: false }) applyingChangesModal: TemplateRef<HTMLElement>;
  subscriptions: any;
  activeStep: number;
  ldapForm: FormGroup;
  validateResponse: ValidateResponse;
  setSuperAdminBtn: boolean;
  users: Array<UsersResponse>;
  warningModalRef: NgbModalRef;
  applyingChangesModalRef: NgbModalRef;
  completed: {
    status?: boolean;
    message?: string;
    pending?: boolean;
  };
  azureToken: string;
  constructor(
    private appService: AppService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private router: Router,
    private ts: ToastrService) {
    const self = this;
    self.subscriptions = {};
    self.activeStep = 0;
    self.ldapForm = self.fb.group({
      clientId: [null, [Validators.required]],
      clientSecret: [null, [Validators.required]],
      tenant: [null, [Validators.required]],
      searchText: [null, [Validators.minLength(3)]],
      username: [null],
      name: [null],
      adUserAttribute: ['mail']
    });
    self.validateResponse = {};
    self.users = [];
    self.completed = {
      pending: true
    };
  }

  ngOnInit() {
    const self = this;
    if (!environment.production) {
      self.ldapForm.get('clientId').patchValue('e3ff17a3-ac93-48f7-8c5b-3de0b1106527');
      self.ldapForm.get('clientSecret').patchValue('iG~A7uw_ge1RyR6OMExVY9qZIm~-V62_IJ');
      self.ldapForm.get('tenant').patchValue('capiotsoftware8outlook.onmicrosoft.com');
    }
    if (self.commonService.userDetails.auth.authType === 'azure') {
      self.cancel();
    }
  }

  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach(e => {
      self.subscriptions[e].unsubscribe();
    });
    if (self.applyingChangesModalRef) {
      self.applyingChangesModalRef.close();
    }
    if (self.warningModalRef) {
      self.warningModalRef.close();
    }
  }

  ngAfterContentInit() {
    const self = this;
    setTimeout(() => {
      self.appService.toggleSideNav.emit(false);
    }, 100);
  }

  navigateToUsers() {
    const self = this;
    self.appService.toggleSideNav.emit(true);
    self.router.navigate(['/app', self.commonService.appList[0], 'cp', 'user']);
  }

  validate() {
    const self = this;
    // self.activeStep = 1;
    self.validateResponse = {
      pending: true,
      isError: false
    };
    self.commonService.post('user', '/auth/azure/test', self.ldapForm.value).subscribe(res => {
      self.validateResponse = res;
      self.validateResponse.isError = false;
      self.validateResponse.pending = false;
      self.thirdPartyLogin(res.auth.connectionDetails);
      // self.setSuperAdminBtn = true;
    }, err => {
      self.validateResponse = err.error;
      self.validateResponse.isError = true;
      self.validateResponse.pending = false;
    });
  }
  setSuperAdmin() {
    const self = this;
    self.activeStep = 1;
  }

  searchSuperAdmin() {
    const self = this;
    if (!self.ldapForm.get('searchText').value
      || !self.ldapForm.get('searchText').value.trim()
      || self.ldapForm.get('searchText').invalid) {
      return;
    }
    const payload = self.ldapForm.value;
    payload.adToken = self.azureToken;
    payload.filter = `startswith(displayName,'${payload.searchText}') or startswith(mail,'${payload.searchText}')`;
    delete payload.searchText;
    self.commonService.post('user', '/auth/azure/search', payload).subscribe(res => {
      self.users = res;
      self.users.forEach(u => {
        if (self.ldapForm.get('admin').value && u.username
          && self.ldapForm.get('admin').value.toLowerCase() === u.username.toLowerCase()) {
          u.selected = true;
        }
      });
    }, err => {
      self.users = [];
      console.log(err);
    });
  }

  resetSearch() {
    const self = this;
    self.ldapForm.get('searchText').patchValue(null);
    self.ldapForm.get('admin').patchValue(null);
    self.users = [];
  }
  toggleSelectedUser(index: number) {
    const self = this;
    self.users.forEach((u, i) => {
      if (i === index) {
        self.ldapForm.get('username').patchValue(u.username);
        self.ldapForm.get('name').patchValue(u.name);
        u.selected = true;
      } else {
        u.selected = false;
      }
    });
  }

  review() {
    const self = this;
    self.activeStep = 2;
  }
  warning() {
    const self = this;
    self.warningModalRef = self.commonService.modal(self.warningModal);
    self.warningModalRef.result.then(close => { }, dismiss => { });
  }

  complete() {
    const self = this;
    self.warningModalRef.close();
    self.applyingChangesModalRef = self.commonService.modal(self.applyingChangesModal);
    const payload = self.ldapForm.value;
    // payload.adToken = self.azureToken;
    self.commonService.post('user', '/auth/azure', payload).subscribe(res => {
      self.completed.status = true;
      self.completed.pending = false;
    }, err => {
      self.completed.status = false;
      self.completed.pending = false;
      self.completed.message = err.error.message;
    });
  }

  goBack() {
    const self = this;
    self.applyingChangesModalRef.close();
    self.completed.status = false;
    self.completed.pending = true;
    self.completed.message = null;
  }

  cancel() {
    const self = this;
    self.router.navigate(['/app']);
  }

  logout() {
    const self = this;
    self.commonService.logout();
  }

  thirdPartyLogin(options?: any) {
    const self = this;
    const username = options.username || self.commonService.userDetails.username;
    const windowHeight = 500;
    const windowWidth = 600;
    const windowLeft = (window.innerWidth - windowWidth) / 2;
    const windowTop = (window.innerHeight - windowHeight) / 2;
    let url = `https://login.microsoftonline.com/${self.ldapForm.get('tenant').value}/oauth2/v2.0/authorize`;
    url += `?client_id=${self.ldapForm.get('clientId').value}`;
    url += `&redirect_uri=${options.redirectUri.userFetch}`;
    url += `&response_type=code`;
    url += `&response_mode=query`;
    url += `&scope=user.read`;
    if (username && username !== 'admin') {
      url += `&login_hint=${username}`;
    }
    const windowOptions = [];
    windowOptions.push(`height=${windowHeight}`);
    windowOptions.push(`width=${windowWidth}`);
    windowOptions.push(`left=${windowLeft}`);
    windowOptions.push(`top=${windowTop}`);
    windowOptions.push(`toolbar=no`);
    windowOptions.push(`resizable=no`);
    windowOptions.push(`menubar=no`);
    windowOptions.push(`location=no`);
    const childWindow = document.open(url, '_blank', windowOptions.join(',')) as any;
    self.appService.listenForChildClosed(childWindow).then(data => {
      console.log("data",data);
      if (environment.production) {
        if (data.status === 200) {
          self.activeStep = 1;
          self.azureToken = data.body.adToken;
        } else {
          self.ts.error(data.body.message, null, { timeOut: 0, closeButton: true });
        }
      } else {
        self.activeStep = 1;
      }
    }).catch(err => { });
  }

  get adminSelected() {
    const self = this;
    return self.users.filter(u => u.selected).length;
  }
  get selectedUserDetails() {
    const self = this;
    return self.users.find(u => u.selected) || {};
  }
}

export interface ValidateResponse {
  isError?: boolean;
  authentication?: boolean;
  connection?: boolean;
  users?: boolean;
  message?: string;
  pending?: boolean;
}

export interface UsersResponse {
  username?: string;
  name?: string;
  email?: string;
  selected?: boolean;
}

