import { Component, OnInit, OnDestroy, AfterViewInit, AfterContentChecked, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { CommonService } from 'src/app/utils/services/common.service';
import { environment } from 'src/environments/environment';
import { AppService } from 'src/app/utils/services/app.service';
import { SessionService } from '../utils/services/session.service';

@Component({
    selector: 'odp-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit, AfterContentChecked, OnDestroy {

    @ViewChild('clearSessionModal', { static: false }) clearSessionModal: TemplateRef<HTMLElement>;
    @ViewChild('usernameControl', { static: false }) usernameControl: ElementRef;
    message: string;
    loader = false;
    form: FormGroup;
    errorMessage: string;
    isErrorMessage: boolean;
    version: string;
    subscriptions: any = {};
    redirectLink: string;
    authTypeChecked: boolean;
    rbacUserReloginAction: string;
    clearSessionModalRef: NgbModalRef;
    authType: string;
    azureLoginLoader: boolean;
    constructor(private fb: FormBuilder,
        private commonService: CommonService,
        private appService: AppService,
        private sessionService: SessionService,
        private router: Router,
        private titleService: Title) {
        const self = this;
        self.form = self.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
        self.commonService.apiCalls.componentLoading = true;
    }

    ngOnInit() {
        const self = this;
        self.commonService.apiCalls.componentLoading = false;
        self.version = environment.version;
        self.redirectLink = window.location.protocol + '//' + window.location.hostname + '/bc';
        self.appService.setFocus.subscribe(val => {
            self.usernameControl?.nativeElement.focus();
        });
        if (this.commonService.userDetails
            && this.commonService.userDetails._id) {
            this.router.navigate(['/app/']);
            // reject(false);
        } else {
            if (self.sessionService.getToken()) {
                this.commonService.isAuthenticated().then(res => {
                    this.commonService.afterAuthentication().then(data => {
                        if (this.commonService.noAccess) {
                            // reject(false);
                        } else {
                            this.router.navigate(['/app/']);
                            // resolve(true);
                        }
                    }).catch(err => {
                        // reject(false);
                    });
                }).catch(err => {
                    // resolve(true);
                });
            } else {
                this.router.navigate(['/']);
            }
        }
    }

    ngAfterViewInit() {
        const self = this;
        self.titleService.setTitle('data.stack: Author');
    }

    ngAfterContentChecked() {
        const self = this;
        self.titleService.setTitle('data.stack: Author');
    }

    onSubmit(event: Event) {
        try {
            event.preventDefault();
            const self = this;
            if (self.clearSessionModalRef) {
                self.clearSessionModalRef.close();
            }
            self.message = null;
            const username = self.form.get('username').value;
            if (!username || !username.trim()) {
                return;
            }
            self.loader = true;
            self.subscriptions['login'] = self.commonService.get('user', '/authType/' + username, { noApp: true, skipAuth: true }).subscribe(res => {
                self.authTypeChecked = true;
                self.loader = false;
                self.appService.fqdn = res.fqdn;
                self.appService.validAuthTypes = res.validAuthTypes;
                self.authType = res.bot ? 'local' : res.authType;
                if (res.rbacUserToSingleSession
                    && res.sessionActive) {
                    self.rbacUserReloginAction = res.rbacUserReloginAction;
                    self.activeSessionWarning();
                }
            }, err => {
                self.loader = false;
                if (err.status === 0 || err.status === 500 || !err.error || !err.error.message) {
                    self.message = 'Unable to login';
                } else {
                    self.message = err.error.message;
                }
            });
        } catch (e) {
            throw e;
        }
    }

    doAzureLogin() {
        const self = this;
        self.form.get('password').disable();
        self.message = null;
        self.azureLoginLoader = true;
        self.commonService.azureLogin()
            .then(async (res) => {
                if (res.status === 200) {
                    try {
                        self.commonService.resetUserDetails(res.body);
                        const status = await self.commonService.isAuthenticated();
                        const data = await self.commonService.afterAuthentication();
                        self.azureLoginLoader = false;
                        if (data.status === 200 && !self.commonService.noAccess) {
                            self.commonService.apiCalls.componentLoading = true;
                            const expireDate = new Date(self.sessionService.getUser(true).expiresIn);
                            self.router.navigate(['/app']);
                        } else {
                            self.message = 'You don\'t have enough permissions';
                            self.commonService.logout(true);
                        }
                    } catch (e) {
                        console.error(e);
                        throw e;
                    }
                } else {
                    self.azureLoginLoader = false;
                    self.message = res.body.message;
                }
            }).catch(err => {
                self.azureLoginLoader = false;
                if (err.status === 0 || err.status === 500 || !err.error || !err.error.message) {
                    self.message = 'Unable to login';
                } else {
                    self.message = err.error.message;
                }
            });
    }

    doLogin(event: Event) {
        try {
            event.preventDefault();
            const self = this;
            self.message = null;
            const username = self.form.get('username').value;
            const password = self.form.get('password').value;
            if (!username || !username.trim() || !password || !password.trim()) {
                return;
            }
            self.loader = true;
            self.commonService[self.authType === 'local' ? 'login' : 'ldapLogin'](self.form.value)
                .then(res => {
                    self.commonService.afterAuthentication().then(data => {
                        self.loader = false;
                        if (data.status === 200 && !self.commonService.noAccess) {
                            self.commonService.apiCalls.componentLoading = true;
                            self.router.navigate(['/app']);
                        } else {
                            self.message = 'You don\'t have enough permissions';
                            self.commonService.logout(true);
                        }
                    }).catch(err => {
                        self.loader = false;
                        if (err.status === 0 || err.status === 500 || !err.error || !err.error.message) {
                            self.message = 'Unable to login, please try again later.';
                        } else {
                            self.message = err.error.message;
                        }
                    });
                }).catch(err => {
                    self.loader = false;
                    if (err.status === 0 || err.status === 500 || !err.error || !err.error.message) {
                        self.message = 'Unable to login, please try again later.';
                    } else {
                        self.message = err.error.message;
                    }
                });
        } catch (e) {
            throw e;
        }
    }

    ngOnDestroy() {
        const self = this;
        self.appService.loginComponent = false;
        Object.keys(self.subscriptions).forEach(e => {
            self.subscriptions[e].unsubscribe();
        });
        if (self.clearSessionModalRef) {
            self.clearSessionModalRef.close();
        }
    }

    showErroMessage(errMsg) {
        const self = this;
        self.isErrorMessage = true;
        self.errorMessage = errMsg;
        setTimeout(() => {
            self.isErrorMessage = false;
        }, 3000);
    }

    activeSessionWarning() {
        const self = this;
        self.clearSessionModalRef = self.commonService.modal(self.clearSessionModal);
        self.clearSessionModalRef.result.then(close => {
            if (close) {
                if (self.commonService.connectionDetails) {
                    self.doAzureLogin();
                }
            } else {
                self.authTypeChecked = false
                self.form.reset();
            }
        }, dismiss => {
            self.form.reset();
        });
    }

    emptyUsername() {
        const self = this;
        self.authTypeChecked = false;
        self.form.get('username').patchValue('');
        self.form.get('password').patchValue('');
    }

    get usernameValid() {
        const self = this;
        return self.form.get('username').valid;
    }

    get username() {
        const self = this;
        return self.form.get('username').value;
    }
}
