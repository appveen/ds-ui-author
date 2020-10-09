import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    Output,
    EventEmitter,
    Renderer2,
    ViewChild,
    QueryList, ViewChildren, ChangeDetectorRef, TemplateRef
} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbTooltipConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { noop } from 'rxjs';
import * as _ from 'lodash';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { App } from 'src/app/utils/interfaces/app';
import { DeleteModalConfig } from 'src/app/utils/interfaces/schemaBuilder';
import { AppService } from 'src/app/utils/services/app.service';
import { SessionService } from 'src/app/utils/services/session.service';

@Component({
    selector: 'odp-user-manage',
    templateUrl: './user-manage.component.html',
    styleUrls: ['./user-manage.component.scss'],
    animations: [
        trigger('moveDown', [
            state('void', style({
                transformOrigin: 'right top',
                transform: 'scale(0)'
            })),
            transition('void => *', [
                animate('250ms ease-in', style({
                    transform: 'scale(1)'
                }))
            ]),
            transition('* => void', [
                style({ transformOrigin: 'right top' }),
                animate('250ms ease-out', style({
                    transform: 'scale(0)'
                }))
            ])
        ]),
        trigger('zoomIn', [
            state('void', style({
                transform: 'translate(-50%, -50%) scale(0) '
            })),
            transition('void => *', [
                animate('600ms cubic-bezier(0.86, 0, 0.07, 1)', style({
                    transform: 'translate(-50%, -50%) scale(1) '
                }))
            ]),
            transition('* => void', [
                animate('600ms cubic-bezier(0.86, 0, 0.07, 1)', style({
                    transform: 'translate(-50%, -50%) scale(0.1) '
                }))
            ])
        ]),
    ]
})

export class UserManageComponent implements OnInit, OnDestroy {
    private _user: any;
    @ViewChild('newAttributeModal', { static: false }) newAttributeModal: TemplateRef<HTMLElement>;
    @ViewChild('assignTeamModal', { static: false }) assignTeamModal: TemplateRef<HTMLElement>;
    @ViewChild('editAttributeModal', { static: false }) editAttributeModal: TemplateRef<HTMLElement>;
    @ViewChildren('newLabel') newLabel: QueryList<any>;
    @Output() removeUser: EventEmitter<any>;
    @Input() bredcrumbSub: any;
    newAttributeModalRef: NgbModalRef;
    assignTeamModalRef: NgbModalRef;
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
    userAppList: Array<App>;
    additionInfoHelperText = 'Show More';
    showMoreInfo: boolean;
    editDetails: boolean;
    resetPwd: boolean;
    filterTeamStr = '';
    madeAppAdmin: boolean;
    showMoreOptions: boolean;
    toggleFieldTypeSelector: any;
    types: Array<any>;
    editAttribute: any;
    openDeleteModal: EventEmitter<any>;
    private _toggleUserMng: boolean;
    showPassword:boolean;
    @Output() toggleUserMngChange: EventEmitter<boolean>;

    get toggleUserMng(): boolean {
        const self = this;
        return self._toggleUserMng;
    }

    @Input() set toggleUserMng(value: boolean) {
        const self = this;
        self._toggleUserMng = value;
    }

    @Input() set user(value: any) {
        const self = this;
        if (!value.attributes) {
            value.attributes = {};
        }
        self._user = value;
        self.getAppNTeam();
    }

    get user() {
        const self = this;
        return self._user;
    }

    constructor(private fb: FormBuilder,
        private commonService: CommonService,
        private appService: AppService,
        private ts: ToastrService,
        private ngbToolTipConfig: NgbTooltipConfig,
        private renderer: Renderer2,
        private cdr: ChangeDetectorRef,
        private sessionService: SessionService) {
        const self = this;
        self.subscriptions = {};
        self.showMoreInfo = false;
        self.toggleUserMngChange = new EventEmitter<boolean>();
        self.removeUser = new EventEmitter<any>();
        self.editDetails = false;
        self.resetPwd = false;
        self.madeAppAdmin = false;
        self.toggleFieldTypeSelector = {};
        // userDetails form is for updating basic user info
        self.userDetails = self.fb.group({
            name: ['', [Validators.required]],
            phone: ['', [Validators.pattern(/^[0-9]{8,16}$/)]],
            username: ['', [Validators.required, Validators.pattern(/([\w]+@[a-zA-Z0-9-]{2,}(\.[a-z]{2,})+|admin)/)]],
            alternateEmail: ['', [Validators.pattern(/([\w]+@[a-zA-Z0-9-]{2,}(\.[a-z]{2,})+|admin)/)]]
        });
        // additionalDetails form is for adding extra key-value pair info for an user specific to an app
        self.additionalDetails = self.fb.group({
            extraInfo: self.fb.array([
                self.fb.group({
                    key: ['', Validators.required],
                    type: ['String', Validators.required],
                    value: ['', Validators.required],
                    label: ['', Validators.required]
                })
            ])
        });
        // resetPasswordForm form is for updating user password
        self.resetPasswordForm = self.fb.group({
            password: [null, [Validators.required, Validators.minLength(8)]],
            cpassword: [null, [Validators.required]],
        });
        self.userAppList = [];
        self.userGroupConfig.filter = {};
        self.teamOptions.filter = {};
        self.teamOptions.noApp = true;
        self.updateTeamOption.filter = {};
        self.openDeleteModal = new EventEmitter();
        // deleteModal initialization
        self.deleteModal = {
            title: 'Delete record(s)',
            message: 'Are you sure you want to delete self recordOa(s)?',
            falseButton: 'No',
            trueButton: 'Yes',
            showButtons: true
        };
        self.showMoreOptions = false;
        self.toggleFieldTypeSelector = {};
        self.types = [
            { class: 'odp-abc', value: 'String', label: 'Text' },
            { class: 'odp-123', value: 'Number', label: 'Number' },
            { class: 'odp-boolean', value: 'Boolean', label: 'True/False' },
            { class: 'odp-calendar', value: 'Date', label: 'Date' }
        ];
    }

    ngOnInit() {
        const self = this;
        self.ngbToolTipConfig.container = 'body';
        self.commonService.apiCalls.componentLoading = false;
        self.getAppNTeam();
        self.subscriptions['sessionExpired'] = self.commonService.sessionExpired.subscribe(() => {
            self.userDetails.markAsPristine();
            self.resetPasswordForm.markAsPristine();
        });
        self.renderer.listen('body', 'keyup', (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                self.onCancel();
            }
        });
    }

    get userAttributes() {
        const self = this;
        return (self.additionalDetails.get('extraInfo') as FormArray).controls;
    }

    getLabelError(i) {
        const self = this;
        return self.additionalDetails.get(['extraInfo', i, 'label']).touched
            && self.additionalDetails.get(['extraInfo', i, 'label']).dirty
            && self.additionalDetails.get(['extraInfo', i, 'label']).hasError('required');
    }

    getValError(i) {
        const self = this;
        return self.additionalDetails.get(['extraInfo', i, 'value']).touched &&
            self.additionalDetails.get(['extraInfo', i, 'value']).dirty &&
            self.additionalDetails.get(['extraInfo', i, 'value']).hasError('required');
    }

    setKey(i) {
        const self = this;
        const val = self.additionalDetails.get(['extraInfo', i, 'label']).value;
        self.additionalDetails.get(['extraInfo', i, 'key']).patchValue(self.appService.toCamelCase(val));
    }

    get extraInfo() {
        const self = this;
        return self.user.attributes ? Object.keys(self.user.attributes).length > 0 : false;
    }

    get extraInfoLen() {
        const self = this;
        return self.user.attributes ? Object.keys(self.user.attributes).length : 0;
    }

    get matchPwd() {
        const self = this;
        return self.resetPasswordForm.get('password').value !== self.resetPasswordForm.get('cpassword').value;
    }

    get initials() {
        const self = this;
        const name = self.user.basicDetails.name.split(' ');
        return name[0].charAt(0) + name[name.length - 1].charAt(0);
    }

    get nameError() {
        const self = this;
        return self.userDetails.get('name').touched &&
            self.userDetails.get('name').dirty &&
            self.userDetails.get('name').hasError('required');
    }

    get phoneError() {
        const self = this;
        return self.userDetails.get('phone').dirty && self.userDetails.get('phone').hasError('pattern');
    }

    get usernameError() {
        const self = this;
        return (self.userDetails.get('username').dirty && self.userDetails.get('username').hasError('pattern')) ||
            (self.userDetails.get('username') && self.userDetails.get('username').hasError('required'));
    }

    get pwdError() {
        const self = this;
        return (self.resetPasswordForm.get('password').dirty &&
            self.resetPasswordForm.get('password').hasError('required')) ||
            (self.resetPasswordForm.get('password').dirty &&
                self.resetPasswordForm.get('password').hasError('minlength'));
    }

    get cPwdError() {
        const self = this;
        return (self.resetPasswordForm.get('cpassword').dirty &&
            self.resetPasswordForm.get('cpassword').hasError('required')) ||
            (self.resetPasswordForm.get('cpassword').dirty && self.matchPwd);
    }
    // returns if a user is also an AppAdmin
    get isAppAdmin() {
        const self = this;
        if (self.user.accessControl.apps && self.user.accessControl.apps.length > 0) {
            return (!!self.user.accessControl.apps.find(_app => _app._id === self.commonService.app._id) ||
                self.madeAppAdmin);
        }
        return false;
    }

    get isElevatedUser() {
        const self = this;
        const logedInUser = self.sessionService.getUser(true);
        if (self.user.basicDetails.name === logedInUser.basicDetails.name) {
            return false;
        } else {
            const isSuperAdmin = logedInUser.isSuperAdmin;
            let isAppAdmin = false;
            if (logedInUser.accessControl.apps && logedInUser.accessControl.apps.length > 0) {
                const i = logedInUser.accessControl.apps.findIndex(_app => _app._id === self.commonService.app._id);
                if (i !== -1) {
                    isAppAdmin = true;
                }
            }
            return isSuperAdmin || isAppAdmin;
        }
    }

    // To add new additional information for user
    addNewDetail() {
        const self = this;
        const newData = self.fb.group({
            key: ['', [Validators.required]],
            type: ['String', [Validators.required]],
            value: ['', [Validators.required]],
            label: ['', [Validators.required]]
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
        if (self.hasPermission('PMUBU')) {
            self.editDetails = !self.editDetails;
            self.userDetails.patchValue({ name: self.user.basicDetails.name });
            self.userDetails.patchValue({ phone: self.user.basicDetails.phone });
            self.userDetails.patchValue({ username: self.user.username });
            self.userDetails.patchValue({ alternateEmail: self.user.basicDetails.alternateEmail });
            if (self.authType !== 'local') {
                self.userDetails.get('username').disable();
                self.userDetails.get('phone').disable();
            } else {
                self.userDetails.get('username').enable();
                self.userDetails.get('phone').enable();
            }
        } else {
            self.inSufficientPermission();
        }
    }

    updateDetails() {
        const self = this;
        self.userDetails.get('name').markAsDirty();
        self.userDetails.get('phone').markAsDirty();
        self.userDetails.get('username').markAsDirty();
        if (self.userDetails.invalid) {
            return;
        } else {
            self.user.basicDetails.name = self.userDetails.get('name').value;
            self.user.basicDetails.phone = self.userDetails.get('phone').value;
            self.user.username = self.userDetails.get('username').value;
            if (self.userDetails.get('alternateEmail').value === '') {
                self.user.basicDetails.alternateEmail = null;
            } else {
                self.user.basicDetails.alternateEmail = self.userDetails.get('alternateEmail').value;
            }
            if (self.subscriptions['userDtl']) {
                self.subscriptions['userDtl'].unsubscribe();
            }
            self.subscriptions['userDtl'] = self.commonService.put('user', '/usr/' + self.user._id, self.user)
                .subscribe(res => {
                    self.editDetails = false;
                    if (res.basicDetails.name) {
                        self.bredcrumbSub.next(res.basicDetails.name);
                    }
                    self.userDetails.reset();
                    self.ts.success('User details updated successfully');
                }, (e) => {
                    self.editUserDetails();
                    self.ts.error(e.error.message);
                });
        }
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
                .put('user', '/usr/' + self.user._id + '/reset', self.resetPasswordForm.value)
                .subscribe(res => {
                    if (res && self.user._id === self.commonService.userDetails._id) {
                        self.ts.success('Redirecting to login screen, Please login again');
                        setTimeout(() => {
                            self.commonService.logout();
                        }, 3000);
                    } else if (res) {
                        self.ts.success('Password changed successfully');
                    }
                }, err => { self.commonService.errorToast(err, 'Unable to change password, please try again later'); });
            self.resetPasswordForm.reset();
            self.resetPwd = false;
        }
    }

    hideToggleManage() {
        const self = this;
        self._toggleUserMng = false;
        self.toggleUserMngChange.emit(false);
    }

    deleteAdditionInfo(attrName) {
        const self = this;
        const alertModal: any = {};
        alertModal.title = 'Delete Attribute';
        alertModal.message = 'Are you sure you want to delete <span class="text-delete font-weight-bold">'
            + attrName + '</span> Attribute?';
        alertModal.attrName = attrName;
        self.openDeleteModal.emit(alertModal);
    }

    removeAdminAccess() {
        const self = this;
        if (self.hasPermission('PMUG')) {
            const alertModal: any = {};
            alertModal.title = `Remove User ${self.user.basicDetails.name}'s Admin access`;
            alertModal.message = `Are you sure you want to remove user <span class="text-delete font-weight-bold">
            ${self.user.basicDetails.name}</span>'s Admin access for App ${self.commonService.app._id}?`;
            alertModal.removeAdmin = true;
            alertModal.btnText = 'Remove';
            self.openDeleteModal.emit(alertModal);
        } else {
            self.inSufficientPermission();
        }
    }

    /** removeFromApp method is used to Remove the user from current
     * App by virtue of Team/Group For removing, we emit a event
     * which is captured in parent component and this component gets
     * closed. And rest of the logic is handled in parent component
     * @author bijay_ps
     */
    removeFromApp() {
        const self = this;
        if (self.hasPermission('PMUBD')) {
            const alertModal: any = {};
            alertModal.title = `Remove User ${self.user.basicDetails.name}`;
            alertModal.message = `Are you sure you want to remove user <span class="text-delete font-weight-bold">
            ${self.user.basicDetails.name}</span> from App ${self.commonService.app._id}?`;
            alertModal.removeFromApp = true;
            alertModal.btnText = 'Remove';
            self.openDeleteModal.emit(alertModal);
        } else {
            self.inSufficientPermission();
        }
    }

    removeGroupForUser(teamName, teamId) {
        const self = this;
        if (self.manageGroup) {
            const alertModal: any = {};
            alertModal.title = `Remove Group ${teamName}`;
            alertModal.message = `Are you sure you want to remove group <span class="text-delete font-weight-bold">
            ${teamName}</span> for user <span class="text-delete font-weight-bold">${self.user.basicDetails.name}</span>?`;
            alertModal.removeGroupForUser = true;
            alertModal.teamName = teamName;
            alertModal.teamId = teamId;
            alertModal.btnText = 'Remove';
            self.openDeleteModal.emit(alertModal);
        } else {
            self.inSufficientPermission();
        }
    }

    closeDeleteModal(data) {
        const self = this;
        if (data) {
            if (typeof data.attrName !== 'undefined') {
                delete self.user.attributes[data.attrName];
                self.commonService.put('user', '/usr/' + self.user._id, self.user)
                    .subscribe(() => {
                        self.initConfig();
                        self.ts.success('Attribute deleted successfully');
                        self.resetAdditionDetailForm();
                    }, (err) => {
                        self.ts.error(err.error.message);
                        self.resetAdditionDetailForm();
                    }, noop);
            }
            if (data.removeAdmin) {
                const payload = { apps: [] };
                payload.apps.push(self.commonService.app._id);
                self.subscriptions['removeAdminAccess'] =
                    self.commonService.put('user', `/usr/${self.user._id}/appAdmin/revoke`, payload)
                        .subscribe(() => {
                            self.madeAppAdmin = false;
                            self.user.accessControl.accessLevel = 'Selected';
                            const index = self.user.accessControl.apps.findIndex(e => e._id === self.commonService.app._id);
                            self.user.accessControl.apps.splice(index, 1);
                            self.ts.success(`User ${self.user.basicDetails.name}'s has been successfully
                            revoked as App Admin for App ${self.commonService.app._id}`);
                        }, (err) => {
                            self.ts.error(err.error.message);
                        });
            }
            if (data.removeFromApp) {
                self._toggleUserMng = false;
                self.toggleUserMngChange.emit(false);
                self.removeUser.emit([self.user._id]);
            }
            if (data.removeGroupForUser) {
                const teamIds = [data.teamId];
                self.commonService.put('user', `/usr/${self.user._id}/removeFromGroups`, { groups: teamIds })
                    .subscribe(() => {
                        self.getUserTeam();
                        self.ts.success(`${data.teamName} Group has been removed for user ${self.user.basicDetails.name}`);
                    });
            }
        }
    }

    private resetAdditionDetailForm() {
        const self = this;
        self.additionalDetails.reset();
        self.additionalDetails = self.fb.group({
            extraInfo: self.fb.array([
                self.fb.group({
                    key: ['', Validators.required],
                    type: ['String', Validators.required],
                    value: ['', Validators.required],
                    label: ['', Validators.required]
                })
            ])
        });
        // (self.additionalDetails.get('extraInfo') as FormArray).clear();
    }

    /** This method is used for displaying the modal window which
     * contains the form for adding extra Info for an User
     * @author bijay_ps
     */
    addAdditionInfo() {
        const self = this;
        if (self.hasPermission('PMUBU')) {
            self.newAttributeModalRef = self.commonService.modal(self.newAttributeModal, { size: 'lg' });
            self.newAttributeModalRef.result.then(close => {
                self.resetAdditionDetailForm();
            }, dismiss => {
                self.resetAdditionDetailForm();
            });
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
        if (self.hasPermission('PMUG')) {
            const payload = { 'apps': [] };
            payload.apps.push(self.commonService.app._id);
            self.subscriptions['makeAdmin'] = self.commonService.put('user', `/usr/${self.user._id}/appAdmin/grant`, payload)
                .subscribe(() => {
                    self.madeAppAdmin = true;
                    self.user.accessControl.accessLevel = 'Selected';
                    if (self.user.accessControl.apps) {
                        self.user.accessControl.apps.push({ _id: self.commonService.app._id, type: 'Management' });
                    } else {
                        self.user.accessControl.apps = [];
                        self.user.accessControl.apps.push({ _id: self.commonService.app._id, type: 'Management' });
                    }
                    self.ts.success(`User ${self.user.basicDetails.name} has been successfully granted App Admin privileges`);
                }, (err) => {
                    self.ts.error(err.error.message);
                });
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
            if (label === '' || val === '') {
                empty = true;
            }
        });
        if (empty) {
            self.ts.warning('Please check the form fields, looks like few fields are empty');
        } else {
            self.newAttributeModalRef.close();
            self.userAttributes.forEach((data) => {
                const payload = data.value;
                const detailKey = payload.key;
                delete payload.key;
                self.user.attributes[detailKey] = payload;
            });
            self.commonService.put('user', `/usr/${self.user._id}`, self.user)
                .subscribe(() => {
                    self.initConfig();
                    self.ts.success('Added custom Details successfully');
                    self.resetAdditionDetailForm();
                }, (err) => {
                    self.ts.error(err.error.message);
                    self.resetAdditionDetailForm();
                }, noop);
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
            self.additionInfoHelperText = 'Hide';
        } else {
            self.additionInfoHelperText = 'Show More';
        }
    }

    getAllTeams() {
        const self = this;
        self.teamOptions.filter = { 'users': { '$ne': self.user._id } };
        self.teamOptions.filter.app = self.commonService.app._id;
        self.teamOptions.count = -1;
        self.subscriptions['allTeams'] = self.commonService.get('user', `/${self.commonService.app._id}/group/`, self.teamOptions)
            .subscribe((_teams) => {
                self.allTeams = _teams;
                const index = self.allTeams.findIndex(e => e.name === '#');
                if (index >= 0) {
                    self.allTeams.splice(index, 1);
                }
                self.allTeams.forEach((_team) => {
                    _team.teamSelected = false;
                });
            }, (err) => {
                self.ts.error(err.error.message);
            });
    }

    getUserTeam() {
        const self = this;
        if (self.manageGroup || self.viewGroup) {
            self.userGroupConfig.filter.users = self.user._id;
            self.userGroupConfig.count = -1;
            self.subscriptions['userTeams'] = self.commonService.get('user', `/${self.commonService.app._id}/group/`, self.userGroupConfig)
                .subscribe((_teams) => {
                    self.userTeams = _teams;
                    const index = self.userTeams.findIndex(e => e.name === '#');
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
        self.assignTeamModalRef = self.commonService.modal(self.assignTeamModal, { windowClass: 'assignApp-modal', centered: true });
        self.assignTeamModalRef.result.then((close) => {
            if (close && self.selectedGroups && self.selectedGroups.length > 0) {
                const teamIds = [];
                self.selectedGroups.forEach((team) => {
                    delete team.teamSelected;
                    team.users.push(self.user._id);
                    teamIds.push(team._id);
                });
                self.commonService.put('user', `/usr/${self.user._id}/addToGroups`, { groups: teamIds })
                    .subscribe(() => {
                        self.getUserTeam();
                        // self.getAllTeams();
                        self.ts.success('User has been added to group successfully');
                    }, err => {
                        self.commonService.errorToast(err);
                    });
            }
        }, dismiss => { });
    }

    addTeam(tIndex) {
        const self = this;
        self.allTeams[tIndex].teamSelected = !self.allTeams[tIndex].teamSelected;
        self.selectedGroups = [];
        self.allTeams.forEach((_team) => {
            if (_team.teamSelected) {
                self.selectedGroups.push(_team);
            }
        });
    }

    getUserApps() {
        const self = this;
        self.subscriptions['userApps'] = self.commonService.get('user', '/usr/' + self.user._id + '/appList', self.userAppConfig)
            .subscribe((_apps) => {
                self.userAppList = [];
                _apps.apps.forEach(app => {
                    const temp = {
                        _id: app
                    };
                    self.userAppList.push(temp);
                });
                self.userAppList.forEach(app => {
                    self.getAppLogo(app);
                });
            });
    }

    getAppLogo(app: App) {
        const self = this;
        const option: GetOptions = { select: 'logo.thumbnail', noApp: true };
        self.subscriptions['getAppLogo_' + app._id] = self.commonService.get('user', '/app/' + app._id, option)
            .subscribe((res) => {
                app.logo = res.logo;
            }, err => {
                if (err.status === 404) {
                    const index = self.userAppList.findIndex(e => e._id === app._id);
                    self.userAppList.splice(index, 1);
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
        self.getUserTeam();
        self.getUserApps();
    }

    inSufficientPermission() {
        const self = this;
        self.ts.warning('You don\'t have enough permissions');
    }

    ngOnDestroy() {
        const self = this;
        Object.keys(self.subscriptions).forEach(e => {
            self.subscriptions[e].unsubscribe();
        });
        // if (self.deleteModalTemplateRef) {
        //     self.deleteModalTemplateRef.close();
        // }
        if (self.assignTeamModalRef) {
            self.assignTeamModalRef.close();
        }
        if (self.newAttributeModalRef) {
            self.newAttributeModalRef.close();
        }
        if (self.editAttributeModalRef) {
            self.editAttributeModalRef.close();
        }
    }

    isThisUser(user: any) {
        const self = this;
        return self.commonService.isThisUser(user);
    }

    closeAllSessions(user: any) {
        const self = this;
        self.commonService.closeAllSessions(user._id).then(res => {
            self.ts.success('User session closed');
        }).catch(err => {
            self.commonService.errorToast(err);
        });
    }

    hasPermission(type: string): boolean {
        const self = this;
        return self.commonService.hasPermission(type);
    }

    setUserAttributeType(type: any, index: number) {
        const self = this;
        self.toggleFieldTypeSelector[index] = false;
        self.additionalDetails.get(['extraInfo', index, 'type']).patchValue(type.value);
        if (type.value === 'Boolean') {
            self.additionalDetails.get(['extraInfo', index, 'value']).patchValue(false);
        } else {
            self.additionalDetails.get(['extraInfo', index, 'value']).patchValue(null);
        }
    }

    closeAllOtherToggleField(i) {
        const self = this;
        Object.keys(self.toggleFieldTypeSelector).forEach(element => {
            if (element != i) {
                self.toggleFieldTypeSelector[element] = false;
            }
        });
    }

    getUserAttributeType(val: any) {
        const self = this;
        if (val !== null) {
            return self.appService.toCapitalize(typeof val);
        }
        return 'String';
    }

    setUserAttributeValue(val: boolean, index: number) {
        const self = this;
        self.additionalDetails.get(['extraInfo', index, 'value']).patchValue(val);
    }
    getUserAttributeValue(index: number) {
        const self = this;
        return self.additionalDetails.get(['extraInfo', index, 'value']).value;
    }

    openEditAttributeModal(item) {
        const self = this;
        self.editAttribute = self.appService.cloneObject(item);
        delete self.user.attributes[item.key];
        self.editAttributeModalRef = self.commonService.modal(self.editAttributeModal);
        self.editAttributeModalRef.result.then(close => {
            if (close) {
                const key = self.editAttribute.key;
                delete self.editAttribute.key;
                self.user.attributes[key] = self.appService.cloneObject(self.editAttribute);
                self.commonService.put('user', `/usr/${self.user._id}`, self.user)
                    .subscribe(() => {
                        self.initConfig();
                        self.ts.success('Custom Details Saved Successfully');
                        self.resetAdditionDetailForm();
                    }, (err) => {
                        self.ts.error(err.error.message);
                        self.resetAdditionDetailForm();
                    }, noop);
            } else {
                const key = item.key;
                delete item.key;
                self.user.attributes[key] = item;
            }
            self.editAttribute = {};
        }, dismiss => {
            self.editAttribute = {};
        });
    }

    get userAttributeList() {
        const self = this;
        const arr = [];
        if (self.user && self.user.attributes) {
            Object.keys(self.user.attributes).forEach(key => {
                arr.push({
                    key,
                    label: self.user.attributes[key].label,
                    value: self.user.attributes[key].value,
                    type: self.user.attributes[key].type
                });
            });
        }
        return arr;
    }

    get manageGroup() {
        const self = this;
        return self.commonService.hasPermission('PMUG');
    }

    get viewGroup() {
        const self = this;
        return self.commonService.hasPermission('PVUB');
    }

    get authType(): string {
        const self = this;
        if (self.commonService.userDetails.auth && self.commonService.userDetails.auth.authType) {
            return self.commonService.userDetails.auth.authType;
        } else {
            return 'local';
        }
    }
}
