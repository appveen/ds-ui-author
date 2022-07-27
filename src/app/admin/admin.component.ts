import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  TemplateRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  trigger,
  transition,
  query,
  style,
  group,
  animate,
  keyframes,
  state,
} from '@angular/animations';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { environment } from 'src/environments/environment';
import {
  CommonService,
  GetOptions,
} from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { App } from 'src/app/utils/interfaces/app';

@Component({
  selector: 'odp-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  animations: [
    trigger('userProfile', [
      transition('void=>*', [
        query(
          '.profile-data,.profile-thumbnail,.app-version,.last-login',
          style({ opacity: '0' })
        ),
        style({ height: '0px', position: 'fixed', opacity: '0.5' }),
        group([
          query(
            '.user-icon',
            animate(
              '200ms cubic-bezier(0.23, 1, 0.32, 1)',
              keyframes([
                style({ position: 'fixed', top: '11.5px', right: '16px' }),
                style({ top: '33px', right: '16px' }),
              ])
            )
          ),
          animate(
            '200ms cubic-bezier(0.23, 1, 0.32, 1)',
            keyframes([
              style({ height: '40px', opacity: '0.5' }),
              style({ height: '120px', opacity: '1' }),
            ])
          ),
        ]),
        query(
          '.profile-data,.profile-thumbnail,.app-version,.last-login',
          style({ opacity: '1' })
        ),
      ]),
      transition('*=>void', [
        group([
          query(
            '.profile-data,.profile-thumbnail,.app-version,.last-login',
            animate(
              '300ms cubic-bezier(0.23, 1, 0.32, 1)',
              keyframes([style({ opacity: '0.3' }), style({ opacity: '0' })])
            )
          ),
          query(
            '.user-icon',
            animate(
              '300ms cubic-bezier(0.23, 1, 0.32, 1)',
              keyframes([
                style({ position: 'fixed', top: '33px', right: '16px' }),
                style({ position: 'fixed', top: '11.5px', right: '16px' }),
              ])
            )
          ),
          animate(
            '300ms cubic-bezier(0.23, 1, 0.32, 1)',
            keyframes([
              style({ height: '60px', border: '0' }),
              style({ height: '0px' }),
            ])
          ),
        ]),
      ]),
    ]),
    trigger('userProfileIcon', [
      state('true', style({ opacity: '0' })),
      state('false', style({ opacity: '1' })),
      transition('true=>false', [
        animate('500ms cubic-bezier(0.23, 1, 0.32, 1)'),
      ]),
    ]),
  ],
})
export class AdminComponent implements OnInit, OnDestroy {
  @ViewChild('searchAppInput', { static: false }) searchAppInput: ElementRef;
  @ViewChild('downloadAgentModalTemplate', { static: false })
  downloadAgentModalTemplate: TemplateRef<HTMLElement>;
  username: string;
  name: string;
  redirectLink: string;
  apps: App[];
  roleList: Array<any>;
  selectedApp: App;
  version: string;
  loadingApps: boolean;
  showSideNav: boolean;
  showProfileOptions: boolean;
  showAppOptions: boolean;
  subscriptions: any;
  searchApp: string;
  accessLevel: string;
  isSuperAdmin: boolean;
  downloadAgentModalTemplateRef: NgbModalRef;
  addBlur: boolean;
  toggleChangePassword: boolean;
  agentConfig: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public commonService: CommonService,
    private appService: AppService
  ) {
    const self = this;
    self.redirectLink =
      window.location.protocol + '//' + window.location.hostname + '/bc';
    self.version = environment.version;
    self.subscriptions = {};
    self.showSideNav = true;
    self.selectedApp = {};
    self.roleList = [];
    self.agentConfig = {};
  }
  ngOnInit() {
    const self = this;
    self.agentConfig.arch = 'amd64';
    self.agentConfig.os = 'windows';
    // if (!self.commonService.userDetails.isSuperAdmin) {
    //   self.router.navigate(['/app/', self.commonService.appList[0]._id, 'sm']);
    //   return;
    // }

    self.route.params.subscribe((params) => {
      if (params.app) {
        const tempApp = self.commonService.appList.find(
          (d) => d._id === params.app
        );
        if (tempApp) {
          self.commonService.app = tempApp;
          self.selectedApp = tempApp;
          self.commonService.appChange.emit(params.app);
          self.init();
        } else {
          self.router.navigate([
            '/app/',
            self.commonService.appList[0]._id,
            'sm',
          ]);
        }
      } else {
        self.router.navigate(['/admin/']);
      }
    });
    self.isSuperAdmin = self.commonService.userDetails.isSuperAdmin;
    self.addBlur = self.commonService.addBlur;
    self.commonService.apiCalls.componentLoading = false;
    self.username = self.commonService.userDetails.username;
    if (
      self.commonService.userDetails.basicDetails &&
      self.commonService.userDetails.basicDetails.name
    ) {
      self.name = self.commonService.userDetails.basicDetails.name;
    }
    self.appService.toggleSideNav.subscribe((val) => {
      self.showSideNav = val;
    });
  }

  init() {
    const self = this;
    const options2: GetOptions = {
      select: 'name app',
      filter: {},
    };
    self.commonService.connectSocket();
  }

  loadApps() {
    const self = this;
    self.searchAppInput.nativeElement.focus();
    self.apps = [];
    self.loadingApps = true;
    self.commonService
      .isAuthenticated()
      .then((res) => {
        self.loadingApps = false;
        self.apps = res.apps;
      })
      .catch((err) => {
        self.loadingApps = false;
      });
  }

  changeApp(name) {
    const self = this;
    self.showAppOptions = false;
    self.showProfileOptions = false;
    self.searchApp = '';
    if (self.commonService.app._id === name) {
      return;
    }
    const tempIndex = self.apps.findIndex((d) => d._id === name);
    self.selectedApp = self.apps[tempIndex];
    self.commonService.app = self.selectedApp;
    self.router.navigate(['/app/', name]);
  }

  logout() {
    const self = this;
    self.commonService.logout();
  }

  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach((e) => {
      self.subscriptions[e].unsubscribe();
    });
  }

  hasPermission(type: string) {
    const self = this;
    return self.commonService.hasPermission(type);
  }

  loadAdminPage() {
    const self = this;
    self.router.navigate(['/admin/']);
  }

  onAppChange(app: App) {
    const self = this;
    self.showProfileOptions = false;
    self.commonService.app = app;
    self.commonService.disconnectSocket();
    self.commonService.connectSocket();
    self.router.navigate(['/app', app._id]);
  }

  downloadIEG() {
    const self = this;
    self.downloadAgentModalTemplateRef = self.commonService.modal(
      self.downloadAgentModalTemplate
    );
    self.downloadAgentModalTemplateRef.result.then(
      (close) => {
        if (close) {
          self.agentConfig.os = close;
          if (close === 'k8s') {
            self.agentConfig.type = 'k8s';
          } else {
            self.agentConfig.type = 'others';
          }
          self.triggerAgentDownload();
        }
      },
      (dismiss) => {}
    );
  }

  triggerAgentDownload() {
    const self = this;
    const ele: HTMLAnchorElement = document.createElement('a');
    ele.target = '_blank';
    let queryParams;
    if (self.agentConfig.type !== 'k8s') {
      queryParams =
        `ieg/download/exec?` +
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
      self.commonService.get('partnerManager', '/agent/IEG/password').subscribe(
        (res) => {
          self.agentConfig.password = res.password;
        },
        (err) => {}
      );
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

  get authType() {
    const self = this;
    if (
      self.commonService.userDetails.auth &&
      self.commonService.userDetails.auth.authType
    ) {
      return self.commonService.userDetails.auth.authType;
    } else {
      return null;
    }
  }

  get lastLogin() {
    const self = this;
    return self.commonService.userDetails.lastLogin;
  }
}
