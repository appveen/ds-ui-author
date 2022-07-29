import { Injectable, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

import {
  NgbModalRef,
  NgbModal,
  NgbModalOptions,
} from '@ng-bootstrap/ng-bootstrap';
import {
  HttpHeaders,
  HttpClient,
  HttpParams,
  HttpRequest,
  HttpEvent,
  HttpEventType,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, interval, timer, of } from 'rxjs';
import {
  delayWhen,
  filter,
  flatMap,
  map,
  switchMap,
  take,
} from 'rxjs/operators';
import * as sh from 'shorthash';
import * as uuid from 'uuid/v1';
import {
  connect,
  Socket,
  ManagerOptions,
  SocketOptions,
} from 'socket.io-client';

import { UserDetails } from 'src/app/utils/interfaces/userDetails';
import { environment } from 'src/environments/environment';
import { App } from 'src/app/utils/interfaces/app';
import { AppService } from './app.service';
import { Role } from 'src/app/utils/interfaces/role';
import { CanComponentDeactivate } from '../guards/route.guard';
import { SessionService } from './session.service';
import { Breadcrumb } from '../interfaces/breadcrumb';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private autoRefreshRoutine: any;
  private heartBeatRoutine: any;
  private sessionWarningRoutine: any;
  private subscriptions: any;
  private extendApi: () => Observable<any>;
  private fetchUserRolesApi: () => Observable<any>;
  private isAuthenticatedApi: (noLoader?: boolean) => Observable<any>;
  private deleteApi: (type, url, data?) => Observable<any>;
  uploadFile: (type, url, data) => Observable<any>;
  refreshToken: () => Observable<any>;
  sendHeartBeat: () => Observable<any>;
  get: (type, url, options?: GetOptions) => Observable<any>;
  put: (type, url, data?) => Observable<any>;
  post: (type, url, data) => Observable<any>;
  commonSpinner: boolean;
  addBlur: boolean;
  apiCalls: any;
  appCreation: EventEmitter<any>;
  appChange: EventEmitter<any>;
  addDataFormat: EventEmitter<boolean>;
  app: App;
  appList: App[];
  entity: {
    new: EventEmitter<any>;
    status: EventEmitter<any>;
    delete: EventEmitter<any>;
  };
  flow: {
    new: EventEmitter<any>;
    status: EventEmitter<any>;
    delete: EventEmitter<any>;
  };
  faas: {
    new: EventEmitter<any>;
    status: EventEmitter<any>;
    delete: EventEmitter<any>;
  };
  bulkUpload: {
    status: EventEmitter<any>;
  };
  socket: Socket;
  permissions: Array<Permission>;
  rcvdKeys: any;
  sessionExpired: EventEmitter<void>;
  sessionTimeoutWarning: EventEmitter<number>;
  noAccess: boolean;
  userDetails: UserDetails;
  lastAppPrefId: string;
  userLoggedOut: EventEmitter<any>;
  appUpdates: EventEmitter<any>;
  connectionDetails: ConnectionDetails;
  activeComponent: CanComponentDeactivate;
  currentAppUpdated: Subject<string>;
  serviceMap: any;
  userMap: any;
  viewMicroFlow: boolean;
  stallRequests: boolean;
  private stallTime: number;
  private stallCount = 0;
  breadcrumbPaths: Array<Breadcrumb>;

  constructor(
    private http: HttpClient,
    private appService: AppService,
    private router: Router,
    private modalService: NgbModal,
    private ts: ToastrService,
    private sessionService: SessionService
  ) {
    const self = this;
    self.commonSpinner = false;
    self.apiCalls = {};
    self.permissions = [];
    self.appList = [];
    self.appChange = new EventEmitter();
    self.appCreation = new EventEmitter();
    self.addDataFormat = new EventEmitter<boolean>();
    self.userLoggedOut = new EventEmitter();
    self.sessionTimeoutWarning = new EventEmitter<number>();
    self.sessionWarningRoutine = {};
    self.entity = {
      new: new EventEmitter(),
      status: new EventEmitter(),
      delete: new EventEmitter(),
    };
    self.flow = {
      new: new EventEmitter(),
      status: new EventEmitter(),
      delete: new EventEmitter(),
    };
    self.faas = {
      new: new EventEmitter(),
      status: new EventEmitter(),
      delete: new EventEmitter(),
    };
    self.bulkUpload = {
      status: new EventEmitter(),
    };
    self.sessionExpired = new EventEmitter<void>();
    self.currentAppUpdated = new Subject<string>();
    self.appUpdates = new EventEmitter();
    self.subscriptions = {};
    self.serviceMap = [];
    self.userMap = [];
    self.viewMicroFlow = false;
    [
      'extendApi',
      'uploadFile',
      'refreshToken',
      'sendHeartBeat',
      'fetchUserRolesApi',
      'isAuthenticatedApi',
      'get',
      'put',
      'post',
      'deleteApi',
    ].forEach((method) => {
      this[method] = (...args) => {
        let user = this.sessionService.getUser();
        if (!!user && typeof user === 'string') {
          user = JSON.parse(user);
        }
        if (!!user?.rbacUserToSingleSession) {
          this.stallCount += this.stallRequests ? 1 : 0;
          return of(true).pipe(
            map(() => (!!this.stallTime ? Date.now() - this.stallTime : 0)),
            delayWhen(() =>
              timer(0, 50).pipe(
                filter(() => !this.stallRequests),
                take(1)
              )
            ),
            switchMap((val) => {
              if (!val || !this.stallCount) {
                return this['_' + method + '_'](...args);
              }
              this.stallCount -= 1;
              return timer(new Date(Date.now() + val)).pipe(
                take(1),
                switchMap(() => this['_' + method + '_'](...args))
              );
            })
          );
        } else {
          return this['_' + method + '_'](...args);
        }
      };
    });
  }

  afterAuthentication(): Promise<any> {
    const self = this;
    self.apiCalls.afterAuthentication = true;
    return new Promise((resolve, reject) => {
      if (!self.userDetails.isSuperAdmin) {
        const arr = [];
        arr.push(self.fetchUserRoles());
        arr.push(self.getUserApps());
        Promise.all(arr).then(
          (res1) => {
            self.fetchLastActiveApp().then(
              (app) => {
                self.apiCalls.afterAuthentication = false;
                resolve(res1[0]);
              },
              (err: any) => {
                self.apiCalls.afterAuthentication = false;
                reject(err);
              }
            );
          },
          (err: any) => {
            self.apiCalls.afterAuthentication = false;
            reject(err);
          }
        );
      } else {
        const arr = [];
        arr.push(self.fetchAllApps());
        Promise.all(arr).then(
          (r) => {
            self.fetchLastActiveApp().then(
              (app) => {
                self.apiCalls.afterAuthentication = false;
                resolve({ status: 200 });
              },
              (err: any) => {
                self.apiCalls.afterAuthentication = false;
                reject(err);
              }
            );
          },
          (err: any) => {
            self.apiCalls.afterAuthentication = false;
            reject(err);
          }
        );
      }
    });
  }

  fetchAllApps() {
    const self = this;
    const options: GetOptions = {
      count: -1,
      noApp: true,
      select: 'description,logo.thumbnail,defaultTimezone',
      sort: '_id',
    };
    return new Promise<any>((resolve, reject) => {
      self.subscriptions['getAllApps'] = self
        .get('user', '/admin/app', options)
        .subscribe(
          (res) => {
            self.appList = res;
            self.appList.forEach(app => {
              app.firstLetter = app._id.charAt(0);
              app.bg = this.appColor();
            })
            self.app = self.appList[0];
            resolve(res);
          },
          (err: any) => {
            reject(err);
          }
        );
    });
  }

  getUserApps() {
    const self = this;
    const options: GetOptions = {
      count: -1,
      noApp: true,
      select: 'description,logo.thumbnail,defaultTimezone',
      sort: '_id',
    };
    return new Promise<any>((resolve, reject) => {
      self.subscriptions['getAllApps'] = self
        .get('user', '/data/app', options)
        .subscribe(
          (res) => {
            self.appList = res;
            self.app = self.appList[0];
            resolve(res);
          },
          (err: any) => {
            reject(err);
          }
        );
    });
  }

  private _fetchUserRolesApi_() {
    const self = this;
    const URL =
      environment.url['user'] + `/data/${self.userDetails._id}/allRoles`;
    const filter: any = {
      'roles.type': 'author',
    };
    let httpParams = new HttpParams();
    httpParams = httpParams.set('filter', JSON.stringify(filter));
    return self.http.get(URL, {
      headers: self._getHeaders(false),
      params: httpParams,
    });
  }

  fetchUserRoles() {
    const self = this;
    self.noAccess = false;
    if (self.subscriptions['fetchUserRoles']) {
      self.subscriptions['fetchUserRoles'].unsubscribe();
    }
    return new Promise<any>((resolve, reject) => {
      self.subscriptions['fetchUserRoles'] = this.fetchUserRolesApi().subscribe(
        (data: any) => {
          self.permissions = [];
          if (data && data.roles && data.roles.length > 0) {
            self.permissions = data.roles.filter((e) => e.type === 'author');
          }
          const apps: Array<App> = self.permissions
            .map((e) => e.app)
            .filter((e, i, a) => a.indexOf(e) === i)
            .map((e) => Object.defineProperty({}, '_id', { value: e }));
          if (!self.userDetails.accessControl) {
            self.userDetails.accessControl = {};
          }
          if (!self.userDetails.accessControl.apps) {
            self.userDetails.accessControl.apps = [];
          }
          self.userDetails.apps = apps
            .concat(self.userDetails.accessControl.apps)
            .filter((e, i, a) => a.findIndex((x) => x._id === e._id) === i);
          self.appList = self.userDetails.apps;
          if (self.appList && self.appList.length > 0) {
            self.app = self.appList[0];
            const arr = [];
            arr.push(self.getAppsDetails(self.appList));
            Promise.all(arr).then(
              (r) => {
                resolve({ status: 200 });
              },
              (err: any) => {
                reject(err);
              }
            );
          } else {
            self.noAccess = true;
            resolve({
              status: 401,
              message: "You don't have enough permissions",
            });
          }
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  getAppDetails(app: App): Promise<any> {
    const self = this;
    if (self.subscriptions['getAppDetails_' + app._id]) {
      self.subscriptions['getAppDetails_' + app._id].unsubscribe();
    }
    return new Promise((resolve, reject) => {
      self.subscriptions['getAppDetails_' + app._id] = self
        .get('user', '/data/app/' + app._id)
        .subscribe(
          (res: any) => {
            app.logo = res.logo;
            app.appCenterStyle = res.appCenterStyle;
            app.description = res.description;
            app.serviceVersionValidity = res.serviceVersionValidity;
            resolve(res);
          },
          (err: any) => {
            if (err.status === 404) {
              if (!self.appList) {
                self.appList = [];
              }
              const index = self.appList.findIndex((e) => e._id === app._id);
              if (index > -1) {
                self.appList.splice(index, 1);
              }
            }
            resolve(err);
          }
        );
    });
  }

  getAppsDetails(appList: Array<App>): Promise<any> {
    const self = this;
    if (self.subscriptions['getAppsDetails']) {
      self.subscriptions['getAppsDetails'].unsubscribe();
    }
    if (!self.appList) {
      self.appList = [];
    }
    const promises = [];
    const ids = appList.map((e) => e._id);
    if (ids.length > 40) {
      while (ids.length > 0) {
        fetch(ids.splice(0, 20));
      }
    } else {
      fetch(ids);
    }
    function fetch(idList: Array<string>) {
      promises.push(
        new Promise((resolve, reject) => {
          self.subscriptions['getAppsDetails'] = self
            .get('user', '/data/app/', {
              noApp: true,
              count: -1,
              select: 'description,logo.thumbnail,defaultTimezone',
              sort: '_id',
              filter: {
                _id: {
                  $in: idList,
                },
              },
            })
            .subscribe(
              (res: Array<App>) => {
                self.appList.forEach((app) => {
                  const temp = res.find((e) => e._id === app._id);
                  if (temp) {
                    app.logo = temp.logo;
                    app.appCenterStyle = temp.appCenterStyle;
                    app.description = temp.description;
                    app.serviceVersionValidity = temp.serviceVersionValidity;
                  }
                });
                resolve(res);
              },
              (err: any) => {
                resolve(err);
              }
            );
        })
      );
    }
    return Promise.all(promises);
  }

  fetchLastActiveApp(): Promise<any> {
    const self = this;
    if (self.subscriptions['fetchLastActiveApp']) {
      self.subscriptions['fetchLastActiveApp'].unsubscribe();
    }
    return new Promise<any>((resolve, reject) => {
      const options: GetOptions = {
        filter: {
          userId: self.userDetails._id,
          type: 'last-app',
          key: 'author',
        },
        noApp: true,
      };
      self.lastAppPrefId = null;
      self.subscriptions['fetchLastActiveApp'] = self
        .get('user', '/data/preferences', options)
        .subscribe(
          (prefRes) => {
            if (prefRes && prefRes.length > 0) {
              self.lastAppPrefId = prefRes[0]._id;
              if (prefRes[0].value) {
                const temp = self.appList.find(
                  (e) => e._id === prefRes[0].value
                );
                if (temp) {
                  self.app = temp;
                } else {
                  self.deleteLastActiveApp().then(
                    (res) => { },
                    (err) => { }
                  );
                }
              }
              resolve(prefRes[0].value);
            } else {
              resolve(null);
            }
          },
          (err) => {
            resolve(null);
          }
        );
    });
  }

  saveLastActiveApp(): Promise<any> {
    const self = this;
    if (self.subscriptions['saveLastActiveApp']) {
      self.subscriptions['saveLastActiveApp'].unsubscribe();
    }
    return new Promise<any>((resolve, reject) => {
      const payload = {
        userId: self.userDetails._id,
        type: 'last-app',
        key: 'author',
        value: self.app._id,
      };
      let response: Observable<any>;
      if (self.lastAppPrefId) {
        response = self.put(
          'user',
          '/data/preferences/' + self.lastAppPrefId,
          payload
        );
      } else {
        response = self.post('user', '/data/preferences', payload);
      }
      self.subscriptions['saveLastActiveApp'] = response.subscribe(
        (res) => {
          self.lastAppPrefId = res._id;
          resolve(res._id);
        },
        (err) => {
          resolve(null);
        }
      );
    });
  }

  deleteLastActiveApp(): Promise<any> {
    const self = this;
    if (self.subscriptions['deleteLastActiveApp']) {
      self.subscriptions['deleteLastActiveApp'].unsubscribe();
    }
    return new Promise<any>((resolve, reject) => {
      if (self.lastAppPrefId) {
        self.subscriptions['deleteLastActiveApp'] = self
          .delete('user', '/data/preferences/' + self.lastAppPrefId)
          .subscribe(
            (res) => {
              self.lastAppPrefId = null;
              resolve(null);
            },
            (err) => {
              resolve(null);
            }
          );
      } else {
        resolve(null);
      }
    });
  }

  closeAllSessions(userId: string) {
    const self = this;
    if (self.subscriptions['closeAllSessions']) {
      self.subscriptions['closeAllSessions'].unsubscribe();
    }
    return new Promise<any>((resolve, reject) => {
      self.subscriptions['closeAllSessions'] = self
        .delete(
          'user',
          `/${this.app._id}/user/utils/closeAllSessions/${userId}`
        )
        .subscribe(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
    });
  }

  login(credentials: Credentials): Promise<any> {
    const self = this;
    if (self.subscriptions['login']) {
      self.subscriptions['login'].unsubscribe();
    }
    return new Promise<any>((resolve, reject) => {
      self.subscriptions['login'] = self.http
        .post(environment.url.user + '/auth/login', credentials)
        .subscribe(
          (response: any) => {
            self.resetUserDetails(response);
            resolve(response);
          },
          (err: any) => {
            reject(err);
          }
        );
    });
  }

  ldapLogin(credentials: Credentials): Promise<any> {
    const self = this;
    if (self.subscriptions['login']) {
      self.subscriptions['login'].unsubscribe();
    }
    return new Promise<any>((resolve, reject) => {
      self.subscriptions['login'] = self.http
        .post(environment.url.user + '/auth/ldap/login', credentials)
        .subscribe(
          (response: any) => {
            self.resetUserDetails(response);
            resolve(response);
          },
          (err: any) => {
            reject(err);
          }
        );
    });
  }

  private _extendApi_() {
    const self = this;
    const token = self.sessionService.getToken();
    if (!token) {
      this.ts.error('Invalid Session');
      console.log('Invalid Session');
      this.logout();
      return;
    }
    const httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'JWT ' + token);
    return self.http.get(environment.url.user + '/auth/extend', {
      headers: httpHeaders,
    });
  }

  extend(): Promise<any> {
    const self = this;
    if (self.subscriptions['extend']) {
      self.subscriptions['extend'].unsubscribe();
    }
    return new Promise<any>((resolve, reject) => {
      self.subscriptions['extend'] = self.extendApi().subscribe(
        (response: any) => {
          self.clearData();
          self.resetUserDetails(response);
          self.afterAuthentication().then(
            (res) => {
              resolve(response);
            },
            (err) => {
              reject(err);
            }
          );
        },
        (err: any) => {
          if (err.status === 401) {
            self.sessionExpired.emit();
          }
          reject(err);
        }
      );
    });
  }

  private setFirstApp() {
    const self = this;
    if (self.appList && self.appList.length > 0) {
      self.app = self.appList[0];
    }
  }

  resetUserDetails(response: UserDetails) {
    const self = this;
    if (!response.auth || !response.auth.authType) {
      response.auth = {
        authType: 'local',
      };
    }
    if (response.token) {
      self.userDetails = JSON.parse(JSON.stringify(response));
      self.sessionService.saveSessionData(response);
    } else {
      self.noAccess = true;
    }
    if (response.apps && response.apps.length > 0) {
      self.appList = response.apps;
      self.app = self.appList[0];
    }
    if (
      self.userDetails.rbacUserToSingleSession ||
      self.userDetails.rbacUserCloseWindowToLogout
    ) {
      sessionStorage.setItem('ba-uuid', self.userDetails.uuid);
      self.createHeartBeatRoutine();
    }
    if (self.userDetails.rbacUserTokenRefresh) {
      self.createAutoRefreshRoutine();
    } else {
      self.enableSessionTimoutWarning();
    }
  }

  private _getHeaders(skipAuth: boolean) {
    const self = this;
    const httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json; version=2')
      .set('txnId', sh.unique(uuid() + '-' + self.appService.randomStr(5)));
    if (!skipAuth) {
      const token = self.sessionService.getToken();
      if (!token) {
        this.ts.error('Invalid Session');
        console.log('Invalid Session');
        this.logout();
        return;
      } else {
        httpHeaders.set('Authorization', 'JWT ' + token);
      }
    }
    return httpHeaders;
  }

  private _get_(type, url, options?: GetOptions): Observable<any> {
    const self = this;
    let urlParams = new HttpParams();
    if (!options) {
      options = {};
    }
    if (!options.noApp) {
      if (!options.filter) {
        options.filter = { app: self.app._id };
      } else {
        options.filter.app = self.app._id;
      }
    }
    if (options.page) {
      urlParams = urlParams.set('page', options.page.toString());
    }
    if (options.count) {
      urlParams = urlParams.set('count', options.count.toString());
    }
    if (options.select) {
      urlParams = urlParams.set('select', options.select);
    }
    if (options.sort) {
      urlParams = urlParams.set('sort', options.sort);
    }
    if (options.filter) {
      urlParams = urlParams.set('filter', JSON.stringify(options.filter));
    }
    if (options.serviceIds) {
      urlParams = urlParams.set('serviceIds', options.serviceIds);
    }
    if (options.fields) {
      urlParams = urlParams.set('fields', options.fields);
    }
    if (options.apps) {
      urlParams = urlParams.set('apps', options.apps);
    }
    const URL = environment.url[type] + url;
    return self.http.get(URL, {
      params: urlParams,
      headers: self._getHeaders(options.skipAuth),
    });
  }

  private _put_(type, url, data?): Observable<any> {
    const self = this;
    const URL = environment.url[type] + url;
    return self.http.put(URL, data, { headers: self._getHeaders(false) });
  }

  private _post_(type, url, data): Observable<any> {
    const self = this;
    const URL = environment.url[type] + url;
    return self.http.post(URL, data, { headers: self._getHeaders(false) });
  }

  private _uploadFile_(type, url, data) {
    const self = this;
    const token = self.sessionService.getToken();
    if (!token) {
      this.ts.error('Invalid Session');
      console.log('Invalid Session');
      this.logout();
      return;
    }
    const httpHeaders = new HttpHeaders()
      .set('Authorization', 'JWT ' + token)
      .set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT')
      .set('Access-Control-Allow-Origin', '*')
      .set('txnId', sh.unique(uuid() + '-' + self.randomStr(5)));
    url = environment.url[type] + url;
    return self.http.request(
      new HttpRequest('POST', url, data, {
        reportProgress: true,
        headers: httpHeaders,
      })
    );
  }

  private _deleteApi_(type, url, data?) {
    const self = this;
    const URL = environment.url[type] + url;
    let httpParams = new HttpParams();
    httpParams = httpParams.set(
      'filter',
      JSON.stringify({ app: this.app?._id })
    );
    return self.http.request(
      new HttpRequest('DELETE', URL, data, {
        headers: self._getHeaders(false),
        params: httpParams,
      })
    );
  }

  delete(type, url, data?): Observable<any> {
    const self = this;
    return new Observable((observe) => {
      self.deleteApi(type, url, data).subscribe(
        (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.Response) {
            if (event.status >= 200 && event.status < 300) {
              observe.next(event.body);
            } else {
              observe.error(event.body);
            }
          }
        },
        (err) => {
          observe.error(err);
        }
      );
    });
  }

  private _isAuthenticatedApi_(noLoader?: boolean) {
    const self = this;
    const URL = environment.url['user'] + '/auth/check';
    return self.http.get(URL, { headers: self._getHeaders(false) });
  }

  isAuthenticated(noLoader?: boolean) {
    const self = this;
    if (self.subscriptions['isAuthenticated']) {
      self.subscriptions['isAuthenticated'].unsubscribe();
    }
    return new Promise<any>((resolve, reject) => {
      if (!noLoader) {
        self.apiCalls.isAuthenticated = true;
      }
      self.subscriptions['isAuthenticated'] = self
        .isAuthenticatedApi(noLoader)
        .subscribe(
          (val) => {
            self.resetUserDetails(val);
            self.checkAuthType().then(
              (res) => {
                self.apiCalls.isAuthenticated = false;
                resolve(val);
              },
              (err) => {
                self.apiCalls.isAuthenticated = false;
                reject(err);
              }
            );
          },
          (err: any) => {
            self.apiCalls.isAuthenticated = false;
            reject(err);
            return err;
          }
        );
    });
  }

  checkAuthType() {
    const self = this;
    const URL =
      environment.url['user'] + '/auth/authType/' + self.userDetails._id;
    if (self.subscriptions['checkAuthType']) {
      self.subscriptions['checkAuthType'].unsubscribe();
    }
    return new Promise((resolve, reject) => {
      self.subscriptions['checkAuthType'] = self.http.get(URL).subscribe(
        (val: any) => {
          if (!!val?.auth) {
            self.connectionDetails = val.auth.connectionDetails;
          }
          if (!!val?.validAuthTypes?.length) {
            this.appService.validAuthTypes = val.validAuthTypes;
          }
          resolve(val);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  logout(noRedirect?) {
    const self = this;
    self.stallRequests = false;
    self.stallCount = 0;
    self.stallTime = null;
    if (self.subscriptions['logout']) {
      self.subscriptions['logout'].unsubscribe();
    }
    if (self.sessionService.getUser()) {
      if (self.activeComponent && self.activeComponent.canDeactivate) {
        const returned = self.activeComponent.canDeactivate();
        const type = typeof returned;
        if (type === 'boolean') {
          if (returned) {
            self.userLoggedOut.emit(true);
            self.subscriptions['logout'] = self
              .delete('user', '/auth/logout')
              .subscribe(
                (res) => {
                  self.clearData();
                  self.appService.setFocus.emit('username');
                  if (!noRedirect) {
                    // self.ts.success('You are logged out successfully');
                    self.router.navigate(['/auth']);
                  }
                },
                (err) => {
                  console.error(err);
                }
              );
          }
        } else {
          (returned as any).then(
            (result) => {
              if (result) {
                self.userLoggedOut.emit(true);
                self.subscriptions['logout'] = self
                  .delete('user', '/auth/logout')
                  .subscribe(
                    (res) => {
                      self.clearData();
                      self.appService.setFocus.emit('username');
                      if (!noRedirect) {
                        // self.ts.success('You are logged out successfully');
                        self.router.navigate(['/auth']);
                      }
                    },
                    (err) => {
                      console.error(err);
                    }
                  );
              }
            },
            (err) => { }
          );
        }
      } else {
        self.userLoggedOut.emit(true);
        self.subscriptions['logout'] = self
          .delete('user', '/auth/logout')
          .subscribe(
            (res) => {
              self.clearData();
              if (!noRedirect) {
                // self.ts.success('You are logged out successfully');
                self.router.navigate(['/auth']);
              }
              self.appService.setFocus.emit('username');
            },
            (err) => {
              console.error(err);
            }
          );
      }
    } else {
      self.clearData();
      self.appService.setFocus.emit('username');
      self.router.navigate(['/auth']);
    }
  }

  deleteAllCookies() {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf('=');
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  clearData(notCurrentApp?: boolean) {
    const self = this;
    self.sessionService.clearSession();
    if (self.autoRefreshRoutine) {
      clearTimeout(self.autoRefreshRoutine);
    }
    if (self.heartBeatRoutine) {
      clearTimeout(self.heartBeatRoutine);
    }
    if (self.subscriptions['sendHeartBeat']) {
      self.subscriptions['sendHeartBeat'].unsubscribe();
    }
    if (self.subscriptions['refreshToken']) {
      self.subscriptions['refreshToken'].unsubscribe();
    }
    Object.keys(self.sessionWarningRoutine).forEach((key) => {
      if (self.sessionWarningRoutine[key]) {
        clearTimeout(self.sessionWarningRoutine[key]);
      }
    });
    if (!notCurrentApp) {
      self.app = null;
      self.appList = null;
    }
    self.userDetails = {};
    self.apiCalls = {};
    self.noAccess = false;
    self.disconnectSocket();
    self.ts.clear();
    this.deleteAllCookies();
  }

  private _refreshToken_() {
    const self = this;
    const token = self.sessionService.getToken();
    if (!token) {
      this.ts.error('Invalid Session');
      console.log('Invalid Session');
      this.logout();
      return;
    }
    let user = self.sessionService.getUser();
    if (typeof user === 'string') {
      user = JSON.parse(user);
    }
    if (!!user?.rbacUserToSingleSession) {
      this.stallRequests = true;
      this.stallTime = Date.now();
    }
    const httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'JWT ' + token)
      .set('rToken', 'JWT ' + self.sessionService.getRefreshToken())
      .set('txnId', sh.unique(uuid() + '-' + self.appService.randomStr(5)));
    const URL = environment.url.user + '/auth/refresh';
    return self.http.get(URL, { headers: httpHeaders });
  }

  private _sendHeartBeat_() {
    const self = this;
    const token = self.sessionService.getToken();
    if (!token) {
      this.ts.error('Invalid Session');
      console.log('Invalid Session');
      this.logout();
      return;
    }
    const httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'JWT ' + token)
      .set('txnId', sh.unique(uuid() + '-' + self.appService.randomStr(5)));
    const URL = environment.url.user + '/auth/hb';
    const payload = {
      uuid: sessionStorage.getItem('ba-uuid'),
    };
    return self.http.put(URL, payload, { headers: httpHeaders });
  }

  createAutoRefreshRoutine() {
    const resolveIn =
      this.userDetails.expiresIn -
      new Date(this.userDetails.serverTime).getTime() -
      300000;
    const intervalValue =
      ((this.userDetails.bot
        ? this.userDetails.rbacBotTokenDuration
        : this.userDetails.rbacUserTokenDuration) -
        5 * 60) *
      1000;
    this.handleRefreshToken(timer(resolveIn), 'firstRefresh', () => {
      this.handleRefreshToken(interval(intervalValue), 'subsequentRefresh');
    });
  }

  handleRefreshToken(
    onEvent: Observable<any>,
    subscriptionId: string,
    callback?: () => void
  ) {
    if (!!subscriptionId && !!this.subscriptions[subscriptionId]) {
      this.subscriptions[subscriptionId].unsubscribe();
    }
    if (
      !!subscriptionId &&
      subscriptionId === 'firstRefresh' &&
      !!this.subscriptions['subsequentRefresh']
    ) {
      this.subscriptions['subsequentRefresh'].unsubscribe();
    }

    const newSubscription = onEvent
      .pipe(switchMap((e) => this.refreshToken()))
      .subscribe(
        (res: any) => {
          this.userDetails.expiresIn = res.expiresIn;
          let userData = this.appService.cloneObject(this.userDetails);
          userData.token = res.token;
          userData.rToken = res.rToken;
          userData.uuid = res.uuid;
          this.sessionService.saveSessionData(userData);
          this.stallRequests = false;
          if (!!callback) {
            callback();
          }
        },
        (err) => this.logout()
      );

    if (!!subscriptionId) {
      this.subscriptions[subscriptionId] = newSubscription;
    }
  }

  createHeartBeatRoutine() {
    const self = this;
    const resolveIn = self.userDetails.rbacHbInterval * 1000 - 1000;
    self.sendHeartBeat().subscribe(
      (data) => {
        self.subscriptions['sendHeartBeat'] = interval(resolveIn)
          .pipe(flatMap((e) => self.sendHeartBeat()))
          .subscribe(
            (res2: any) => { },
            (err) => self.logout()
          );
      },
      (err) => self.logout()
    );
  }

  enableSessionTimoutWarning() {
    const self = this;
    const resolveIn =
      self.userDetails.expiresIn -
      new Date(self.userDetails.serverTime).getTime() -
      300000;
    // return new Observable<number>(observer => {
    if (resolveIn > 0) {
      self.sessionWarningRoutine['5min'] = setTimeout(() => {
        self.sessionTimeoutWarning.emit(5);
        // observer.next(5);
      }, resolveIn);
    }
    if (resolveIn + 120000 > 0) {
      self.sessionWarningRoutine['3min'] = setTimeout(() => {
        self.sessionTimeoutWarning.emit(3);
        // observer.next(3);
      }, resolveIn + 120000);
    }
    if (resolveIn + 240000 > 0) {
      self.sessionWarningRoutine['1min'] = setTimeout(() => {
        self.sessionTimeoutWarning.emit(1);
        // observer.next(1);
      }, resolveIn + 240000);
    }
    // });
  }

  connectSocket() {
    const self = this;
    if (!self.socket && self.app && self.app._id) {
      const socketConfig: Partial<ManagerOptions & SocketOptions> = {
        query: {
          app: self.app._id,
          userId: self.userDetails._id,
          portal: 'author',
        },
      };
      self.socket = connect(
        environment.production ? '/' : 'http://localhost',
        socketConfig
      );
      self.socket.on('connected', (data) => {
        self.socket.emit('authenticate', { token: self.userDetails.token });
      });
      self.socket.on('deleteService', (data) => {
        if (data.app === self.app._id) {
          self.entity.delete.emit(data);
        }
      });

      self.socket.on('serviceStatus', (data) => {
        if (data.app === self.app._id) {
          self.entity.status.emit(data);
        }
      });

      self.socket.on('newService', (data) => {
        if (data.app === self.app._id) {
          self.entity.new.emit(data);
        }
      });
      self.socket.on('flowDeleted', (data) => {
        if (data.app === self.app._id) {
          self.flow.delete.emit(data);
        }
      });
      self.socket.on('flowStatus', (data) => {
        if (data.app === self.app._id) {
          self.flow.status.emit(data);
        }
      });
      self.socket.on('flowCreated', (data) => {
        if (data.app === self.app._id) {
          self.flow.new.emit(data);
        }
      });
      self.socket.on('faasDeleted', (data) => {
        if (data.app === self.app._id) {
          self.faas.delete.emit(data);
        }
      });
      self.socket.on('faasStatus', (data) => {
        if (data.app === self.app._id) {
          self.faas.status.emit(data);
        }
      });
      self.socket.on('faasCreated', (data) => {
        if (data.app === self.app._id) {
          self.faas.new.emit(data);
        }
      });
      self.socket.on('bulk-upload', (data) => {
        if (data.app === self.app._id) {
          self.bulkUpload.status.emit(data);
        }
      });
    }
  }

  disconnectSocket() {
    const self = this;
    if (self.socket) {
      self.socket.close();
      self.socket = null;
    }
  }

  modal(template, options?: NgbModalOptions): NgbModalRef {
    const self = this;
    if (!options) {
      options = {
        centered: true,
        beforeDismiss: () => false,
      };
    } else {
      if (!options.beforeDismiss) {
        options.beforeDismiss = () => false;
      }
      if (!options.centered) {
        options.centered = true;
      }
    }
    return self.modalService.open(template, options);
  }

  errorToast(err, message?) {
    const self = this;
    if (err && err.error && err.error.message) {
      message = err.error.message;
    }
    if (!message) {
      message = 'Unable to process request, please try again later';
    }
    self.ts.error(message);
  }

  getEntityPermissions(entity: string): Array<Role> {
    const self = this;
    return self.permissions.filter(
      (e) => e.entity === entity && e.app === self.app._id
    );
  }

  hasPermission(id: string, entity?: string) {
    const self = this;
    if (!self.app) {
      self.setFirstApp();
    }
    // Check for Super Admin
    if (self.userDetails.isSuperAdmin) {
      return true;
    }
    // Check for App Admin
    if (!self.userDetails.isSuperAdmin && self.isAppAdmin) {
      return true;
    }
    // Check for normal user
    if (
      entity &&
      self.permissions.find(
        (e) => e.id === id && e.app === self.app._id && e.entity === entity
      )
    ) {
      return true;
    }
    if (
      !entity &&
      self.permissions.find((e) => e.id === id && e.app === self.app._id)
    ) {
      return true;
    }
    return false;
  }

  hasPermissionStartsWith(segment: string, entity?: string) {
    const self = this;
    if (!self.app) {
      self.setFirstApp();
    }
    // Check for Super Admin
    if (self.userDetails.isSuperAdmin) {
      return true;
    }
    // Check for App Admin
    if (!self.userDetails.isSuperAdmin && self.isAppAdmin) {
      return true;
    }
    // Check for normal user
    if (
      entity &&
      self.permissions.filter(
        (e) =>
          (e.id.substr(0, 3) === segment ||
            e.id.substr(0, 4) === segment ||
            e.id.substr(0, 5) === segment) &&
          e.app === self.app._id &&
          e.entity === entity
      ).length > 0
    ) {
      return true;
    }
    if (
      !entity &&
      self.permissions.filter(
        (e) =>
          (e.id.substr(0, 3) === segment ||
            e.id.substr(0, 4) === segment ||
            e.id.substr(0, 5) === segment) &&
          e.app === self.app._id
      ).length > 0
    ) {
      return true;
    }
    return false;
  }

  get isAppAdmin(): boolean {
    const self = this;
    if (self.userDetails && !self.userDetails.accessControl) {
      self.userDetails.accessControl = {};
    }
    if (!self.userDetails.accessControl.apps) {
      self.userDetails.accessControl.apps = [];
    }
    const index = self.userDetails.accessControl.apps.findIndex(
      (a) => a._id === self.app._id
    );
    if (index > -1) {
      return true;
    } else {
      return false;
    }
  }

  get landingAnimation() {
    const self = this;
    if (Object.values(self.apiCalls).length === 0) {
      return false;
    } else {
      return Boolean(Math.max.apply(null, Object.values(self.apiCalls)));
    }
  }

  isThisUser(user) {
    const self = this;
    if (!user) {
      return false;
    }
    if (self.userDetails && self.userDetails._id) {
      return user._id === self.userDetails._id;
    } else {
      self.userDetails = self.sessionService.getUser(true);
      return user._id === self.userDetails._id;
    }
  }

  azureLogin() {
    try {
      const self = this;
      const windowHeight = 500;
      const windowWidth = 620;
      const windowLeft =
        (window.outerWidth - windowWidth) / 2 + window.screenLeft;
      const windowTop =
        (window.outerHeight - windowHeight) / 2 + window.screenTop;
      const url = '/api/a/rbac/auth/azure/login';
      const windowOptions = [];
      windowOptions.push(`height=${windowHeight}`);
      windowOptions.push(`width=${windowWidth}`);
      windowOptions.push(`left=${windowLeft}`);
      windowOptions.push(`top=${windowTop}`);
      windowOptions.push(`toolbar=no`);
      windowOptions.push(`resizable=no`);
      windowOptions.push(`menubar=no`);
      windowOptions.push(`location=no`);
      const childWindow = document.open(
        url,
        '_blank',
        windowOptions.join(',')
      ) as any;
      return self.appService.listenForChildClosed(childWindow);
    } catch (e) {
      throw e;
    }
  }
  randomStr(len) {
    let str = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < len; i++) {
      str += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return str;
  }

  getService(serviceId: string): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.serviceMap && self.serviceMap[serviceId]) {
        resolve(self.serviceMap[serviceId]);
      } else {
        self
          .get(
            'serviceManager',
            `/${this.app._id}/service/` + serviceId + '?draft=true',
            { filter: { app: this.app._id } }
          )
          .subscribe(
            (res) => {
              self.serviceMap[serviceId] = res;
              resolve(self.serviceMap[serviceId]);
            },
            (err) => {
              reject(err);
            }
          );
      }
    });
  }

  getUser(userId: string): Promise<UserDetails> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.userMap && self.userMap[userId]) {
        resolve(self.userMap[userId]);
      } else {
        self.get('user', `/${this.app._id}/user/${userId}`).subscribe(
          (res) => {
            self.userMap[userId] = res;
            resolve(self.userMap[userId]);
          },
          (err) => {
            reject(err);
          }
        );
      }
    });
  }

  setBreadcrumbs(breadcrumbPaths) {
    this.breadcrumbPaths = breadcrumbPaths;
  }
  getBreadcrumbs() {
    return this.breadcrumbPaths;
  }

  appColor() {
    const colorArray = [
      '#B2DFDB',
      '#B2EBF2',
      '#B3E5FC',
      '#A5D6A7',
      '#C5E1A5',
      '#E6EE9C',
    ];
    return _.sample(colorArray);
  }
}

export interface GetOptions {
  page?: number;
  count?: number;
  select?: string;
  sort?: string;
  filter?: any;
  app?: string;
  noApp?: boolean;
  serviceIds?: string;
  fields?: string;
  apps?: string;
  skipAuth?: boolean;
}

export interface Permission {
  id?: string;
  name?: string;
  app?: string;
  entity?: string;
}

export interface Credentials {
  username?: string;
  password?: string;
}

export interface ConnectionDetails {
  url?: string;
  bindDN?: string;
  mapping?: string;
  baseDN?: string;
  baseFilter?: string;
  clientId?: string;
  clientSecret?: string;
  tenant?: string;
  accessToken?: string;
  redirectUri?: {
    login?: string;
    userFetch?: string;
  };
  adUsernameAttribute?: string;
}
