import { Component, OnDestroy, OnInit, ViewChild, TemplateRef, Renderer2, EventEmitter, Self } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { App } from 'src/app/utils/interfaces/app';
import { AppService } from 'src/app/utils/services/app.service';
import { UserDetails } from 'src/app/utils/interfaces/userDetails';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'odp-app-manage',
    templateUrl: './app-manage.component.html',
    styleUrls: ['./app-manage.component.scss'],
    animations: [
        trigger('stopping', [
            state('disabled', style({
                opacity: '0.5',
            })), state('enable', style({
                opacity: '1',
            })),
            transition('* => *', animate('1s'))
        ]),
        trigger('cardAction', [
            state('expand', style({
                'min-height': '174px',
                'max-height': '230px'
            })),
            state('collapse', style({
                'min-height': '40px',
                'max-height': '40px'
            })),
            state('centerLocate', style({
                transform: 'translate(-100px,42px)'
            })),
            state('initLocate', style({
                transform: 'translate(0px,0px)'
            })),
            state('circleExpand', style({
                background: 'rgba(209,239,218,1)'
            })),
            state('stopCircleExpand', style({
                background: 'rgba(248,220,220,1)'
            })),
            state('stopCircleShrink', style({
                background: 'rgba(248,220,220,0)'
            })),
            state('circleShrink', style({
                background: 'rgba(209,239,218,0)'
            })),
            state('buttonGroupShow', style({
                height: '87px',
                opacity: '1'
            })),
            state('buttonGroupHide', style({
                height: '0px',
                opacity: '0',
                display: 'none'
            })),
            state('loadingShow', style({
                opacity: '1',
                display: 'block'
            })),
            state('loadingHide', style({
                opacity: '0',
                display: 'none'
            })),
            state('showProcessing', style({
                opacity: '1',
                display: 'block',
                height: '13px'

            })),
            state('hideProcessing', style({
                opacity: '0',
                display: 'none',
                height: '0px'
            })),
            state('playIcon', style({
                opacity: '1',
                display: 'block',
                color: '#0d9e1b'
            })),
            state('midStage', style({
                opacity: '1',
                display: 'block',
                color: '#BDBDBD'
            })),
            state('playIconHide', style({
                opacity: '0',
                display: 'none',
                color: '#BDBDBD'
            })),

            transition('initLocate => centerLocate', animate('0.5s ease-in')),
            transition('buttonGroupHide => buttonGroupShow', animate('0.25s  ease-out')),
            transition('collapse => expand', animate('0.25s')),
            transition('* => *', animate('0.25s')),
        ]),
    ]
})
export class AppManageComponent implements OnInit, OnDestroy {

    activeTab: number;
    activeImageTab: number;
    appData: App;
    oldData: App;
    subscriptions: any = {};
    userConfig: GetOptions = {};
    groupConfig: GetOptions = {};
    appUsers: Array<UserDetails> = []; // For displaying list of users not present in selected App
    userList: Array<UserDetails> = []; // For displaying list of users present in selected App
    tempList: Array<any> = []; // placeholder
    groupList: Array<any> = [];
    selectedGroup: any;
    addUserModal: boolean;
    groupUserList: Array<UserDetails> = [];
    filterUserText: string;
    allUsers: boolean;
    showLazyLoader: boolean;
    selectedUsersForAddition: Array<any> = [];
    confirmModalState: any;
    confirmModalStateFlow: any;
    serviceStatus: any = {};
    partnerFlowStatus: any = {};
    identityDetails: any = {};
    infoStatus: string;
    afterStatus: string;
    cancelStatus: string;
    flowModalState: any = {};
    signedType: string;
    startServiceAttributes: any = {};
    proccessing: boolean;
    processing: boolean;
    cardActionDisabled: string;
    openDeleteModal: EventEmitter<any>;
    alertModal: {
        statusChange?: boolean;
        title: string;
        message: string;
        _id: string;
    };
    startFlowAttributes: any = {};
    @ViewChild('keyValModalTemplate', { static: false }) keyValModalTemplate: TemplateRef<HTMLElement>;
    @ViewChild('imageCropModal', { static: false }) imageCropModal: TemplateRef<HTMLElement>;
    keyValModalTemplateRef: NgbModalRef;
    data: any;
    toggleColorPicker: boolean;
    versionConfig: any;
    retainDataHistory: boolean;
    defaultVersionValues: Array<any> = [null, '', '-1', '10', '25', '50', '100', '1 months', '3 months', '6 months', '1 years'];
    authType: string;
    isCalenderEnabled: boolean;
    timezones: Array<string>;
    constructor(private renderer: Renderer2,
        private commonService: CommonService,
        private appService: AppService,
        private router: Router,
        private ts: ToastrService,
        private route: ActivatedRoute) {
        const self = this;
        self.activeTab = 1;
        self.activeImageTab = 1;
        self.appData = {};
        self.appData.appCenterStyle = {
            bannerColor: true,
            primaryColor: 'EB5F66',
            theme: 'light',
            textColor: 'FFFFFF'
        };
        self.appData.workflowConfig = {
            user: false,
            bot: false,
            group: false
        };
        self.appData.logo = {};
        self.addUserModal = false;
        self.allUsers = false;
        self.confirmModalState = {};
        self.confirmModalStateFlow = {};
        self.startServiceAttributes = {
            startCircle: 'cricleEnd',
            iconAnimate: 'iconInit',
            loadAnimate: 'unload',
            startCard: 'closed',
            startAction: 'infoHide',
            startGroup: 'buttonGroupHide',
            processing: 'infoHide',
            playIcon: 'playIcon',
            tickAction: 'hideProcessing',
            complete: 'infoHide',
            playLoader: 'loadingHide',
            stopLoader: 'loadingHide'
        };
        self.startFlowAttributes = {
            startCircle: 'cricleEnd',
            iconAnimate: 'iconInit',
            loadAnimate: 'unload',
            startCard: 'closed',
            startAction: 'infoHide',
            startGroup: 'buttonGroupHide',
            processing: 'infoHide',
            playIcon: 'playIcon',
            tickAction: 'hideProcessing',
            complete: 'infoHide',
            playLoader: 'loadingHide',
            stopLoader: 'loadingHide'
        };
        self.openDeleteModal = new EventEmitter();
        self.alertModal = {
            statusChange: false,
            title: '',
            message: '',
            _id: null
        };
        self.retainDataHistory = true;
        self.data = {};
        self.versionConfig = {};
        self.authType = self.commonService.userDetails.auth.authType;
        this.timezones = this.appService.getTimezones();
    }

    ngOnInit() {
        const self = this;
        self.userConfig.count = -1;
        self.userConfig.noApp = true;
        self.userConfig.filter = {};
        self.userConfig.select = 'basicDetails.name username email _metadata.lastUpdated';
        self.groupConfig.count = -1;
        self.groupConfig.noApp = true;
        self.groupConfig.select = 'name users';
        self.renderer.listen('body', 'keyup', (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                self.onCancel();
            }
        });
        self.infoStatus = 'hideInfo';
        self.getApp(self.commonService.app._id);
        self.getCalenderDataService();
        self.confirmModalState['allservice'] = true;
        self.confirmModalState['startAll'] = false;
        self.confirmModalStateFlow['allFlow'] = true;
        self.confirmModalStateFlow['startAll'] = false;

        self.afterStatus = 'beforeStart';
        self.proccessing = false;
    }
    onCancel() {
        const self = this;
        if (self.addUserModal) {
            self.addUserModal = false;
            self.allUsers = false;
            self.selectedUsersForAddition = [];
        }
    }

    handleUpdate(data) {
        console.dir(data);
    }

    getApp(id: string) {
        const self = this;
        self.showLazyLoader = true;
        self.commonService.get('user', '/data/app/' + id, { noApp: true }).subscribe(res => {
            self.showLazyLoader = false;
            self.tempList = res.users;
            self.appData = Object.assign(self.appData, res);
            self.oldData = self.appService.cloneObject(self.appData);
            self.getUserDetail();
            self.getIdentityDetails();
            self.configureVersionSettings();
        }, err => {
            self.showLazyLoader = false;
        });
    }

    configureVersionSettings() {
        const self = this;
        if (!self.appData.serviceVersionValidity) {
            self.appData.serviceVersionValidity = {
                validityType: 'count',
                validityValue: -1
            };
        }
        if (self.appData.serviceVersionValidity.validityValue === '0' || self.appData.serviceVersionValidity.validityValue === 0) {
            self.retainDataHistory = false;
        }
        self.versionConfig.type = self.appData.serviceVersionValidity.validityType;
        const validityValue = self.appData.serviceVersionValidity.validityValue.toString();
        if (+validityValue.split(' ')[0] > 0) {
            const defaultIndex = self.defaultVersionValues.findIndex(e => {
                if (e === validityValue) {
                    return e;
                }
            });
            if (!(defaultIndex > -1)) {
                self.versionConfig.value = 'custom';
                self.versionConfig.customValue = validityValue.split(' ')[0];
                self.versionConfig.customValueSuffix = validityValue.split(' ')[1];
                self.versionConfig.isCustomValue = true;
            } else {
                self.versionConfig.value = validityValue;
            }
        } else {
            self.versionConfig.value = validityValue;
        }
    }

    download(type?: string) {
        const self = this;
        const ele: HTMLAnchorElement = document.createElement('a');
        ele.target = '_blank';
        let queryParams;
        if (type !== 'csr') {
            queryParams = `identity/${self.commonService.app._id}/fetch/download`;
        } else {
            queryParams = `identity/${self.commonService.app._id}/csr`;
        }
        if (environment.production) {
            ele.href = `${environment.url.sec}/${queryParams}`;
        } else {
            ele.href = `http://localhost/api/a/sec/${queryParams}`;
        }
        ele.click();
        ele.remove();
    }
    getUserDetail() {
        const self = this;
        self.subscriptions['userDetails'] = self.commonService.get('user', `/data/app/${self.appData._id}`, { noApp: true, count: -1 })
            .subscribe(d => {
                if (d.length > 0) {
                    self.userList = d;
                }
            }, err => {
                self.commonService.errorToast(err, 'Unable to fetch users, please try again later');
            });
    }

    otherAppUsers() {
        const self = this;
        self.addUserModal = true;
        const existingUserIds = [];
        self.userList.forEach(e => existingUserIds.push(e._id));
        const config = {
            count: -1,
            noApp: true,
            filter: {
                _id: { $nin: existingUserIds }
            }
        };
        self.subscriptions['userlist'] = self.commonService.get('user', `/${this.appData._id}/user`, config).subscribe((d: Array<UserDetails>) => {
            if (d.length > 0) {
                d.forEach(u => {
                    u.checked = false;
                });
                self.appUsers = d;
            }
        }, err => {
            self.commonService.errorToast(err, 'Unable to fetch users, please try again later');
        });
    }

    toggleUserSelection(user) {
        const self = this;
        if (!user.checked) {
            self.selectUsr(user);
        } else {
            self.deSelectUsr(user);
        }
    }

    selectUsr(user) {
        const self = this;
        user.checked = !user.checked;
        self.allUsers = self.appUsers.every(e => e.checked);
        const userIndex = self.selectedUsersForAddition.findIndex(e => e === user._id);
        if (userIndex >= 0) {
            return;
        } else {
            self.selectedUsersForAddition.push(user._id);
        }
    }

    deSelectUsr(user) {
        const self = this;
        const idx = self.selectedUsersForAddition.findIndex(e => e === user._id);
        if (idx >= 0) {
            self.selectedUsersForAddition.splice(idx, 1);
        }
        user.checked = !user.checked;
        const i = self.appUsers.findIndex(e => e.checked === false);
        if (i > 0) {
            self.allUsers = false;
        }
    }

    selectAllUsrs() {
        const self = this;
        if (self.allUsers) {
            self.appUsers.forEach(e => e['checked'] = true);
            self.selectedUsersForAddition = [];
            self.appUsers.forEach(e => self.selectedUsersForAddition.push(e._id));
        } else {
            self.appUsers.forEach(e => e['checked'] = false);
            self.selectedUsersForAddition = [];
        }
    }



    imageUpload(data: { message?: string, image?: string }, type: string) {
        const self = this;
        if (type === 'logo') {
            self.appData.logo.full = data.image;
        } else {
            self.appData.logo.thumbnail = data.image;
        }
    }

    save() {
        const self = this;
        if (!this.changesDone) {
            return;
        }
        self.commonService.put('user', '/data/app/' + self.appData._id, self.appData).subscribe(res => {
            self.oldData = self.appService.cloneObject(self.appData);
            self.ts.success('App saved successfully');
            self.commonService.appUpdates.emit(self.appData);
            self.commonService.app = res;
        }, err => {
            self.commonService.errorToast(err);
        });
    }

    deleteApp() {
        const self = this;
        self.alertModal.statusChange = false;
        self.alertModal.title = 'Delete App';
        self.alertModal.message = 'Are you sure you want to delete app <span class="text-delete font-weight-bold">' + self.appData._id
            + '</span>? This action will delete the entire app including all the data services within it. This action is undoable.';
        self.openDeleteModal.emit(self.alertModal);
    }

    closeDeleteModal(data) {
        const self = this;
        if (data) {
            const url = '/admin/app/' + data._id;
            self.showLazyLoader = true;
            self.subscriptions['deleteApp'] = self.commonService.delete('user', url).subscribe(d => {
                self.showLazyLoader = false;
                self.ts.success('App deleted successfully');
                self.router.navigate(['/admin']);
            }, err => {
                self.showLazyLoader = false;
                self.commonService.errorToast(err, 'Unable to delete, please try again later');
            });
        }
    }

    get selectedColorStyle() {
        const self = this;
        let retValue;
        if (self.appData.appCenterStyle.primaryColor.charAt(0) === '#') {
            retValue = self.appData.appCenterStyle.primaryColor;
        } else {
            retValue = '#' + self.appData.appCenterStyle.primaryColor;
        }
        return {
            background: retValue
        };
    }

    get changesDone() {
        const self = this;
        if (JSON.stringify(self.appData) === JSON.stringify(self.oldData)) {
            return false;
        } else {
            return true;
        }
    }

    getLastActiveTime(time) {
        if (time) {
            const lastLoggedIn = new Date(time);
            return moment(lastLoggedIn).fromNow() === 'a day ago' ? '1 day ago' : moment(lastLoggedIn).fromNow();
        }
        return;
    }

    isThisUser(user) {
        if (user._id === this.commonService.userDetails._id) {
            return true;
        }
        return false;
    }

    getGroups(appId: string) {
        const self = this;
        self.groupConfig.filter = {
            app: appId
        };
        self.commonService.get('user', `/${this.commonService.app._id}/group`, self.groupConfig).subscribe(res => {
            if (res.length > 0) {
                self.groupList = res;
                const index = self.groupList.findIndex(e => e.name === '#');
                if (index >= 0) {
                    self.groupList.splice(index, 1);
                }
                self.selectedGroup = self.groupList[0];
                self.getUsers();
            }
        }, err => {
            self.commonService.errorToast(err, 'Unable to fetch  groups, please try again later');
        });
    }

    getUsers() {
        const self = this;
        if (self.selectedGroup && self.selectedGroup.length > 0) {
            self.userConfig.filter['_id'] = { $in: self.selectedGroup.users };
            self.subscriptions['getuserlist'] = self.commonService.get('user', `/${this.appData._id}/user`, self.userConfig).subscribe(d => {
                if (d.length > 0) {
                    self.groupUserList = d;
                }
            }, err => {
                self.commonService.errorToast(err, 'Unable to fetch users, please try again later');
            });
        }
    }

    addSelectedUsers() {
        const self = this;
        if (self.selectedUsersForAddition.length > 0) {
            const payload = { users: self.selectedUsersForAddition };
            self.subscriptions['userAddition'] = self.commonService
                .put('user', `/data/app/${self.appData._id}/addUsers`, payload)
                .subscribe(() => {
                    self.onCancel();
                    self.getUserDetail();
                    self.ts.success(`User(s) successfully added to ${self.appData._id} App`);
                }, (err) => {
                    self.onCancel();
                    self.ts.warning(err.error.message);
                });
        } else {
            self.ts.warning('Please Select at least one user to proceed');
        }
    }

    ngOnDestroy() {
        const self = this;
        Object.keys(self.subscriptions).forEach(e => {
            self.subscriptions[e].unsubscribe();
        });
    }

    isAppAdmin(user: UserDetails) {
        const self = this;
        if (user.accessControl
            && user.accessControl.apps
            && user.accessControl.apps.length > 0
            && user.accessControl.apps.find(e => e._id === self.appData._id)) {
            return true;
        }
        return false;
    }

    startAllServices() {
        const self = this;
        self.startServiceAttributes['playCircle'] = 'circleShrink';
        self.startServiceAttributes['playLoader'] = 'loadingShow';
        self.startServiceAttributes['startGroup'] = 'buttonGroupHide';
        self.startServiceAttributes['processing'] = 'playIcon';
        self.startServiceAttributes['playIcon'] = 'midStage';
        self.proccessing = true;
        self.cardActionDisabled = 'disabled';
        self.commonService.put('serviceManager', `/${self.appData._id}/service/utils/startAll`, { app: this.commonService.app._id }).subscribe(res => {
            self.startAllServices['processing'] = 'playIconHide';
            if (res) {
                self.startAllServices['processing'] = 'playIconHide';
                self.startAllServices['processing'] = 'playIconHide';
                self.startServiceAttributes['playIcon'] = 'playIconHide';
                self.startServiceAttributes['playLoader'] = 'hideProcessing';
                self.startServiceAttributes['tickAction'] = 'playIcon';
                self.proccessing = false;
                self.startServiceAttributes['complete'] = 'showProcessing';
                self.cardActionDisabled = 'enable';
                self.getManagementDetails();
                self.startAllServices['processing'] = 'playIconHide';
            }
        });
    }
    stopAllServices() {
        const self = this;
        self.startServiceAttributes['stopCircle'] = 'stopCircleShrink';
        self.startServiceAttributes['stopLoader'] = 'loadingShow';
        self.startServiceAttributes['stopGroup'] = 'buttonGroupHide';
        self.startServiceAttributes['processing'] = 'playIcon';
        self.proccessing = true;
        self.cardActionDisabled = 'disabled';
        self.commonService.put('serviceManager', `/${self.appData._id}/service/utils/stopAll`, { app: this.commonService.app._id }).subscribe(res => {
            if (res) {
                self.startAllServices['processing'] = 'playIconHide';
                self.startAllServices['processing'] = 'playIconHide';
                self.startServiceAttributes['stopIcon'] = 'playIconHide';
                self.startServiceAttributes['stopCircle'] = 'hideProcessing';
                self.startServiceAttributes['stopTickAction'] = 'playIcon';
                self.startServiceAttributes['stopLoader'] = 'loadingHide';
                self.proccessing = false;
                self.startServiceAttributes['complete'] = 'showProcessing';
                self.cardActionDisabled = 'enable';
                self.getManagementDetails();
            }
        });
    }

    toggleStopCard(name: string) {
        const self = this;

        if (self.startServiceAttributes['playLoader'] === 'loadingShow' || self.startServiceAttributes['stopLoader'] === 'loadingShow') {
            return false;
        }
        if (!self.serviceStatus.Active && name === 'stopAll') {
            return false;
        }
        Object.keys(self.confirmModalState).forEach(key => {
            self.confirmModalState[key] = false;
        });
        self.startServiceAttributes['stopLoader'] = 'loadingHide';
        if (!self.confirmModalState['startAll']) {
            self.startServiceAttributes = {
                stopCard: 'expand',
                stopanimateItems: 'centerLocate',
                stopCircle: 'stopCircleExpand',
                stopGroup: 'buttonGroupShow',
                stopLoader: 'loadingHide',
                playLoader: 'loadingHide'
            };

        } else if (self.confirmModalState['allservice']) {
            self.startServiceAttributes = {
                stopCard: 'collapse',
                stopanimateItems: 'initLocate',
                stopCircle: 'stopCircleExpand',
                stopGroup: 'buttonGroupHide',
                stopLoader: 'loadingHide',
                playLoader: 'loadingHide'
            };
        }


    }
    toggleCard(name: string) {
        const self = this;
        if (self.startServiceAttributes['playLoader'] === 'loadingShow' || self.startServiceAttributes['stopLoader'] === 'loadingShow') {
            return false;
        }
        if (self.startServiceAttributes['tickAction'] === 'playIcon' && name === 'startAll') {
            return false;
        }
        if (!self.serviceStatus.Undeployed && name === 'startAll') {
            return false;
        }
        Object.keys(self.confirmModalState).forEach(key => {
            self.confirmModalState[key] = false;
        });
        self.startServiceAttributes['playIcon'] = 'playIcon';
        self.startServiceAttributes['playLoader'] = 'loadingHide';
        self.confirmModalState[name] = true;
        if (self.confirmModalState['startAll']) {
            self.startServiceAttributes = {
                startCard: 'expand',
                animateItems: 'centerLocate',
                playCircle: 'circleExpand',
                startGroup: 'buttonGroupShow',
                playLoader: 'loadingHide',
                stopLoader: 'loadingHide',
            };

        } else if (self.confirmModalState['allservice']) {
            self.startServiceAttributes = {
                startCard: 'collapse',
                animateItems: 'initLocate',
                startGroup: 'buttonGroupHide',
                playLoader: 'loadingHide',
                stopLoader: 'loadingHide',
            };
        }
    }

    getManagementDetails() {
        const self = this;
        self.commonService.get('serviceManager', `/${this.commonService.app._id}/service/utils/status/count`, { filter: { app: this.commonService.app._id } }).subscribe(res => {
            self.serviceStatus = res;
        }, (err) => {
            self.ts.warning(err.error.message);
        });

    }
    getIdentityDetails() {
        const self = this;
        self.commonService.get('sec', `/identity/${self.commonService.app._id}`).subscribe(res => {
            if (res) {
                self.identityDetails = res.message;
                if (res.message.info) {
                    if (self.identityDetails.info['subject']['OU'] === self.identityDetails.info['issuer']['OU']) {
                        self.signedType = 'self';
                    } else {
                        self.signedType = self.identityDetails.info['issuer']['OU'];
                    }
                }
            }
        }, err => {
            self.commonService.errorToast(err);
        });
    }

    patchVersionValue(reset?) {
        const self = this;
        let value;
        if (reset) {
            if (self.versionConfig.type === 'count') {
                self.versionConfig = {
                    type: 'count',
                    value: '-1',
                    customValue: 10
                };
            } else {
                self.versionConfig = {
                    type: 'time',
                    value: '',
                    customValue: 10,
                    customValueSuffix: 'days'
                };
            }
        }
        self.versionConfig.isCustomValue = false;
        if (self.versionConfig.value === 'custom') {
            self.versionConfig.isCustomValue = true;
            value = self.versionConfig.customValue >= 0 ? self.versionConfig.customValue.toString() : null;
            if (value && self.versionConfig.type === 'time') {
                value += ' ' + self.versionConfig.customValueSuffix;
            }
        } else {
            value = self.versionConfig.value;
        }
        self.appData.serviceVersionValidity.validityType = self.versionConfig.type;
        self.appData.serviceVersionValidity.validityValue = value;
    }

    onVersionChange(value) {
        const self = this;
        if (value) {
            self.patchVersionValue(true);
        } else {
            self.retainDataHistory = false;
            self.appData.serviceVersionValidity.validityType = 'count';
            self.appData.serviceVersionValidity.validityValue = 0;
        }
    }

    get validityValidator() {
        if (this.versionConfig.customValue > 0 && this.versionConfig.customValue !== null) {
            return true;
        } else if (this.versionConfig.customValue === 0) {
            return false;
        }
    }

    openPropertiesModal(data?: any) {
        const self = this;
        if (data) {
            self.data = data;
            self.data.isEdit = true;
        }
        self.keyValModalTemplateRef = self.commonService
            .modal(self.keyValModalTemplate, { centered: true, windowClass: 'key-value-modal' });
        self.keyValModalTemplateRef.result.then(close => {
            if (close) {
                let temp = self.appData.headers;
                if (!temp) {
                    temp = [];
                }
                const tempIndex = temp.findIndex(e => e.key === self.data.key);
                if (tempIndex > -1) {
                    temp.splice(tempIndex, 1);
                }
                temp.push({
                    key: self.data.key,
                    value: self.data.value,
                    header: self.convertHeader(self.data.key)
                });
                self.appData.headers = temp;
            }
            self.data = {};
        }, dismiss => {
            self.data = {};
        });
    }

    removeProperty(key: string) {
        const self = this;
        const temp = self.appData.headers;
        const tempIndex = temp.findIndex(e => e.key === key);
        if (tempIndex > -1) {
            temp.splice(tempIndex, 1);
        }
        self.appData.headers = temp;
    }

    convertHeader(key: string) {
        if (key) {
            return 'Data-Stack-A-' + key.split(' ')
                .filter(e => e)
                .map(e => e.charAt(0).toUpperCase() + e.substr(1, e.length))
                .join('-');
        }
        return null;
    }

    get keyValueList() {
        const self = this;
        return self.appData.headers || [];
    }
    toggleCardFlow(name: string) {
        const self = this;
        Object.keys(self.confirmModalStateFlow).forEach(key => {
            self.confirmModalStateFlow[key] = false;
        });
        self.startFlowAttributes['playIcon'] = 'playIcon';
        self.startFlowAttributes['playLoader'] = 'loadingHide';
        self.confirmModalStateFlow[name] = true;
        if (self.confirmModalStateFlow['startAll']) {
            self.startFlowAttributes = {
                startCard: 'expand',
                animateItems: 'centerLocate',
                playCircle: 'circleExpand',
                startGroup: 'buttonGroupShow',
                playLoader: 'loadingHide',
                stopLoader: 'loadingHide',
            };

        } else if (self.confirmModalStateFlow['allFlow']) {
            self.startFlowAttributes = {
                startCard: 'collapse',
                animateItems: 'initLocate',
                startGroup: 'buttonGroupHide',
                playLoader: 'loadingHide',
                stopLoader: 'loadingHide',
            };
        }
    }
    toggleStopCardFlow(name: string) {
        const self = this;
        Object.keys(self.confirmModalStateFlow).forEach(key => {
            self.confirmModalStateFlow[key] = false;
        });
        self.startFlowAttributes['stopLoader'] = 'loadingHide';
        if (!self.confirmModalStateFlow['startAll']) {
            self.startFlowAttributes = {
                stopCard: 'expand',
                stopanimateItems: 'centerLocate',
                stopCircle: 'stopCircleExpand',
                stopGroup: 'buttonGroupShow',
                stopLoader: 'loadingHide',
                playLoader: 'loadingHide'
            };

        } else if (self.confirmModalStateFlow['allflow']) {
            self.startFlowAttributes = {
                stopCard: 'collapse',
                stopanimateItems: 'initLocate',
                stopCircle: 'stopCircleExpand',
                stopGroup: 'buttonGroupHide',
                stopLoader: 'loadingHide',
                playLoader: 'loadingHide'
            };
        }
    }
    getFlowCount() {
        const self = this;
        self.showLazyLoader = true;
        const option: GetOptions = {
            filter: {
                app: self.commonService.app._id,
            }
        };
        self.commonService.get('partnerManager', `/${self.commonService.app._id}/flow/utils/status/count`).subscribe(res => {
            self.partnerFlowStatus = res;
            self.showLazyLoader = false;

        }, err => {
            self.showLazyLoader = false;
            self.commonService.errorToast(err);
        });
    }



    startAllFlows() {
        const self = this;
        self.startFlowAttributes['playCircle'] = 'circleShrink';
        self.startFlowAttributes['playLoader'] = 'loadingShow';
        self.startFlowAttributes['startGroup'] = 'buttonGroupHide';
        self.startFlowAttributes['processing'] = 'playIcon';
        self.startFlowAttributes['playIcon'] = 'midStage';
        self.proccessing = true;
        self.cardActionDisabled = 'disabled';
        self.commonService.put('partnerManager', `/${self.commonService.app._id}/flow/utils/startAll`, { app: this.commonService.app._id }).subscribe(res => {

            if (res) {
                self.startFlowAttributes['playIcon'] = 'playIconHide';
                self.startFlowAttributes['playLoader'] = 'hideProcessing';
                self.startFlowAttributes['tickAction'] = 'playIcon';
                self.proccessing = false;
                self.startFlowAttributes['complete'] = 'showProcessing';
                self.cardActionDisabled = 'enable';
                self.getFlowCount();

            }
        }, (err => {
            self.commonService.errorToast(err);

        }));
    }
    stopAllFlows() {
        const self = this;
        self.startFlowAttributes['stopCircle'] = 'stopCircleShrink';
        self.startFlowAttributes['stopLoader'] = 'loadingShow';
        self.startFlowAttributes['stopGroup'] = 'buttonGroupHide';
        self.startFlowAttributes['processing'] = 'playIcon';
        self.proccessing = true;
        self.cardActionDisabled = 'disabled';
        self.commonService.put('partnerManager', `/${self.commonService.app._id}/flow/utils/stopAll`).subscribe(res => {
            if (res) {
                self.startFlowAttributes['stopIcon'] = 'playIconHide';
                self.startFlowAttributes['stopCircle'] = 'hideProcessing';
                self.startFlowAttributes['stopTickAction'] = 'playIcon';
                self.startFlowAttributes['stopLoader'] = 'loadingHide';
                self.proccessing = false;
                self.startFlowAttributes['complete'] = 'showProcessing';
                self.cardActionDisabled = 'enable';
                self.getFlowCount();
            }
        }, (err => {
            self.commonService.errorToast(err);

        }));
    }
    goTopartnerPage() {
        const self = this;
        self.router.navigate(['/app', self.commonService.app._id, 'pm']);
    }

    ipInvalid(ipAddress) {
        if (ipAddress) {
            try {
                const segments = ipAddress.split('.');
                const lastSeg = segments[3];
                const cidr = lastSeg.split('/');
                let flag = false;
                segments[3] = cidr[0];
                if (segments.length !== 4) {
                    flag = true;
                }
                for (let i = 0; i < 4; i++) {
                    if (!segments[i] || segments[i].match(/[^0-9]+/g)) {
                        flag = true;
                    }
                    if (segments[i] !== '*' && (parseInt(segments[i], 10) < 0 || parseInt(segments[i], 10) > 255)) {
                        flag = true;
                    }
                }
                if (cidr.length > 1 && parseInt(cidr[1], 10) > 32) {
                    flag = true;
                }
                return flag;
            } catch (e) {
                return true;
            }
        }
        return false;
    }

    ipRequired(ipAddress) {
        if (!ipAddress || !ipAddress.trim()) {
            return true;
        }
        return false;
    }

    addIP() {
        const self = this;
        const list = self.ipList;
        list.push('');
    }

    removeIP(index) {
        const self = this;
        const list = self.ipList;
        list.splice(index, 1);
    }

    changeIP(ipAddress, index) {
        const self = this;
        const list = self.ipList;
        list.splice(index, 1, ipAddress);
    }

    ChangeCalendarSettings(value) {
        const self = this;
        const url = value ? '/calendar/enable' : '/calendar/disable';
        const data = {
            app: self.commonService.app._id
        }
        self.commonService.put('serviceManager', url, data).subscribe(res => {
            self.ts.success(value ? 'Calendar enabled' : 'Calendar disabled')
            if (!environment.production) {
                console.log(res);
            }
        }, err => {
            self.commonService.errorToast(err, 'Unable to enable the Calendar dataservice');
        });

    }

    getCalenderDataService() {
        const self = this;
        const options = {
            filter: {
                app: `${self.commonService.app._id}`,
                type: 'internal',
                status: 'Active'
            }
        };
        self.commonService.get('serviceManager', `/${this.commonService.app._id}/service`, options).subscribe(res => {
            if (res.length) {
                self.isCalenderEnabled = true;
            }
        }, err => {
            self.commonService.errorToast(err);
        });
    }

    changeTab() {
        const self = this;
        self.activeTab = 3;
        self.getFlowCount();
        self.getManagementDetails();
    }

    set enabledTrustedIP(val) {
        const self = this;
        if (!self.appData.agentTrustedIP) {
            self.appData.agentTrustedIP = {
                list: [],
                enabled: false
            };
        }
        self.appData.agentTrustedIP.enabled = val;
    }

    get enabledTrustedIP() {
        const self = this;
        if (self.appData.agentTrustedIP) {
            return self.appData.agentTrustedIP.enabled;
        }
        return false;
    }

    get ipList() {
        const self = this;
        if (self.appData.agentTrustedIP && self.appData.agentTrustedIP.list) {
            return self.appData.agentTrustedIP.list;
        }
        return [];
    }

    get isInvalid() {
        const self = this;
        return (self.ipList.map(self.ipInvalid).filter(e => e).length > 0) || (self.ipList.map(self.ipRequired).filter(e => e).length > 0);
    }
}

