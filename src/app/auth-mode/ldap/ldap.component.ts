import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, AfterContentInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService } from 'src/app/utils/services/common.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'odp-ldap',
  templateUrl: './ldap.component.html',
  styleUrls: ['./ldap.component.scss']
})
export class LdapComponent implements OnInit, OnDestroy, AfterContentInit {

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
  constructor(
    private appService: AppService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private router: Router) {
    const self = this;
    self.subscriptions = {};
    self.activeStep = 0;
    self.ldapForm = self.fb.group({
      url: [null, [Validators.required]],
      bindDN: [null, [Validators.required]],
      bindPassword: [null, [Validators.required]],
      baseDN: [null, [Validators.required]],
      baseFilter: ['(objectClass=inetOrgPerson)', [Validators.required]],
      mapping: self.fb.group({
        username: ['sAMAccountName', [Validators.required]],
        name: ['cn', [Validators.required]],
        email: ['mail', [Validators.required]]
      }),
      searchText: [null, [Validators.minLength(3)]],
      admin: [null],
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
      self.ldapForm.get('url').patchValue('ldap://13.233.112.61:61389');
      self.ldapForm.get('bindDN').patchValue('cn=admin,dc=example,dc=org');
      self.ldapForm.get('bindPassword').patchValue('password');
      self.ldapForm.get('baseDN').patchValue('dc=example,dc=org');
      self.ldapForm.get('mapping.username').patchValue('cn');
      self.ldapForm.get('mapping.name').patchValue('sn');
      self.ldapForm.get('mapping.email').patchValue('mail');
    }
    if (self.commonService.userDetails.auth.authType === 'ldap') {
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
    self.activeStep = 1;
    self.validateResponse = {
      pending: true,
      isError: false
    };
    self.commonService.post('user', '/auth/ldap/test', self.ldapForm.value).subscribe(res => {
      self.validateResponse = res;
      self.validateResponse.isError = false;
      self.validateResponse.pending = false;
      self.setSuperAdminBtn = true;
    }, err => {
      self.validateResponse = err.error;
      self.validateResponse.isError = true;
      self.validateResponse.pending = false;
      if (!self.validateResponse.connection) {
        self.validateResponse.message = 'Invalid URL';
      } else if (!self.validateResponse.authentication) {
        self.validateResponse.message = 'Invalid Credentials';
      } else if (!self.validateResponse.users) {
        self.validateResponse.message = 'Invalid Mapping/Filter';
      }
    });
  }
  setSuperAdmin() {
    const self = this;
    self.activeStep = 2;
  }

  searchSuperAdmin() {
    const self = this;
    if (!self.ldapForm.get('searchText').value
      || !self.ldapForm.get('searchText').value.trim()
      || self.ldapForm.get('searchText').invalid) {
      return;
    }
    self.commonService.post('user', '/auth/ldap/search', self.ldapForm.value).subscribe(res => {
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
        self.ldapForm.get('admin').patchValue(u.username);
        u.selected = true;
      } else {
        u.selected = false;
      }
    });
  }

  review() {
    const self = this;
    self.activeStep = 3;
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
    self.commonService.post('user', '/auth/ldap', self.ldapForm.value).subscribe(res => {
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

  get adminSelected() {
    const self = this;
    return self.users.filter(u => u.selected).length;
  }
  get selectedUserDetails() {
    const self = this;
    return self.users.find(u => u.selected) || {};
  }

}

export interface LdapConfig {
  url?: string;
  bindDN?: string;
  bindPassword?: string;
  baseDN?: string;
  baseFilter?: string;
  mapping?: LdapConfigMapping;
  searchText?: string;
  admin?: string;
}

export interface LdapConfigMapping {
  username?: string;
  name?: string;
  email?: string;
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
