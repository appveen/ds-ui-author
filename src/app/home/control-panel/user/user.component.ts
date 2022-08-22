import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModalRef, NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { AgGridAngular } from 'ag-grid-angular';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  IDatasource,
  IGetRowsParams,
} from 'ag-grid-community';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { UserDetails } from 'src/app/utils/interfaces/userDetails';
import { AppService } from 'src/app/utils/services/app.service';
import {
  CommonService,
  GetOptions,
} from 'src/app/utils/services/common.service';
import { environment } from 'src/environments/environment';
import { SessionService } from '../../../utils/services/session.service';
import { UserGridActionRendererComponent } from './user-grid-action.component';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { UserToGroupModalComponent } from './user-to-group-modal/user-to-group-modal.component';
import { UserGridAppsRendererComponent } from './user-grid-apps.component ';
import { FilterPipe } from 'src/app/utils/pipes/filter.pipe';

@Component({
  selector: 'odp-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  providers: [FilterPipe],
})
export class UserComponent implements OnInit, OnDestroy {
  @ViewChild('agGrid') agGrid: AgGridAngular;
  @ViewChild('deleteModal', { static: false })
  deleteModal: TemplateRef<HTMLElement>;
  @ViewChild('searchUserInput', { static: false }) searchUserInput: ElementRef;
  @ViewChild('createEditTemplate', { static: false }) createEditTemplate;
  @ViewChild('newGroupModal') newGroupModal: TemplateRef<HTMLElement>;
  @ViewChild('removeSelectedModal', { static: false })
  removeSelectedModal: TemplateRef<HTMLElement>;
  deleteModalRef: NgbModalRef;
  searchForm: FormGroup;
  userForm: FormGroup;
  apiConfig: GetOptions = {};
  subscriptions: any = {};
  username: string;
  authType: string;
  errorMessage: string;
  isSuperAdmin: boolean;
  selectedApp: string;
  showLazyLoader: boolean;
  appList = [];
  showUsrManage: boolean;
  selectedUser: any;
  groupList: Array<any>;
  selectedGroups: Array<string>;
  breadcrumbPaths: Array<Breadcrumb>;
  bredcrumbSubject: Subject<string>;
  userInLocal: boolean;
  userInAzureAD: boolean;
  showPassword;
  frameworkComponents: any;
  gridAttrOptions: GridOptions;
  gridGroupOptions: GridOptions;
  dataSource: IDatasource;
  loadedCount: number;
  totalCount: number;
  removeSelectedModalRef: NgbModalRef;
  userToRemove: string;
  validAuthTypes: Array<any>;
  availableAuthTypes: Array<any>;
  showNewUserWindow: boolean;
  showAzureLoginButton: boolean;
  userList: Array<any> = [];
  checkedUsers: Array<any> = [];
  details: any = {};
  checked: boolean = false;
  isLoading: boolean = true;
  currentTab: string = 'Groups';
  gridApi: GridApi;
  showSettings: boolean = false;
  showResetPassword: boolean = false;
  showPasswordSide: boolean = false;
  resetPasswordForm: FormGroup;
  showAddAttribute: boolean = false;
  attributesForm: FormGroup;
  editMode: boolean = false;
  types: Array<any>;
  userGroups: Array<any> = [];
  private context;
  newGroupModalRef: NgbModalRef;
  searchTerm: string = '';
  search: boolean = false;
  ogUsersList: any;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private ngbToolTipConfig: NgbTooltipConfig,
    private ts: ToastrService,
    private appService: AppService,
    private sessionService: SessionService,
    private dialog: MatDialog,
    private userFilter: FilterPipe
  ) {
    this.context = { componentParent: this };
    this.showUsrManage = true;
    this.selectedApp = this.commonService.app._id;
    this.apiConfig.filter = {};
    this.groupList = [];
    this.selectedGroups = [];
    this.breadcrumbPaths = [];
    this.bredcrumbSubject = new Subject<string>();
    this.showPassword = {};
    this.types = [
      { class: 'dsi-text', value: 'String', label: 'Text' },
      { class: 'dsi-number', value: 'Number', label: 'Number' },
      { class: 'dsi-boolean', value: 'Boolean', label: 'True/False' },
      { class: 'dsi-date', value: 'Date', label: 'Date' },
    ];
    this.availableAuthTypes = [
      {
        label: 'Local',
        value: 'local',
      },
      {
        label: 'Azure',
        value: 'azure',
      },
      {
        label: 'LDAP',
        value: 'ldap',
      },
    ];

    this.resetPasswordForm = this.fb.group({
      password: [null],
      cpassword: [null, [Validators.required]],
    });

    this.frameworkComponents = {
      actionRenderer: UserGridActionRendererComponent,
      appCheckRenderer: UserGridAppsRendererComponent,
    };

    if (this.commonService.userDetails?.rbacPasswordComplexity) {
      this.resetPasswordForm
        .get('password')
        .setValidators([
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*?~]).+$/
          ),
        ]);
    } else {
      this.resetPasswordForm
        .get('password')
        .setValidators([Validators.required, Validators.minLength(8)]);
    }
    this.resetPasswordForm.get('password').updateValueAndValidity();
  }

  ngOnInit() {
    this.breadcrumbPaths.push({
      active: true,
      label: 'Users',
    });
    this.commonService.changeBreadcrumb(this.breadcrumbPaths)
    this.configureAuthTypes();
    // this.createUserForm();
    this.ngbToolTipConfig.container = 'body';
    this.username = this.commonService.userDetails.username;
    if (
      this.commonService.userDetails.basicDetails &&
      this.commonService.userDetails.basicDetails.name
    ) {
      this.username = this.commonService.userDetails.basicDetails.name;
    }
    this.showResetPassword =
      this.commonService.userDetails.isSuperAdmin ||
      this.isThisUser(this.selectedUser);
    this.isSuperAdmin = this.commonService.userDetails.isSuperAdmin;
    this.initConfig();
    this.commonService.apiCalls.componentLoading = false;
    this.searchForm = this.fb.group({
      searchTerm: ['', Validators.required],
    });

    if (this.hasPermission('PMUG')) {
      this.fetchGroups();
    }
    this.subscriptions['breadCrumbSubs'] = this.bredcrumbSubject.subscribe(
      (usrName) => {
        if (usrName) {
          this.updateBreadCrumb(usrName);
        }
      }
    );
    // this.setupGrid();
    if (
      this.appService.validAuthTypes &&
      this.appService.validAuthTypes.indexOf('azure') == -1
    ) {
      this.showAzureLoginButton = false;
    }
    this.showLazyLoader = true;

    this.fetchUsers()

  }


  fetchUsers() {
    this.getUserList().subscribe((users) => {
      this.userList = users;
      this.ogUsersList = users;
      this.selectedUser = users[0];
      this.showDetails(users[0]);
      this.showLazyLoader = false;
      this.isLoading = false;
    });
  }
  onAuthTypeChange(value) {
    this.showAzureLoginButton = false;
    if (this.userForm.get('password')) {
      this.userForm.get('password').patchValue(null);
    }
    if (this.userForm.get('cpassword')) {
      this.userForm.get('cpassword').patchValue(null);
    }
    if (this.userForm.get('basicDetails.name:')) {
      this.userForm.get('basicDetails.name:').patchValue(null);
    }
    if (this.userForm.get('basicDetails.phone')) {
      this.userForm.get('basicDetails.phone').patchValue(null);
    }
    if (this.userForm.get('basicDetails.alternateEmail')) {
      this.userForm.get('basicDetails.alternateEmail').patchValue(null);
    }
    if (this.userForm.get('basicDetails.description')) {
      this.userForm.get('basicDetails.description').patchValue(null);
    }
    this.selectedGroups = [];
    if (value === 'azure') {
      this.showLazyLoader = true;
      this.commonService
        .get('user', `/${this.commonService.app._id}/user/utils/azure/token`)
        .subscribe(
          (res) => {
            this.showLazyLoader = false;
            this.showAzureLoginButton = false;
            this.configureFormValidators();
          },
          (err) => {
            this.showLazyLoader = false;
            this.showAzureLoginButton = true;
          }
        );
    } else {
      this.configureFormValidators();
    }
  }

  ngOnDestroy() {
    Object.keys(this.subscriptions).forEach((e) => {
      this.subscriptions[e].unsubscribe();
    });
    if (this.deleteModalRef) {
      this.deleteModalRef.close();
    }
  }

  configureAuthTypes() {
    this.authType = this.commonService.userDetails.auth.authType;
    this.validAuthTypes = !!this.appService.validAuthTypes?.length
      ? this.availableAuthTypes.filter((at) =>
        this.appService.validAuthTypes.includes(at.value)
      )
      : [{ label: 'Local', value: 'local' }];
  }

  triggerAzureToken() {
    this.getNewAzureToken()
      .then(() => {
        this.commonService
          .get('user', `/${this.commonService.app._id}/user/utils/azure/token`)
          .subscribe(
            (res) => {
              this.showLazyLoader = false;
              this.showAzureLoginButton = false;
              this.configureFormValidators();
            },
            (err) => {
              this.showLazyLoader = false;
              this.showAzureLoginButton = true;
            }
          );
      })
      .catch((err) => {
        this.commonService.errorToast(
          err,
          'Error while trying to login to Azure AD'
        );
      });
  }

  getNewAzureToken() {
    try {
      const url = `${environment.url.user}/${this.commonService.app._id}/user/utils/azure/token/new`;
      const self = this;
      const windowHeight = 500;
      const windowWidth = 620;
      const windowLeft =
        (window.outerWidth - windowWidth) / 2 + window.screenLeft;
      const windowTop =
        (window.outerHeight - windowHeight) / 2 + window.screenTop;
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

  createUserForm() {
    this.userForm = this.fb.group({
      userData: this.fb.group({
        auth: this.fb.group({
          authType: [
            !!this.validAuthTypes?.length
              ? this.validAuthTypes[0].value
              : 'local',
            [Validators.required],
          ],
        }),
        username: [null],
        password: [null],
        cpassword: [null],
        isSuperAdmin: [false, [Validators.required]],
        attributes: [{}],
        basicDetails: this.fb.group({
          name: [null],
          phone: [null, []],
          alternateEmail: [
            null,
            [Validators.pattern(/[\w]+@[a-zA-Z0-9-]{2,}(\.[a-z]{2,})+/)],
          ],
          description: [null],
        }),
        accessControl: this.fb.group({
          accessLevel: ['Selected', [Validators.required]],
          apps: [[]],
        }),
        roles: [null],
      }),
    });
    this.userInLocal = false;
    this.userInAzureAD = false;
    this.userForm.get('userData.auth.authType').enable();
    this.userForm.get('userData.basicDetails.name').patchValue(null);
    if (this.hasPermission('PMUG')) {
      this.fetchGroups();
    }
    this.configureFormValidators();
  }

  configureFormValidators() {
    const value = this.userForm.get('userData.auth.authType').value;
    this.userForm.get('userData.username').clearValidators();
    this.userForm.get('userData.basicDetails.name').clearValidators();
    this.userForm.get('userData.password').clearValidators();
    this.userForm.get('userData.cpassword').clearValidators();
    if (value === 'local') {
      this.userForm
        .get('userData.username')
        .setValidators([
          Validators.required,
          Validators.pattern(/[\w]+@[a-zA-Z0-9-]{2,}(\.[a-z]{2,})+/),
        ]);
      this.userForm
        .get('userData.basicDetails.name')
        .setValidators([
          Validators.required,
          Validators.pattern('[a-zA-Z0-9\\s-_@#.]+'),
        ]);
      if (this.commonService.userDetails.rbacPasswordComplexity) {
        this.userForm
          .get('userData.password')
          .setValidators([
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*?~]).+$/
            ),
          ]);
      } else {
        this.userForm
          .get('userData.password')
          .setValidators([Validators.required, Validators.minLength(8)]);
      }
      this.userForm
        .get('userData.cpassword')
        .setValidators([Validators.required, Validators.minLength(8)]);
    } else {
      this.userForm
        .get('userData.username')
        .setValidators([Validators.required]);
      this.userForm
        .get('userData.basicDetails.name')
        .setValidators([Validators.pattern('[a-zA-Z0-9\\s-_@#.]+')]);
    }
    this.userForm.get('userData.username').updateValueAndValidity();
    this.userForm.get('userData.basicDetails.name').updateValueAndValidity();
    this.userForm.get('userData.password').updateValueAndValidity();
    this.userForm.get('userData.cpassword').updateValueAndValidity();
  }



  checkAllUser(val) {
    this.agGrid.api.forEachNode((row) => {
      this.agGrid.api.getRowNode(row.id).selectThisNode(val);
    });
  }

  initConfig() {
    this.appList = this.commonService.appList;
    this.apiConfig.count = 30;
    this.apiConfig.page = 1;
    this.apiConfig.noApp = true;
    this.apiConfig.filter = {
      bot: false,
    };
  }

  get isSelectAllDisabled(): boolean {
    return !this.totalCount;
  }

  get invalidName() {
    return (
      this.userForm.get('userData.basicDetails.name').dirty &&
      this.userForm.get('userData.basicDetails.name').hasError('required')
    );
  }

  get invalidAuthType() {
    return (
      this.userForm.get('userData.auth.authType').dirty &&
      this.userForm.get('userData.auth.authType').hasError('required')
    );
  }

  get invalidUsername() {
    return (
      this.userForm.get('userData.username').dirty &&
      this.userForm.get('userData.username').hasError('required')
    );
  }

  get invalidUsernamePattern() {
    return (
      this.userForm.get('userData.username').dirty &&
      this.userForm.get('userData.username').hasError('pattern')
    );
  }

  get invalidEmailPattern() {
    return (
      this.userForm.get('userData.basicDetails.alternateEmail').dirty &&
      this.userForm
        .get('userData.basicDetails.alternateEmail')
        .hasError('pattern')
    );
  }

  get invalidPassword() {
    return (
      this.userForm.get('userData.password').dirty &&
      this.userForm.get('userData.password').hasError('required')
    );
  }

  get invalidPasswordLength() {
    return (
      this.userForm.get('userData.password').dirty &&
      this.userForm.get('userData.password').hasError('minlength')
    );
  }

  get invalidPasswordPattern() {
    if (this.commonService.userDetails.rbacPasswordComplexity) {
      return (
        this.userForm.get('userData.password').dirty &&
        this.userForm.get('userData.password').hasError('pattern')
      );
    } else {
      return false;
    }
  }

  get invalidCPassword() {
    return (
      this.userForm.get('userData.cpassword').dirty &&
      this.userForm.get('userData.cpassword').hasError('required')
    );
  }
  get invalidPasswordMatch() {
    return (
      this.userForm.get('userData.cpassword').dirty &&
      this.userForm.get('userData.password').dirty &&
      this.userForm.get('userData.cpassword').value !==
      this.userForm.get('userData.password').value
    );
  }

  get isElevatedUser() {
    const self = this;
    const logedInUser = self.sessionService.getUser(true);
    if (self.details._id === logedInUser._id) {
      return false;
    } else {
      const isSuperAdmin = logedInUser.isSuperAdmin;
      let isAppAdmin = false;
      if (
        logedInUser.accessControl.apps &&
        logedInUser.accessControl.apps.length > 0
      ) {
        const i = logedInUser.accessControl.apps.findIndex(
          (_app) => _app._id === self.commonService.app._id
        );
        if (i !== -1) {
          isAppAdmin = true;
        }
      }
      return isSuperAdmin || isAppAdmin;
    }
  }

  newUser() {
    this.showSettings = false;
    this.showPassword = {};
    if (this.validAuthTypes?.length === 1) {
      this.userForm.get('userData.auth.authType').disable();
    }
    this.showNewUserWindow = true;
    this.createUserForm();
  }

  closeWindow(reset?: boolean) {
    if (reset) {
      this.userInLocal = false;
      this.userInAzureAD = false;
      this.userForm.reset();
      this.userForm.get('userData.auth.authType').enable();
      this.selectedGroups = [];
    }
    this.showNewUserWindow = false;
    this.showPasswordSide = false;
    this.showAddAttribute = false;
  }

  addUser() {
    this.userForm.get('userData.auth.authType').enable();
    this.userForm.get('userData.basicDetails.name').markAsDirty();
    this.userForm.get('userData.username').markAsDirty();
    this.userForm.get('userData.password').markAsDirty();
    this.userForm.get('userData.cpassword').markAsDirty();
    if (this.userForm.invalid) {
      return;
    } else if (
      this.userForm.get('userData.password').value !==
      this.userForm.get('userData.cpassword').value
    ) {
      this.ts.error('Passwords mismatch');
      return;
    } else {
      this.createAndAddToGroup();
    }
  }

  importUser() {
    this.userForm.get('userData.auth.authType').enable();
    const payload = {
      groups: this.selectedGroups,
    };
    const username = this.userForm.get('userData.username').value;
    this.showLazyLoader = true;
    this.commonService
      .put(
        'user',
        `/${this.commonService.app._id}/user/utils/import/${username}`,
        payload
      )
      .subscribe(
        (res) => {
          this.showLazyLoader = false;
          this.closeWindow(true);
          this.initConfig();
          this.agGrid.api?.purgeInfiniteCache();
          this.ts.success('User Imported successfully');
          this.userInLocal = false;
          this.userInAzureAD = false;
        },
        (err) => {
          this.showLazyLoader = false;
          this.commonService.errorToast(err);
          this.userInLocal = false;
          this.userInAzureAD = false;
        }
      );
  }

  importUserFromAzure() {
    this.userForm.get('userData.auth.authType').enable();
    const user = this.userForm.get('userData').value;
    const payload = {
      users: [user],
      groups: this.selectedGroups,
    };
    this.showLazyLoader = true;
    this.commonService
      .put(
        'user',
        `/${this.commonService.app._id}/user/utils/azure/import`,
        payload
      )
      .subscribe(
        (res) => {
          this.showLazyLoader = false;
          this.closeWindow(true);
          this.initConfig();
          this.agGrid.api?.purgeInfiniteCache();
          this.ts.success('User Imported successfully');
          this.userInLocal = false;
          this.userInAzureAD = false;
        },
        (err) => {
          this.showLazyLoader = false;
          this.commonService.errorToast(err);
          this.userInLocal = false;
          this.userInAzureAD = false;
        }
      );
  }

  createAndAddToGroup() {
    const userData = this.userForm.get('userData').value;
    const payload = {
      user: userData,
      groups: this.selectedGroups,
    };
    this.showLazyLoader = true;
    this.commonService
      .post('user', `/${this.commonService.app._id}/user`, payload)
      .subscribe(
        (res) => {
          this.showLazyLoader = false;
          this.closeWindow(true);
          this.initConfig();
          this.agGrid.api?.purgeInfiniteCache();
          this.ts.success('User created successfully');
        },
        (err) => {
          this.showLazyLoader = false;
          this.commonService.errorToast(err);
        }
      );
  }

  checkForDuplicate() {
    const enteredUN = this.userForm.get('userData.username').value;
    if (!enteredUN) {
      return;
    }
    if (this.userList.find(e => e._id === enteredUN)) {
      this.ts.warning('User already exist in this app.');
      this.userForm.get('userData.username').patchValue(null);
      return;
    }
    this.showLazyLoader = true;
    this.commonService.get('user', `/auth/authType/${enteredUN}`).subscribe(
      (res) => {
        this.showLazyLoader = false;
        this.userInLocal = true;
        this.userInAzureAD = false;
        this.userForm.get('userData.auth.authType').patchValue(res.authType);
        this.userForm.get('userData.auth.authType').disable();
        setTimeout(() => {
          this.userForm.get('userData.basicDetails.name').patchValue(res.name);
          this.userForm.get('userData.basicDetails.name').disable();
        }, 1000);
      },
      (err) => {
        this.showLazyLoader = false;
        this.userInLocal = false;
        this.userInAzureAD = false;
        this.userForm.get('userData.auth.authType').enable();
        this.userForm.get('userData.basicDetails.name').patchValue(null);
        this.userForm.get('userData.basicDetails.name').enable();
        this.userForm
          .get('userData.basicDetails.alternateEmail')
          .patchValue(null);
        if (
          this.selectedAuthType == 'azure' &&
          this.validAuthTypes.findIndex((e) => e.value === 'azure') > -1
        ) {
          this.checkForUserInAzure();
        }
      }
    );
  }

  checkForUserInAzure() {
    const enteredUN = this.userForm.get('userData.username').value;
    if (!enteredUN) {
      return;
    }
    this.showLazyLoader = true;
    this.commonService
      .put('user', `/${this.commonService.app._id}/user/utils/azure/search`, {
        users: [enteredUN],
      })
      .subscribe(
        (res) => {
          this.showLazyLoader = false;
          this.userInLocal = false;
          let userData;
          let statusCode;
          if (Array.isArray(res)) {
            userData = res[0].body;
            statusCode = res[0].statusCode;
          } else {
            userData = res.body;
            statusCode = res.statusCode;
          }
          if (statusCode != 200) {
            this.commonService.errorToast(null, 'User not found in Azure AD');
            this.userInAzureAD = false;
            return;
          }
          this.userInAzureAD = true;
          this.userForm.get('userData.auth.authType').patchValue('azure');
          this.userForm.get('userData.auth.authType').disable();
          this.userForm
            .get('userData.basicDetails.name')
            .patchValue(userData.name);
          this.userForm.get('userData.basicDetails.name').disable();
          if (userData.phone) {
            this.userForm
              .get('userData.basicDetails.phone')
              .patchValue(userData.phone);
          }
          if (userData.email) {
            this.userForm
              .get('userData.basicDetails.alternateEmail')
              .patchValue(userData.email);
          }
        },
        (err) => {
          this.showLazyLoader = false;
          this.userInLocal = false;
          this.userInAzureAD = false;
          this.userForm.get('userData.auth.authType').enable();
          this.userForm.get('userData.basicDetails.name').patchValue(null);
          this.userForm.get('userData.basicDetails.name').enable();
          this.userForm
            .get('userData.basicDetails.alternateEmail')
            .patchValue(null);
          // if(this.validAuthTypes.findIndex(e=>e.value === 'ldap') > -1){
          //     this.checkForUserInLDAP();
          // }
        }
      );
  }

  // checkForUserInLDAP(){

  // }

  fetchGroups() {
    this.subscriptions['fetchGroups'] = this.commonService
      .get('user', `/${this.commonService.app._id}/group`, {
        noApp: true,
        count: -1,
      })
      .subscribe(
        (groups) => {
          this.groupList = groups;
          const index = this.groupList.findIndex((e) => e.name === '#');
          if (index >= 0) {
            this.groupList.splice(index, 1);
          }
        },
        (err) => { }
      );
  }

  getUserCount() {
    const options = {
      filter: this.apiConfig.filter,
      noApp: true,
    };
    return this.commonService.get(
      'user',
      `/${this.commonService.app._id}/user/utils/count`,
      options
    );
  }

  getUserList() {
    return this.commonService.get(
      'user',
      `/${this.commonService.app._id}/user`,
      this.apiConfig
    );
  }

  hasPermission(type: string) {
    return this.commonService.hasPermission(type);
  }

  getLastActiveTime(time) {
    if (time) {
      const lastLoggedIn = new Date(time);
      return moment(lastLoggedIn).fromNow() === 'a day ago'
        ? '1 day ago'
        : moment(lastLoggedIn).fromNow();
    }
    return;
  }

  editUser(event: any, flag?: boolean) {
    if (
      !this.hasPermission('PVUB') &&
      !this.commonService.hasPermissionStartsWith('PMU')
    ) {
      return;
    }
    if (flag) {
      this.appService.editUser = true;
    }
    this.showUsrManage = true;
    this.selectedUser = event.data;
    this.updateBreadCrumb(this.selectedUser?.basicDetails?.name || '');
  }

  canEdit(user: UserDetails) {
    if (
      user._id === this.commonService.userDetails._id ||
      (user.isSuperAdmin && !this.commonService.userDetails.isSuperAdmin)
    ) {
      return false;
    }
    return true;
  }

  canDelete(user: UserDetails) {
    if (
      user._id === this.commonService.userDetails._id ||
      (user.isSuperAdmin && !this.commonService.userDetails.isSuperAdmin)
    ) {
      return false;
    }
    return true;
  }

  isThisUser(user) {
    if (user) {
      return user._id === this.commonService.userDetails?._id;
    }
    else {
      return
    }
  }

  updateBreadCrumb(usr) {
    if (this.breadcrumbPaths.length === 2) {
      this.breadcrumbPaths.pop();
    }
    this.breadcrumbPaths.push({
      active: true,
      label: usr,
    });
    this.commonService.changeBreadcrumb(this.breadcrumbPaths)
  }

  removeSelectedUsers(userIds?: Array<string>) {
    if (!userIds) {
      userIds = this.checkedUsers.map((e) => e._id);
    }
    if (!userIds || userIds.length === 0) {
      return;
    }
    this.isLoading = true
    this.subscriptions['removeUsers'] = this.commonService
      .put('user', `/${this.commonService.app._id}/user/utils/removeUsers`, {
        userIds,
      })
      .subscribe(
        () => {
          this.fetchUsers()
          // this.agGrid.api.deselectAll();
          // setTimeout(() => {
          //   this.agGrid.api.purgeInfiniteCache();
          // }, 500);
          this.ts.success(
            `Removed User(s) from ${this.selectedApp} App Successfully`
          );
        },
        (err) => {
          console.log(err);
          this.agGrid.api.deselectAll();
          setTimeout(() => {
            this.agGrid.api.purgeInfiniteCache();
          }, 500);
          this.commonService.errorToast(
            err,
            'unable to remove selected user(s), please try after sometime'
          );
        }
      );
  }

  removeUsers() {
    this.userToRemove = this.checkedUsers.map((e) => e._id).join(', ');
    this.removeSelectedModalRef = this.commonService.modal(
      this.removeSelectedModal
    );
    this.removeSelectedModalRef.result.then(
      (close) => {
        if (close) {
          this.removeSelectedUsers(this.checkedUsers.map((e) => e._id));
        } else {
          this.removeSelectedModalRef.close(true);
        }
        this.userToRemove = null;
      },
      (dismiss) => {
        this.userToRemove = null;
      }
    );
  }

  insufficientPermission() {
    this.ts.warning("You don't have enough permissions");
  }

  isAppAdmin(user: UserDetails) {
    return !!(
      user.accessControl.apps &&
      user.accessControl.apps.length > 0 &&
      user.accessControl.apps.find((e) => e._id === this.commonService.app._id)
    );
  }

  sortModelChange(model: any) {
    this.apiConfig.sort = this.appService.getSortQuery(model);
    this.agGrid.api.purgeInfiniteCache();
  }

  toggleGroup(flag: boolean, groupId: string) {
    const index = this.selectedGroups.findIndex((e) => e === groupId);
    if (flag && index == -1) {
      this.selectedGroups.push(groupId);
    }
    if (!flag && index > -1) {
      this.selectedGroups.splice(index, 1);
    }
  }

  isGroupSelected(groupId: string) {
    return this.selectedGroups.includes(groupId);
  }

  get disableImport() {
    const authType = this.userForm.get('userData.auth.authType').value;
    if (authType == 'azure' && !this.userInAzureAD && !this.userInLocal) {
      return true;
    }
    return false;
  }

  get selectedAuthType() {
    return this.userForm.get('userData.auth.authType').value;
  }

  get matchPwd() {
    const self = this;
    return (
      self.resetPasswordForm.get('password').value !==
      self.resetPasswordForm.get('cpassword').value
    );
  }

  get pwdError() {
    const self = this;
    return (
      (self.resetPasswordForm.get('password').dirty &&
        self.resetPasswordForm.get('password').hasError('required')) ||
      (self.resetPasswordForm.get('password').dirty &&
        self.resetPasswordForm.get('password').hasError('minlength')) ||
      (self.resetPasswordForm.get('password').dirty &&
        self.resetPasswordForm.get('password').hasError('pattern'))
    );
  }

  get cPwdError() {
    const self = this;
    return (
      (self.resetPasswordForm.get('cpassword').dirty &&
        self.resetPasswordForm.get('cpassword').hasError('required')) ||
      (self.resetPasswordForm.get('cpassword').dirty && self.matchPwd)
    );
  }

  formatLastLogin(timestamp, isDetails = false) {
    if (timestamp) {
      if (isDetails) {
        return moment(timestamp).format('hh:mm A , DD/MM/YYYY');
      } else {
        if (
          moment(timestamp).format('DD/MM/YYYY') ===
          moment(new Date()).format('DD/MM/YYYY')
        ) {
          return moment(timestamp).format('hh:mm A');
        } else {
          return moment(timestamp).format('DD/MM/YYYY');
        }
      }
    }
  }

  showDetails(user) {
    this.showSettings = false;
    if (user.attributes && user.attributes !== null) {
      user.attributesData = Object.values(user.attributes).map((ele: Object, i) => {
        const key = Object.keys(user.attributes)[i];
        return { ...ele, key }
      });
    }
    if (this.details._id !== user._id) {
      this.details = user;
      this.fetchUserGroups();
    } else {
      this.details = user;
    }

    // this.gridApi.refreshCells();
  }
  clickCheckbox(event, user) {
    if (event.target.checked) {
      this.checkedUsers.push(user);
    } else {
      this.checkedUsers = this.checkedUsers.filter(
        (ele) => ele._id !== user._id
      );
    }
  }

  switchTab(tab) {
    this.currentTab = tab;
  }

  togglePasswordChange() {
    this.showPasswordSide = true;
  }

  resetPassword() {
    const self = this;
    self.resetPasswordForm.get('password').markAsDirty();
    self.resetPasswordForm.get('cpassword').markAsDirty();
    if (self.resetPasswordForm.invalid) {
      return;
    } else {
      if (self.subscriptions['resetPwd']) {
        self.subscriptions['resetPwd'].unsubscribe();
      }
      self.subscriptions['resetPwd'] = self.commonService
        .put(
          'user',
          `/${this.commonService.app._id}/user/utils/reset/${self.details._id}`,
          self.resetPasswordForm.value
        )
        .subscribe(
          (res) => {
            if (
              res &&
              self.details._id === self.commonService.userDetails._id
            ) {
              self.ts.success(
                'Redirecting to login screen, Please login again'
              );
              setTimeout(() => {
                self.commonService.logout();
              }, 3000);
            } else if (res) {
              self.ts.success('Password changed successfully');
            }
          },
          (err) => {
            self.commonService.errorToast(
              err,
              'Unable to change password, please try again later'
            );
          }
        );
      self.resetPasswordForm.reset();
      // self.resetPwd = false;
    }
  }

  showAttributeSide(data?: any) {
    this.attributesForm = this.fb.group({
      key: [''],
      type: ['String', [Validators.required]],
      value: ['', [Validators.required]],
      label: ['', [Validators.required]],
    });
    this.attributesForm.get('key').disable();
    if (!this.editMode) {
      this.attributesForm
        .get('label')
        .valueChanges
        .subscribe((val: any) => {
          this.attributesForm
            .get('key')
            .patchValue(this.appService.toCamelCase(val));
        });
    }
    this.attributesForm.reset({ type: 'String' });
    if (this.editMode && data) {
      this.attributesForm.setValue(data)
    }
    this.showAddAttribute = true;
  }

  onAttributeFormTypeChange(type: any) {
    this.attributesForm.get('type').setValue(type);
    this.attributesForm
      .get('value')
      .setValue(type === 'Boolean' ? false : null);
  }

  addAttribute() {
    const { key, ...rest } = this.attributesForm.getRawValue();
    let obj = {};
    obj[key] = rest;

    this.details.attributes = {
      ... this.details.attributes, ...obj
    };
    this.commonService
      .put(
        'user',
        `/${this.commonService.app._id}/user/${this.details._id}`,
        this.details
      )
      .subscribe(
        (res) => {

          this.details['attributes'] = res.attributes;
          this.showDetails(this.details);
          this.editMode = false;
          this.showAddAttribute = false;
          this.ts.success('Custom Details Saved Successfully');
        },
        (err) => {
          this.ts.error(err.error.message);
        }
      );
  }

  setUserAttributeValue(val) {
    this.attributesForm.get('value').patchValue(val);
  }
  fetchUserGroups() {
    const self = this;
    this.showLazyLoader = true;
    const filter = {
      count: -1,
      filter: { users: self.details._id },
    };
    this.userGroups = []
    self.subscriptions['userTeams'] = self.commonService
      .get('user', `/${self.commonService.app._id}/group/`, filter)
      .subscribe((resp) => {
        resp.forEach(item => {
          const authorPermissions = item.roles.filter(e => e.id.match(/^[A-Z]{2,}$/));
          item.hasAuthorRoles = authorPermissions.length > 0;
          item.hasAppcenterRoles = authorPermissions.length != item.roles.length;

          this.userGroups.push(item);
          const index = this.userGroups.findIndex(e => e.name === '#');
          if (index >= 0) {
            this.userGroups.splice(index, 1);
          }
        })
        this.showLazyLoader = false;
      });
  }



  editAttribute(data) {
    this.editMode = true;
    this.showAttributeSide(data);
  }

  deleteAttribute(data) {
    const key = data['key'];
    delete this.details.attributes[key];
    this.showLazyLoader = true;
    this.commonService
      .put(
        'user',
        `/${this.commonService.app._id}/user/${this.details._id}`,
        this.details
      )
      .subscribe(
        (res) => {

          this.details.attributes = res.attributes || {};
          this.showDetails(this.details)


          this.showAddAttribute = false;
          this.showLazyLoader = false;
          this.ts.success('Custom Details Saved Successfully');
        },
        (err) => {
          this.ts.error(err.error.message);
        }
      );
  }

  deleteGroup(data) {
    this.commonService
      .put(
        'user',
        `/${this.commonService.app._id}/user/utils/removeFromGroups/${this.details._id}`,
        { groups: [data._id], app: this.commonService.app._id }
      )
      .subscribe(
        () => {
          this.ts.success(
            `${data.name} Group has been removed for user ${this.details.basicDetails.name}`
          );
          this.fetchUserGroups();
        },
        (err) => {
          data.loading = false;
          this.commonService.errorToast(err);
        }
      );
  }

  openGroupModal() {
    const dialogRef = this.dialog.open(UserToGroupModalComponent, {
      width: '60vw',
      minHeight: '65vh',
      data: {
        groupList: this.groupList,
        userGroups: this.userGroups,
        user: this.details,
      },
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.fetchUserGroups();
      }
    });
  }

  enterToSelect(event) {

    if (event === 'reset') {
      this.searchTerm = '';
      this.userList = this.ogUsersList;
      this.details = {};
      this.showDetails(this.ogUsersList[0]);
    } else {
      const self = this;
      self.searchTerm = event
      if (self.searchTerm) {
        const returnedUsers = self.userFilter.transform(
          self.ogUsersList,
          self.searchTerm
        );
        self.userList = returnedUsers;
        if (returnedUsers.length > 0) {
          self.showDetails(returnedUsers[0]);
        } else {
          self.details = {};
        }
      }
    }
  }

  isAttrPresent(data) {
    if (!data.attributes || _.isEmpty(data.attributes)) {
      return false
    }
    return true
  }

}
