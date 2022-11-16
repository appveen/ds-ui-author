import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  TemplateRef,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  query,
  keyframes,
  group,
} from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { CommonService } from 'src/app/utils/services/common.service';
import { environment } from 'src/environments/environment';
import { App } from 'src/app/utils/interfaces/app';
import { AppService } from 'src/app/utils/services/app.service';
import { Breadcrumb } from '../utils/interfaces/breadcrumb';

@Component({
  selector: 'odp-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss'],
  animations: [
    trigger('userProfile', [
      transition('void=>*', [
        query(
          '.profile-data,.profile-thumbnail,.app-version,.last-login',
          style({ opacity: '0' })
        ),
        style({ height: '0px', position: 'fixed', opacity: '0.5' }),
        group([
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
export class AppsComponent implements OnInit, OnDestroy {
  @ViewChild('downloadAgentModalTemplate', { static: false })
  downloadAgentModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('searchAppInput', { static: false }) searchAppInput: ElementRef;
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
  hover: any;
  addBlur: boolean;
  toggleChangePassword: boolean;
  agentConfig: any;
  downloadAgentModalTemplateRef: NgbModalRef;
  openPanel: any = {
    data: true,
    integration: true,
    management: true,
  };
  breadcrumbPaths: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ts: ToastrService,
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
    self.hover = {};
    self.agentConfig = {};
    const trigger = self.commonService.breadcrumbTrigger;
    trigger.subscribe(val => {
      this.breadcrumbPaths = val
    })
  }

  ngOnInit() {
    const self = this;
    self.agentConfig.arch = 'amd64';
    self.agentConfig.os = 'windows';


    self.route.params.subscribe((params) => {
      if (params.app) {
        const tempApp = self.commonService.appList.find(
          (d) => d._id === params.app
        );
        if (tempApp) {
          // if (!tempApp.logo || !tempApp.logo.thumbnail) {
          self.commonService.getAppDetails(tempApp);
          // }
          self.commonService.app = tempApp;
          self.selectedApp = tempApp;
          self.commonService.appChange.emit(params.app);
          self.commonService.saveLastActiveApp();
          self.init();
        } else {
          self.router.navigate([
            '/app/',
            self.commonService.appList[0]._id,
            'sm',
          ]);
        }
      } else {
        if (self.commonService.app && self.commonService.app._id) {
          self.router.navigate(['/app/', self.commonService.app._id, 'sm']);
        } else {
          self.router.navigate([
            '/app/',
            self.commonService.appList[0]._id,
            'sm',
          ]);
        }
      }
    });
    self.commonService.appUpdates.subscribe((data) => {
      self.selectedApp = data;
    });
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
    self.appService.openAppSwitcher.subscribe((val) => {
      self.showAppOptions = true;
    });
  }

  init() {
    const self = this;
    self.isSuperAdmin = self.commonService.userDetails.isSuperAdmin;
    if (environment.production) {
      self.commonService.connectSocket();
    }
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
    self.commonService.saveLastActiveApp();
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

  toggleAppOptions() {
    const self = this;
    if (self.commonService.appList.length > 1) {
      self.showAppOptions = !self.showAppOptions;
    }
  }

  onAppChange(app: App) {
    const self = this;
    self.showProfileOptions = false;
    self.commonService.app = app;
    if (environment.production) {
      self.commonService.disconnectSocket();
      self.commonService.connectSocket();
    }
    self.showAppOptions = false;
    self.router.navigate(['/app', app._id]);
  }

  downloadIEG() {
    const self = this;
    self.downloadAgentModalTemplateRef = self.commonService.modal(
      self.downloadAgentModalTemplate,
      {
        centered: true,
        windowClass: 'download-agent-modal',
      }
    );
    self.agentConfig.showPassword = false;
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
      (dismiss) => { }
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
        (err) => { }
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

  openAPIsWindow() {
    const docsAPI = `${environment.url.doc}/?q=/api/a/common/txn`;
    window.open(docsAPI, '_blank');
  }

  get hasDataServicePermission() {
    const self = this;
    return (
      self.commonService.hasPermissionStartsWith('PMDS') ||
      self.commonService.hasPermissionStartsWith('PVDS')
    );
  }

  get hasPartnerPermission() {
    const self = this;
    return (
      this.commonService.hasPermissionStartsWith('PMP') ||
      this.commonService.hasPermissionStartsWith('PVP')
    );
  }

  get hasDataLibraryPermission() {
    const self = this;
    return (
      self.commonService.hasPermission('PML') ||
      self.commonService.hasPermission('PVL')
    );
  }

  get hasConnectorsPermission() {
    const self = this;
    return (
      self.commonService.hasPermission('PMCON') ||
      self.commonService.hasPermission('PVCON')
    );
  }

  get hasFunctionsPermission() {
    const self = this;
    return (
      self.commonService.hasPermission('PMF') ||
      self.commonService.hasPermission('PVF')
    );
  }

  get hasUsersPermission() {
    const self = this;
    return (
      self.commonService.hasPermissionStartsWith('PVU') ||
      self.commonService.hasPermissionStartsWith('PMU')
    );
  }

  get hasBotPermission() {
    const self = this;
    return (
      self.commonService.hasPermissionStartsWith('PVBB') ||
      self.commonService.hasPermissionStartsWith('PMBB')
    );
  }

  get hasGroupsPermission() {
    const self = this;
    return (
      self.commonService.hasPermissionStartsWith('PMG') ||
      self.commonService.hasPermissionStartsWith('PVG')
    );
  }

  get hasDataFormatPermission() {
    const self = this;
    return (
      self.commonService.hasPermission('PMDF') ||
      self.commonService.hasPermission('PVDF')
    );
  }
  get hasBookmarkPermission() {
    const self = this;
    return (
      self.commonService.hasPermission('PMBM') ||
      self.commonService.hasPermission('PVBM')
    );
  }
  get hasAgentsPermission() {
    const self = this;
    return (
      self.commonService.hasPermissionStartsWith('PMA') ||
      self.commonService.hasPermissionStartsWith('PVA')
    );
  }
  get hasNanoServicePermission() {
    const self = this;
    return (
      self.commonService.hasPermissionStartsWith('PMNS') ||
      self.commonService.hasPermissionStartsWith('PVNS')
    );
  }
  get hasInsightsPermission() {
    const self = this;
    return (
      self.commonService.hasPermission('PVISDS') ||
      self.commonService.hasPermission('PVISU') ||
      self.commonService.hasPermission('PVISG')
    );
  }

  get authType() {
    const self = this;
    if (self.commonService.userDetails && self.commonService.userDetails.auth) {
      return self.commonService.userDetails.auth.authType;
    }
    return null;
  }

  get isAppAdmin() {
    const self = this;
    return self.commonService.isAppAdmin;
  }

  get enableB2b() {
    return this.commonService.userDetails.b2BEnable;
    // return true;
  }

  get experimentalFeatures() {
    return this.commonService.userDetails.experimentalFeatures;
    // return true;
  }

  get lastLogin() {
    const self = this;
    return self.commonService.userDetails.lastLogin;
  }

  toggleNav() {
    this.showSideNav = !this.showSideNav;
    if (!this.showSideNav) {
      const keys = Object.keys(this.openPanel);
      keys.forEach((key) => (this.openPanel[key] = true));
    }
  }
  togglePanel(panel) {
    this.openPanel[panel] = !this.openPanel[panel];
  }

  getBreadcrumbs() {
    return this.breadcrumbPaths
  }
}
