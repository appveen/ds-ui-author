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
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import { App } from '../../models/app';
import { AppService } from '../../utils/services/app.service';
import { CommonService } from '../../utils/services/common.service';

@Component({
  selector: 'odp-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
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
export class HomeComponent implements OnInit, OnDestroy {
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
  navToApp: any;
  constructor(
    // private route: ActivatedRoute,
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
    self.roleList = [];
    self.agentConfig = {};
  }
  ngOnInit() {
    const self = this;
    self.agentConfig.arch = 'amd64';
    self.agentConfig.os = 'windows';
    self.init()
    self.addBlur = self.commonService.addBlur;
    self.commonService.apiCalls.componentLoading = false;
    self.username =
      self.commonService.userDetails?.username ||
      JSON.parse(localStorage.getItem('ba-user')).username;
    if (self.commonService.userDetails?.basicDetails?.name) {
      self.name = self.commonService.userDetails.basicDetails.name;
    }
    self.appService.toggleSideNav.subscribe((val) => {
      self.showSideNav = val;
    });

    if (self.commonService.app) {
      self.navToApp = self.commonService.app;
    }
  }

  init() {
    const self = this;
    self.isSuperAdmin =
      self.commonService.userDetails?.isSuperAdmin ||
      JSON.parse(localStorage.getItem('ba-user')).isSuperAdmin;
    if (environment.production) {
      self.commonService.connectSocket();
    }
  }

  // loadApps() {
  //   const self = this;
  //   self.searchAppInput.nativeElement.focus();
  //   self.apps = [];
  //   self.loadingApps = true;
  //   self.commonService
  //     .isAuthenticated()
  //     .then((res) => {
  //       self.loadingApps = false;
  //       self.apps = res.apps;
  //     })
  //     .catch((err) => {
  //       self.loadingApps = false;
  //     });
  // }

  // changeApp(name) {
  //   const self = this;
  //   self.showAppOptions = false;
  //   self.showProfileOptions = false;
  //   self.searchApp = '';
  //   if (self.commonService.app._id === name) {
  //     return;
  //   }
  //   const tempIndex = self.apps.findIndex((d) => d._id === name);
  //   self.selectedApp = self.apps[tempIndex];
  //   self.commonService.app = self.selectedApp;
  //   self.router.navigate(['/app/', name]);
  // }

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

  // onAppChange(app: App) {
  //   const self = this;
  //   self.showProfileOptions = false;
  //   self.commonService.app = app;
  //   self.commonService.disconnectSocket();
  //   self.commonService.connectSocket();
  //   self.router.navigate(['/app', app._id]);
  // }

  // downloadIEG() {
  //   const self = this;
  //   self.downloadAgentModalTemplateRef = self.commonService.modal(
  //     self.downloadAgentModalTemplate
  //   );
  //   self.downloadAgentModalTemplateRef.result.then(
  //     (close) => {
  //       if (close) {
  //         self.agentConfig.os = close;
  //         if (close === 'k8s') {
  //           self.agentConfig.type = 'k8s';
  //         } else {
  //           self.agentConfig.type = 'others';
  //         }
  //         self.triggerAgentDownload();
  //       }
  //     },
  //     (dismiss) => { }
  //   );
  // }

  // triggerAgentDownload() {
  //   const self = this;
  //   const ele: HTMLAnchorElement = document.createElement('a');
  //   ele.target = '_blank';
  //   let queryParams;
  //   if (self.agentConfig.type !== 'k8s') {
  //     queryParams =
  //       `ieg/download/exec?` +
  //       `os=${self.agentConfig.os}&arch=${self.agentConfig.arch}`;
  //   } else {
  //     queryParams = `ieg/download/k8s`;
  //   }
  //   if (environment.production) {
  //     ele.href = `${environment.url.partnerManager}/${queryParams}`;
  //   } else {
  //     ele.href = `http://localhost/api/a/pm/${queryParams}`;
  //   }
  //   ele.click();
  //   ele.remove();
  // }

  // getAgentPassword() {
  //   const self = this;
  //   if (!self.agentConfig.password) {
  //     self.commonService.get('partnerManager', '/agent/IEG/password').subscribe(
  //       (res) => {
  //         self.agentConfig.password = res.password;
  //       },
  //       (err) => { }
  //     );
  //   }
  // }

  // copyPassword() {
  //   const self = this;
  //   self.agentConfig.copied = true;
  //   self.appService.copyToClipboard(self.agentConfig.password);
  //   setTimeout(() => {
  //     self.agentConfig.copied = false;
  //   }, 3000);
  // }

  get authType() {
    const self = this;
    if (
      self.commonService.userDetails?.auth?.authType ||
      JSON.parse(localStorage.getItem('ba-user')).auth?.authType
    ) {
      return (
        self.commonService.userDetails?.auth?.authType ||
        JSON.parse(localStorage.getItem('ba-user')).auth.authType
      );
    } else {
      return null;
    }
  }

  get lastLogin() {
    const self = this;
    return (
      self.commonService.userDetails?.lastLogin ||
      JSON.parse(localStorage.getItem('ba-user')).lastLogin
    );
  }
  get isAppAdmin() {
    const self = this;
    return self.commonService.isAppAdmin;
  }

}



// })
// export class HomeComponent implements OnInit {

//   constructor() { }

//   ngOnInit() {
//   }

// }
