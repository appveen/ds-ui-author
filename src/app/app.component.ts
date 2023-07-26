import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, AfterContentChecked, ViewChild, TemplateRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationStart, NavigationEnd, NavigationCancel } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { CommonService } from './utils/services/common.service';
import { ShortcutService } from './utils/shortcut/shortcut.service';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit, AfterContentChecked, OnDestroy {

  @ViewChild('sessionTierAlertModal', { static: false }) sessionTierAlertModal: TemplateRef<HTMLElement>;
  sessionExpired: boolean;
  subscriptions: any;
  sessionTierAlertModalRef: NgbModalRef;
  sessionExpireMsg: string;
  navigating: boolean;
  year: number;
  get showStallLoader(): boolean {
    return !!this.commonService?.stallRequests;
  }

  constructor(private titleService: Title,
    public commonService: CommonService,
    private ts: ToastrService,
    private router: Router,
    private shortcutService: ShortcutService,
    private appService: AppService,
    private cdr: ChangeDetectorRef) {
    const self = this;
    self.titleService.setTitle('datanimbus.io: Author');
    self.subscriptions = {};
  }

  ngOnInit() {
    const self = this;
    self.year = new Date().getFullYear();
    self.subscriptions['ctrlKey'] = self.shortcutService.ctrlKey.subscribe((event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'e') {
        event.preventDefault();
        const url = self.commonService.app.type === 'Management' ? 'mgmt' : 'dist';
        self.router.navigate([url, 'sb']);
      }
    });
    self.subscriptions['sessionTimeoutWarning'] = self.commonService.sessionTimeoutWarning.subscribe(time => {
      if (self.sessionTierAlertModalRef) {
        self.sessionTierAlertModalRef.close(false);
      }
      self.sessionExpireMsg = 'Your session will expire in ' + time + ' min, Click Extend to extend your session';
      self.sessionTierAlertModalRef = self.commonService.modal(self.sessionTierAlertModal);
      self.sessionTierAlertModalRef.result.then((close) => { }, dismiss => { });
    });
    self.subscriptions['sessionExpired'] = self.commonService.sessionExpired.subscribe(() => {
      if (self.sessionTierAlertModalRef) {
        self.sessionTierAlertModalRef.close(false);
      }
      if (!self.appService.loginComponent) {
        self.sessionExpired = true;
      }
      self.titleService.setTitle('Session Expired! - datanimbus.io: Author');
    });
    self.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        self.navigating = true;
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        self.navigating = false;
      }
    });
  }

  extendSession() {
    const self = this;
    self.commonService.apiCalls.extendSession = true;
    self.commonService.extend().then(res => {
      self.commonService.apiCalls.extendSession = false;
      self.ts.success('Session Extended');
      self.sessionTierAlertModalRef.close(true);
    }).catch(err => {
      self.commonService.apiCalls.extendSession = false;
      self.commonService.errorToast(err);
    });
  }

  logoutUser() {
    const self = this;
    self.sessionExpired = false;
    self.commonService.clearData();
    self.commonService.logout();
  }

  ngOnDestroy() {
    const self = this;
    self.appService.loginComponent = false;
    Object.keys(self.subscriptions).forEach(e => {
      self.subscriptions[e].unsubscribe();
    });
    if (self.sessionTierAlertModalRef) {
      self.sessionTierAlertModalRef.close();
    }
  }

  ngAfterViewInit() {
    document.getElementById('splashScreen').style.display = 'none';
  }

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  get authType() {
    const self = this;
    if (self.commonService.userDetails && self.commonService.userDetails.auth) {
      return self.commonService.userDetails.auth.authType;
    }
    return null;
  }
}
