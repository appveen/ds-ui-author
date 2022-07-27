import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  Renderer2,
  ViewChild,
  QueryList,
  ViewChildren,
  ChangeDetectorRef,
  TemplateRef,
} from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbTooltipConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { noop } from 'rxjs';
import * as _ from 'lodash';

import {
  CommonService,
  GetOptions,
} from 'src/app/utils/services/common.service';
import { DeleteModalConfig } from 'src/app/utils/interfaces/schemaBuilder';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-bots-manage',
  templateUrl: './bots-manage.component.html',
  styleUrls: ['./bots-manage.component.scss'],
  animations: [
    trigger('moveDown', [
      state(
        'void',
        style({
          transformOrigin: 'right top',
          transform: 'scale(0)',
        })
      ),
      transition('void => *', [
        animate(
          '250ms ease-in',
          style({
            transform: 'scale(1)',
          })
        ),
      ]),
      transition('* => void', [
        style({ transformOrigin: 'right top' }),
        animate(
          '250ms ease-out',
          style({
            transform: 'scale(0)',
          })
        ),
      ]),
    ]),
    trigger('zoomIn', [
      state(
        'void',
        style({
          transform: 'translate(-50%, -50%) scale(0) ',
        })
      ),
      transition('void => *', [
        animate(
          '600ms cubic-bezier(0.86, 0, 0.07, 1)',
          style({
            transform: 'translate(-50%, -50%) scale(1) ',
          })
        ),
      ]),
      transition('* => void', [
        animate(
          '600ms cubic-bezier(0.86, 0, 0.07, 1)',
          style({
            transform: 'translate(-50%, -50%) scale(0.1) ',
          })
        ),
      ]),
    ]),
  ],
})
export class BotsManageComponent implements OnInit, OnDestroy {
  private _user: any;
  @ViewChild('assignTeamModal', { static: false }) assignTeamModal;
  @ViewChild('deleteModalTemplate', { static: false }) deleteModalTemplate;
  @ViewChildren('newLabel') newLabel: QueryList<any>;
  @ViewChild('newAttributeModal', { static: false })
  newAttributeModal: TemplateRef<HTMLElement>;
  @ViewChild('editAttributeModal', { static: false })
  editAttributeModal: TemplateRef<HTMLElement>;

  // tslint:disable-next-line: no-output-rename
  @Output() removeBot: EventEmitter<any>;
  editAttributeModalRef: NgbModalRef;
  userDetails: FormGroup;
  additionalDetails: FormGroup;
  resetPasswordForm: FormGroup;
  subscriptions: any;
  deleteModal: DeleteModalConfig;
  userGroupConfig: GetOptions = {};
  userAppConfig: GetOptions = {};
  teamOptions: GetOptions = {};
  updateTeamOption: GetOptions = {};
  additionalInfo: any; // Variable object to store user's additional info and display on UI
  userTeams: Array<any>;
  allTeams: Array<any>;
  selectedGroups: Array<any>;
  additionInfo_helper_txt = 'Show More';
  showMoreInfo: boolean;
  editDetails: boolean;
  resetPwd: boolean;
  addInfo: boolean;
  filterTeamStr = '';
  madeAppAdmin: boolean;
  showMoreOptions: boolean;
  deleteModalTemplateRef: NgbModalRef;
  assignTeamModalRef: NgbModalRef;
  newAttributeModalRef: NgbModalRef;
  toggleFieldTypeSelector: any;
  types: Array<any>;
  editAttribute: any;
  openDeleteModal: EventEmitter<any>;
  userAttributeList: Array<any>;
  private _toggleUserMng: boolean;
  @Output() toggleBotMngChange: EventEmitter<boolean>;

  get toggleUserMng(): boolean {
    const self = this;
    return self._toggleUserMng;
  }

  @Input() set toggleBotMng(value: boolean) {
    const self = this;
    self._toggleUserMng = value;
  }

  @Input() set user(value: any) {
    const self = this;
    if (!value.attributes) {
      value.attributes = {};
    }
    self._user = value;
    const arr = [];
    if (self.user && self.user.attributes) {
      Object.keys(self.user.attributes).forEach((key) => {
        if (
          self.user.attributes[key] &&
          typeof self.user.attributes[key] === 'object'
        ) {
          arr.push({
            key,
            label: self.user.attributes[key].label,
            value: self.user.attributes[key].value,
            type: self.user.attributes[key].type,
          });
        } else if (
          self.user.attributes[key] &&
          typeof self.user.attributes[key] === 'string'
        ) {
          arr.push({
            key,
            label: key,
            value: self.user.attributes[key],
            type: 'String',
          });
        }
      });
    }
    self.userAttributeList = arr;
    self.getAppNTeam();
  }

  get user() {
    const self = this;
    return self._user;
  }

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private ts: ToastrService,
    private ngbToolTipConfig: NgbTooltipConfig,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private appService: AppService
  ) {
    const self = this;
    self.subscriptions = {};
    self.showMoreInfo = false;
    self.toggleBotMngChange = new EventEmitter<boolean>();
    self.removeBot = new EventEmitter<any>();
    self.editDetails = false;
    self.resetPwd = false;
    self.addInfo = false;
    self.madeAppAdmin = false;
    // userDetails form is for updating basic user info
    self.userDetails = self.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z0-9\\s-_@#.]+'),
        ],
      ],
      email: ['', [Validators.pattern(/[\w]+@[a-zA-Z0-9-]{2,}(\.[a-z]{2,})+/)]],
      phone: ['', [Validators.pattern(/^[-+]?\d*$/)]],
      username: ['', [Validators.required]],
    });
    // additionalDetails form is for adding extra key-value pair info for an user specific to an app
    self.additionalDetails = self.fb.group({
      extraInfo: self.fb.array([]),
    });
    // resetPasswordForm form is for updating user password
    self.resetPasswordForm = self.fb.group({
      password: [null],
      cpassword: [null, [Validators.required]],
    });
    self.userGroupConfig.filter = {};
    self.teamOptions.filter = {};
    self.teamOptions.noApp = true;
    self.updateTeamOption.filter = {};

    // deleteModal initialization
    self.deleteModal = {
      title: 'Delete record(s)',
      message: 'Are you sure you want to delete self recordOa(s)?',
      falseButton: 'No',
      trueButton: 'Yes',
      showButtons: true,
    };
    self.showMoreOptions = false;
    self.toggleFieldTypeSelector = {};
    self.types = [
      { class: 'odp-abc', value: 'String', label: 'Text' },
      { class: 'odp-123', value: 'Number', label: 'Number' },
      { class: 'odp-boolean', value: 'Boolean', label: 'True/False' },
      { class: 'odp-calendar', value: 'Date', label: 'Date' },
    ];
    self.openDeleteModal = new EventEmitter();
  }

  ngOnInit() {
    const self = this;
    self.ngbToolTipConfig.container = 'body';
    self.commonService.apiCalls.componentLoading = false;
    self.getAppNTeam();
    self.subscriptions['sessionExpired'] =
      self.commonService.sessionExpired.subscribe(() => {
        self.userDetails.markAsPristine();
        self.resetPasswordForm.markAsPristine();
      });
    self.renderer.listen('body', 'keyup', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        self.onCancel();
      }
    });
  }

  get additionalInfoArr() {
    const self = this;
    return (self.additionalDetails.get('extraInfo') as FormArray).controls;
  }
  get userAttributes() {
    const self = this;
    return (self.additionalDetails.get('extraInfo') as FormArray).controls;
  }
  getLabelError(i) {
    const self = this;
    return (
      self.additionalDetails.get(['extraInfo', i, 'label']).touched &&
      self.additionalDetails.get(['extraInfo', i, 'label']).hasError('required')
    );
  }

  setKey(i) {
    const self = this;
    const val = self.additionalDetails.get(['extraInfo', i, 'label']).value;
    self.additionalDetails
      .get(['extraInfo', i, 'key'])
      .patchValue(self.appService.toCamelCase(val));
  }
  getKeyError(i) {
    const self = this;
    return (
      self.additionalDetails.get(['extraInfo', i, 'key']).touched &&
      self.additionalDetails.get(['extraInfo', i, 'key']).hasError('required')
    );
  }

  getValError(i) {
    const self = this;
    return (
      self.additionalDetails.get(['extraInfo', i, 'value']).touched &&
      self.additionalDetails.get(['extraInfo', i, 'value']).hasError('required')
    );
  }

  get extraInfo() {
    const self = this;
    return self.user.attributes
      ? Object.keys(self.user.attributes).length > 0
      : false;
  }

  get extraInfoLen() {
    const self = this;
    return self.user.attributes ? Object.keys(self.user.attributes).length : 0;
  }

  get matchPwd() {
    const self = this;
    return (
      self.resetPasswordForm.get('password').value !==
      self.resetPasswordForm.get('cpassword').value
    );
  }

  get initials() {
    const self = this;
    const name = self.user.basicDetails.name.split(' ');
    return name[0].charAt(0) + name[name.length - 1].charAt(0);
  }

  get nameError() {
    const self = this;
    return (
      self.userDetails.get('name').touched &&
      self.userDetails.get('name').dirty &&
      self.userDetails.get('name').hasError('required')
    );
  }

  get emailError() {
    const self = this;
    return (
      self.userDetails.get('email').dirty &&
      self.userDetails.get('email').hasError('pattern')
    );
  }

  get phoneError() {
    const self = this;
    return (
      self.userDetails.get('phone').dirty &&
      self.userDetails.get('phone').hasError('pattern')
    );
  }

  get pwdError() {
    const self = this;
    return (
      (self.resetPasswordForm.get('password').dirty &&
        self.resetPasswordForm.get('password').hasError('required')) ||
      (self.resetPasswordForm.get('password').dirty &&
        self.resetPasswordForm.get('password').hasError('minlength'))
    );
  }

  get cPwdError() {
    const self = this;
    return (
      self.resetPasswordForm.get('cpassword').dirty &&
      self.resetPasswordForm.get('cpassword').hasError('required')
    );
  }
  // returns if a user is also an AppAdmin
  get isAppAdmin() {
    const self = this;
    if (
      self.user.accessControl.apps &&
      self.user.accessControl.apps.length > 0
    ) {
      return (
        !!self.user.accessControl.apps.find(
          (app) => app._id === self.commonService.app._id
        ) || self.madeAppAdmin
      );
    }
    return false;
  }

  // To Add additional information for user
  addNewDetail() {
    const self = this;
    const newData = self.fb.group({
      key: ['', [Validators.required]],
      type: ['String', [Validators.required]],
      value: ['', [Validators.required]],
      label: ['', [Validators.required]],
    });
    (self.additionalDetails.get('extraInfo') as FormArray).push(newData);
    setTimeout(() => {
      if (self.newLabel.length >= 1) {
        self.newLabel.last.nativeElement.focus();
      }
    }, 50);
  }

  editUserDetails() {
    const self = this;
    if (self.manageUser) {
      self.editDetails = !self.editDetails;
      self.userDetails.patchValue({ name: self.user.basicDetails.name });
      self.userDetails.patchValue({ email: self.user.basicDetails.email });
      self.userDetails.patchValue({ phone: self.user.basicDetails.phone });
      self.userDetails.patchValue({ username: self.user.username });
      self.userDetails.get('email').enable();
      self.userDetails.get('username').disable();
    } else {
      self.inSufficientPermission();
    }
  }

  updateDetails() {
    const self = this;
    if (self.userDetails.invalid) {
      return;
    } else {
      self.user.basicDetails.name = self.userDetails.get('name').value;
      self.user.basicDetails.phone = self.userDetails.get('phone').value;
      self.user.basicDetails.email = self.userDetails.get('email').value;
      self.user.username = self.userDetails.get('username').value;
      if (self.subscriptions['userDtl']) {
        self.subscriptions['userDtl'].unsubscribe();
      }
      self.subscriptions['userDtl'] = self.commonService
        .put(
          'user',
          `/${this.commonService.app._id}/bot/${self.user._id}`,
          self.user
        )
        .subscribe(
          (res) => {
            self.editDetails = false;
            self.ts.success('User details updated successfully');
          },
          (e) => {
            self.editUserDetails();
            self.ts.error(e.error.message);
          }
        );
      self.userDetails.reset();
    }
  }

  resetPassword() {
    const self = this;
    if (self.resetPasswordForm.invalid) {
      const invalidCtrnls = [];
      const pwdControls = self.resetPasswordForm.controls;

      for (const cntrl in pwdControls) {
        if (pwdControls[cntrl].invalid) {
          invalidCtrnls.push(cntrl);
        }
      }

      let invalidItems = `<div>Please fill in the following fields:</div><ul>`;
      invalidCtrnls.forEach((e) => {
        let fieldName = '';
        switch (e) {
          case 'cpassword':
            fieldName = 'Client Secret';
            break;
          default:
            fieldName = e;
        }
        invalidItems = invalidItems.concat(`<li>${fieldName}</li>`);
      });
      invalidItems = invalidItems.concat(`</ul>`);
      self.ts.warning(invalidItems);
      return;
    } else {
      if (self.subscriptions['resetPwd']) {
        self.subscriptions['resetPwd'].unsubscribe();
      }

      self.resetPasswordForm
        .get('password')
        .patchValue(self.resetPasswordForm.get('cpassword').value);
      self.subscriptions['resetPwd'] = self.commonService
        .put(
          'user',
          `/${this.commonService.app._id}/user/utils/reset/${self.user._id}`,
          self.resetPasswordForm.value
        )
        .subscribe(
          (res) => {
            self.ts.success('Password changed successfully');
          },
          (err) => {
            self.commonService.errorToast(
              err,
              'Unable to change password, please try again later'
            );
          }
        );
      self.resetPasswordForm.reset();
      self.resetPwd = false;
    }
  }

  hideToggleManage() {
    const self = this;
    self._toggleUserMng = false;
    self.toggleBotMngChange.emit(false);
  }

  private resetAdditionDetailForm() {
    const self = this;
    self.additionalDetails.reset();
    self.additionalDetails = self.fb.group({
      extraInfo: self.fb.array([]),
    });
    // (self.additionalDetails.get('extraInfo') as FormArray).clear();
  }

  /** This method is used for displaying the modal window which
   * contains the form for adding extra Info for an User
   * @author bijay_ps
   */
  addAdditionInfo() {
    const self = this;
    if (self.userAttributeList.length) {
      self.userAttributeList.forEach((element) => {
        let form = self.fb.group({
          key: ['', Validators.required],
          type: ['String', Validators.required],
          value: ['', Validators.required],
          label: ['', Validators.required],
        });
        form.patchValue(element);
        (self.additionalDetails.get('extraInfo') as FormArray).push(form);
      });
    } else {
      const form = self.fb.group({
        key: ['', [Validators.required]],
        type: ['String', [Validators.required]],
        value: ['', [Validators.required]],
        label: ['', [Validators.required]],
      });
      (self.additionalDetails.get('extraInfo') as FormArray).push(form);
    }
    if (self.manageUser) {
      self.newAttributeModalRef = self.commonService.modal(
        self.newAttributeModal,
        { size: 'lg' }
      );
      self.newAttributeModalRef.result.then(
        (close) => {
          self.resetAdditionDetailForm();
        },
        (dismiss) => {
          self.resetAdditionDetailForm();
        }
      );
    } else {
      self.inSufficientPermission();
    }
  }

  /** This method is used for removing formControls from additionalDetails form
   * @author bijay_ps
   */
  removeField(index) {
    const self = this;
    (self.additionalDetails.get('extraInfo') as FormArray).removeAt(index);
    setTimeout(() => {
      if (self.newLabel.length >= 1) {
        self.newLabel.last.nativeElement.focus();
      }
    }, 50);
  }

  makeAppAdmin() {
    const self = this;
    if (self.manageUser) {
      const payload = { apps: [] };
      payload.apps.push(self.commonService.app._id);

      self.subscriptions['makeAdmin'] = self.commonService
        .put(
          'user',
          `/${self.commonService.app._id}/user/utils/appAdmin/${self.user._id}/grant`,
          payload
        )
        .subscribe(
          () => {
            self.madeAppAdmin = true;
            self.user.accessControl.accessLevel = 'Selected';
            if (self.user.accessControl.apps) {
              self.user.accessControl.apps.push({
                _id: self.commonService.app._id,
                type: 'Management',
              });
            } else {
              self.user.accessControl.apps = [];
              self.user.accessControl.apps.push({
                _id: self.commonService.app._id,
                type: 'Management',
              });
            }
            self.ts.success(
              `User ${self.user.basicDetails.name} has been successfully granted App Admin privileges`
            );
          },
          (err) => {
            self.ts.error(err.error.message);
          }
        );
    } else {
      self.inSufficientPermission();
    }
  }

  removeAdminAccess() {
    const self = this;
    if (self.manageUser) {
      self.deleteModal.title = `Remove User ${self.user.basicDetails.name}'s Admin access`;
      self.deleteModal.message = `Are you sure you want to remove user ${self.user.basicDetails.name}'s Admin
                                    access for App ${self.commonService.app._id}?`;
      self.deleteModal.showButtons = true;
      self.deleteModalTemplateRef = self.commonService.modal(
        self.deleteModalTemplate
      );
      self.deleteModalTemplateRef.result.then(
        (close) => {
          if (close) {
            // let usrPlaceHolder = self.user;
            const payload = { apps: [] };
            payload.apps.push(self.commonService.app._id);
            self.subscriptions['removeAdminAccess'] = self.commonService
              .put(
                'user',
                `/${self.commonService.app._id}/user/utils/appAdmin/${self.user._id}/revoke`,
                payload
              )
              .subscribe(
                () => {
                  self.madeAppAdmin = false;
                  self.user.accessControl.accessLevel = 'Selected';
                  const index = self.user.accessControl.apps.findIndex(
                    (e) => e._id === self.commonService.app._id
                  );
                  self.user.accessControl.apps.splice(index, 1);
                  self.ts
                    .success(`User ${self.user.basicDetails.name}'s has been successfully
                            revoked as App Admin for App ${self.commonService.app._id}`);
                },
                (err) => {
                  self.ts.error(err.error.message);
                }
              );
          }
        },
        (dismiss) => {}
      );
    } else {
      self.inSufficientPermission();
    }
  }

  newField(event) {
    const self = this;
    if (event.key === 'Enter') {
      self.addNewDetail();
    }
  }

  addExtraDetails() {
    const self = this;
    let empty = false;
    self.userAttributes.forEach((control) => {
      const label = control.get('label').value;
      const val = control.get('value').value;
      if (!label || !val) {
        empty = true;
      }
    });
    if (empty) {
      self.ts.warning(
        'Please check the form fields, looks like few fields are empty'
      );
    } else {
      self.newAttributeModalRef.close();
      self.user.attributes = {};
      self.userAttributes.forEach((data) => {
        const payload = data.value;
        const detailKey = payload.key;
        delete payload.key;
        self.user.attributes[detailKey] = payload;
      });
      self.commonService
        .put(
          'user',
          `/${this.commonService.app._id}/bot/${self.user._id}`,
          self.user
        )
        .subscribe(
          (res) => {
            self.user = res;
            self.ts.success('Custom details updated successfully');
            self.resetAdditionDetailForm();
          },
          (err) => {
            self.ts.error(err.error.message);
            self.resetAdditionDetailForm();
          },
          noop
        );
    }
  }

  onCancel() {
    const self = this;
    if (self.editDetails) {
      self.editDetails = false;
      self.userDetails.reset();
    }
    if (self.resetPwd) {
      self.resetPwd = false;
      self.resetPasswordForm.reset();
    }
    if (self.addInfo) {
      self.addInfo = false;
      (self.additionalDetails.get('extraInfo') as FormArray).controls.splice(1);
      self.additionalDetails.reset();
    }
  }

  teamSearch(event) {
    const self = this;
    self.filterTeamStr = event;
  }

  resetTeams() {
    const self = this;
    self.filterTeamStr = '';
  }

  userInfo() {
    const self = this;
    self.showMoreInfo = !self.showMoreInfo;
    if (self.showMoreInfo) {
      self.additionInfo_helper_txt = 'Hide';
    } else {
      self.additionInfo_helper_txt = 'Show More';
    }
  }

  getAllTeams() {
    const self = this;
    self.teamOptions.filter = { users: { $ne: self.user._id } };
    self.teamOptions.filter.app = self.commonService.app._id;
    self.teamOptions.count = -1;
    self.subscriptions['allTeams'] = self.commonService
      .get('user', `/${self.commonService.app._id}/group/`, self.teamOptions)
      .subscribe(
        (teams) => {
          self.allTeams = teams;
          const index = self.allTeams.findIndex((e) => e.name === '#');
          if (index >= 0) {
            self.allTeams.splice(index, 1);
          }
          self.allTeams.forEach((team) => {
            team.teamSelected = false;
          });
        },
        (err) => {
          self.ts.error(err.error.message);
        }
      );
  }

  getUserTeam() {
    const self = this;
    if (self.manageGroup || self.viewGroup) {
      self.userGroupConfig.filter.users = self.user._id;
      self.userGroupConfig.count = -1;
      self.subscriptions['userTeams'] = self.commonService
        .get(
          'user',
          `/${self.commonService.app._id}/group/`,
          self.userGroupConfig
        )
        .subscribe((teams) => {
          self.userTeams = teams;
          const index = self.userTeams.findIndex((e) => e.name === '#');
          if (index >= 0) {
            self.userTeams.splice(index, 1);
          }
          self.cdr.detectChanges();
        });
    }
  }

  assignTeam() {
    const self = this;
    self.getAllTeams();
    self.assignTeamModalRef = self.commonService.modal(self.assignTeamModal, {
      windowClass: 'assignApp-modal',
      centered: true,
    });
    self.assignTeamModalRef.result.then(
      (close) => {
        if (close && self.selectedGroups.length > 0) {
          const teamIds = [];
          self.selectedGroups.forEach((team) => {
            delete team.teamSelected;
            team.users.push(self.user._id);
            teamIds.push(team._id);
          });
          self.commonService
            .put(
              'user',
              `/${this.commonService.app._id}/user/utils/addToGroups/${self.user._id}`,
              { groups: teamIds }
            )
            .subscribe(() => {
              self.getUserTeam();
              self.ts.success('User has been added to group successfully');
            });
        }
      },
      (dismiss) => {}
    );
  }

  addTeam(tIndex) {
    const self = this;
    self.allTeams[tIndex].teamSelected = !self.allTeams[tIndex].teamSelected;
    self.selectedGroups = [];
    self.allTeams.forEach((team) => {
      if (team.teamSelected) {
        self.selectedGroups.push(team);
      }
    });
  }

  initConfig() {
    const self = this;
    self.userGroupConfig.filter.users = self.user._id;
    if (self.user.attributes && Object.keys(self.user.attributes).length > 0) {
      self.additionalInfo = self.user.attributes;
      for (const key in self.additionalInfo) {
        if (self.additionalInfo[key] === null) {
          delete self.additionalInfo[key];
        }
      }
    }
  }

  getAppNTeam() {
    const self = this;
    self.initConfig();
    /*if (self.user.attributes && Object.keys(self.user.attributes).length > 0) {
            self.additionalInfo = self.user.attributes;
        }*/
    self.getUserTeam();
  }

  /** removeFromApp method is used to Remove the user from current
   * App by virtue of Team/Group For removing, we emit a event
   * which is captured in parent component and this component gets
   * closed. And rest of the logic is handled in parent component
   * @author bijay_ps
   */
  removeFromApp() {
    const self = this;
    if (self.manageUser) {
      self.deleteModal.title = `Remove User ${self.user.basicDetails.name}`;
      self.deleteModal.message = `Are you sure you want to remove user ${self.user.basicDetails.name} from
                                    App ${self.commonService.app._id}?`;
      self.deleteModal.showButtons = true;
      self.deleteModalTemplateRef = self.commonService.modal(
        self.deleteModalTemplate
      );
      self.deleteModalTemplateRef.result.then(
        (close) => {
          if (close) {
            self._toggleUserMng = false;
            self.toggleBotMngChange.emit(false);
            self.removeBot.emit([self.user._id]);
          }
        },
        (dismiss) => {}
      );
    } else {
      self.inSufficientPermission();
    }
  }

  inSufficientPermission() {
    const self = this;
    self.ts.warning("You don't have enough permissions");
  }

  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach((e) => {
      self.subscriptions[e].unsubscribe();
    });
    if (self.deleteModalTemplateRef) {
      self.deleteModalTemplateRef.close();
    }
    if (self.assignTeamModalRef) {
      self.assignTeamModalRef.close();
    }
  }

  isThisUser(user: any) {
    const self = this;
    return self.commonService.isThisUser(user);
  }
  closeAllSessions(user: any) {
    const self = this;
    self.commonService
      .closeAllSessions(user._id)
      .then((res) => {
        self.ts.success('User session closed');
      })
      .catch((err) => {
        self.commonService.errorToast(err);
      });
  }

  closeAllOtherToggleField(i) {
    const self = this;
    Object.keys(self.toggleFieldTypeSelector).forEach((element) => {
      if (element != i) {
        self.toggleFieldTypeSelector[element] = false;
      }
    });
  }
  setUserAttributeType(type: any, index: number) {
    const self = this;
    self.toggleFieldTypeSelector[index] = false;
    self.additionalDetails
      .get(['extraInfo', index, 'type'])
      .patchValue(type.value);
    if (type.value === 'Boolean') {
      self.additionalDetails
        .get(['extraInfo', index, 'value'])
        .patchValue(false);
    } else {
      self.additionalDetails
        .get(['extraInfo', index, 'value'])
        .patchValue(null);
    }
  }
  getUserAttributeValue(index: number) {
    const self = this;
    return self.additionalDetails.get(['extraInfo', index, 'value']).value;
  }
  setUserAttributeValue(val: boolean, index: number) {
    const self = this;
    self.additionalDetails.get(['extraInfo', index, 'value']).patchValue(val);
  }
  openEditAttributeModal(item) {
    const self = this;
    self.editAttribute = self.appService.cloneObject(item);
    delete self.user.attributes[item.key];
    self.editAttributeModalRef = self.commonService.modal(
      self.editAttributeModal
    );
    self.editAttributeModalRef.result.then(
      (close) => {
        if (close) {
          const key = self.editAttribute.key;
          delete self.editAttribute.key;
          self.user.attributes[key] = self.appService.cloneObject(
            self.editAttribute
          );
          self.commonService
            .put(
              'user',
              `/${this.commonService.app._id}/user/${self.user._id}`,
              self.user
            )
            .subscribe(
              (res) => {
                self.user = res;
                self.ts.success('Custom Details Saved Successfully');
                self.resetAdditionDetailForm();
              },
              (err) => {
                self.ts.error(err.error.message);
                self.resetAdditionDetailForm();
              },
              noop
            );
        } else {
          const key = item.key;
          delete item.key;
          self.user.attributes[key] = item;
        }
        self.editAttribute = {};
      },
      (dismiss) => {
        self.editAttribute = {};
      }
    );
  }

  deleteAdditionInfo(attrName) {
    const self = this;
    const alertModal: any = {};
    alertModal.title = 'Delete Attribute';
    alertModal.message =
      'Are you sure you want to delete <span class="text-delete font-weight-bold">' +
      attrName +
      '</span> Attribute?';
    alertModal.attrName = attrName;
    self.openDeleteModal.emit(alertModal);
  }
  closeDeleteModal(data) {
    const self = this;
    if (data) {
      if (typeof data.attrName !== 'undefined') {
        delete self.user.attributes[data.attrName];
        self.commonService
          .put(
            'user',
            `/${this.commonService.app._id}/user/${this.user._id}`,
            self.user
          )
          .subscribe(
            (res) => {
              self.user = res;
              self.initConfig();
              self.ts.success('Attribute deleted successfully');
              self.resetAdditionDetailForm();
            },
            (err) => {
              self.ts.error(err.error.message);
              self.resetAdditionDetailForm();
            },
            noop
          );
      }
    }
  }
  get manageUser() {
    const self = this;
    return self.commonService.hasPermission('PMU');
  }

  get manageGroup() {
    const self = this;
    return self.commonService.hasPermission('PMG');
  }

  get viewGroup() {
    const self = this;
    return self.commonService.hasPermission('PVG');
  }

  get authType(): string {
    const self = this;
    if (
      self.commonService.userDetails.auth &&
      self.commonService.userDetails.auth.authType
    ) {
      return self.commonService.userDetails.auth.authType;
    } else {
      return 'local';
    }
  }
}
