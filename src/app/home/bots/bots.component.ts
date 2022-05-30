import { Component, OnDestroy, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModalRef, NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import * as _ from 'lodash';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { UserDetails } from 'src/app/utils/interfaces/userDetails';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';

@Component({
    selector: 'odp-bots',
    templateUrl: './bots.component.html',
    styleUrls: ['./bots.component.scss'],
    animations: [
        trigger('moveUp', [
            state('void', style({
                transformOrigin: 'right bottom',
                transform: 'scale(0)'
            })),
            transition('void => *', [
                animate('250ms ease-in', style({
                    transform: 'scale(1)'
                }))
            ]),
            transition('* => void', [
                style({ transformOrigin: 'right bottom' }),
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
        trigger('slideIn', [
            state('void', style({
                top: '116px',
                right: '0'
            })),
            transition('void => *', [
                animate('400ms ease-in', keyframes([
                    style({
                        opacity: 0,
                        transform: 'translateX(80px)'
                    }),
                    style({
                        opacity: 1,
                        transform: 'translateX(0px)'
                    })
                ]))
            ]),
            transition('* => void', [
                animate('600ms ease-out', keyframes([
                    style({
                        opacity: .7,
                        transform: 'translateX(80px)'
                    }),
                    style({
                        opacity: .5,
                        transform: 'translateX(100px)'
                    }),
                    style({
                        opacity: 0
                    })
                ]))
            ])
        ])
    ]
})
export class BotsComponent implements OnInit, OnDestroy {

    @ViewChild('deleteModal', { static: false }) deleteModal: TemplateRef<HTMLElement>;
    @ViewChild('newBotModal', { static: false }) newBotModal: TemplateRef<HTMLElement>;
    newBotModalRef: NgbModalRef;
    userForm: FormGroup;
    botList: Array<UserDetails> = [];
    apiConfig: GetOptions = {};
    subscriptions: any = {};
    showLazyLoader: boolean;
    showUsrManage: boolean;
    selectedBot: any;
    filterBotText: string;
    userExist: boolean;
    teamList: Array<any>;
    displayTeamList: boolean;
    selectedTeamSize: number;
    toggleImportBots: boolean;
    breadcrumbPaths: Array<Breadcrumb>;
    totalRecords: number;
    constructor(private fb: FormBuilder,
        private commonService: CommonService,
        private ngbToolTipConfig: NgbTooltipConfig,
        private ts: ToastrService,
        private appService: AppService) {
        const self = this;
        self.userForm = self.fb.group({
            userData: self.fb.group({
                username: [null, [Validators.required, Validators.pattern('[a-zA-Z0-9\\s-_@#.]+')]],
                password: [null, [Validators.required, Validators.minLength(8)]],
                bot: [true],
                attributes: [{}],
                basicDetails: self.fb.group({
                    name: [null, [Validators.required, Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9\\s-_@#.]+')]],
                    phone: [null],
                    email: [null, [Validators.pattern(/[\w]+@[a-zA-Z0-9-]{2,}(\.[a-z]{2,})+/)]],
                    description: [null],
                }),
                auth: self.fb.group({
                    authType: ['azure']
                }),
                accessControl: self.fb.group({
                    accessLevel: ['Selected'],
                    apps: [[]],
                }),
                roles: [null]
            })
        });
        self.showLazyLoader = true;
        self.showUsrManage = false;
        self.teamList = [];
        self.displayTeamList = false;
        self.selectedTeamSize = 0;
        self.apiConfig = {};
        self.breadcrumbPaths = [];
    }

    ngOnInit() {
        const self = this;
        self.breadcrumbPaths.push({
            active: true,
            label: 'Bots'
        });
        self.ngbToolTipConfig.container = 'body';
        self.initConfig();
        self.commonService.apiCalls.componentLoading = false;
        self.getBotList();
        if (self.hasPermission('PMG')) {
            self.fetchTeams();
        }
    }

    insufficientPermission() {
        const self = this;
        self.ts.warning('You don\'t have enough permissions');
    }

    ngOnDestroy() {
        const self = this;
        Object.keys(self.subscriptions).forEach(e => {
            self.subscriptions[e].unsubscribe();
        });
        if (self.newBotModalRef) {
            self.newBotModalRef.close();
        }
    }

    initConfig() {
        const self = this;
        self.botList = [];
        self.apiConfig.count = 10;
        self.apiConfig.page = 1;
        self.apiConfig.noApp = true;
        self.apiConfig.filter = { bot: true };
    }

    checkTeamSize() {
        const self = this;
        self.selectedTeamSize = self.groupList.filter(e => e.value).length;
    }

    newBot() {
        const self = this;
        self.newBotModalRef = self.commonService.modal(self.newBotModal, { centered: true, size: 'lg', windowClass: 'new-user-modal' });
        self.newBotModalRef.result.then(close => {
            self.userExist = false;
            self.userForm.get('userData.basicDetails.name').enable();
            self.userForm.reset({ userData: { bot: true, auth: { authType: 'azure' } } });
        }, dismiss => {
            self.userExist = false;
            self.userForm.get('userData.basicDetails.name').enable();
            self.userForm.reset({ userData: { bot: true, auth: { authType: 'azure' } } });
        });
    }

    addBot() {
        const self = this;
        // If the userForm is invalid don't submit
        self.userForm.get('userData.basicDetails.name').markAsDirty();
        self.userForm.get('userData.username').markAsDirty();
        self.userForm.get('userData.password').markAsDirty();
        if (self.userForm.invalid) {
            return;
        } else {
            self.createAndAddToGroup();
        }
    }

    importBot() {
        const self = this;
        // const payload = {};
        const teamData = [];
        self.groupList.forEach((e, i) => {
            if (e.value) {
                teamData.push(self.teamList[i]._id);
            }
        });
        const payload = {
            groups: teamData
        };

        const username = self.userForm.get('userData.username').value;
        self.commonService.put('user', `/${self.commonService.app._id}/user/utils/import/${username}`, payload)
            .subscribe((res) => {
                self.newBotModalRef.close(true);
                self.initConfig();
                self.botList = [];
                self.getBotList();
                self.ts.success('Bot Imported successfully');
                self.selectedTeamSize = 0;
            }, (err) => {
                self.commonService.errorToast(err);
                self.selectedTeamSize = 0;
            });
    }

    createAndAddToGroup() {
        const self = this;
        const userData = self.userForm.get('userData').value;
        const teamData = [];
        self.groupList.forEach((e, i) => {
            if (e.value) {
                teamData.push(self.teamList[i]._id);
            }
        });
        userData.bot = true;
        userData.auth = { authType: 'azure' };
        const payload = {
            user: userData,
            groups: teamData
        };
        self.commonService.post('user', `/${self.commonService.app._id}/user`, payload)
            .subscribe((res) => {
                self.newBotModalRef.close(true);
                self.initConfig();
                self.botList = [];
                self.getBotList();
                self.ts.success('Bot created successfully');
                self.selectedTeamSize = 0;
            }, (err) => {
                self.commonService.errorToast(err);
                self.selectedTeamSize = 0;
            });
    }

    checkForDuplicate() {
        const self = this;
        const enteredUN = self.userForm.get('userData.username').value;
        if (self.botList && self.botList.length > 0 && self.botList.find(u => u.username === enteredUN)) {
            self.ts.warning('Bot already exist in this app.');
            self.userForm.get('userData.username').patchValue(null);
            return;
        }
        self.commonService.get('user', `/auth/authType/${enteredUN}`)
            .subscribe(res => {
                const temp = res;
                self.userExist = true;
                self.userForm.get('userData.basicDetails.name').patchValue(temp.name);
                self.userForm.get('userData.basicDetails.name').disable();
            }, err => {
                self.userExist = false;
                self.userForm.get('userData.basicDetails.name').patchValue(null);
                self.userForm.get('userData.basicDetails.name').enable();
            });
    }

    /**
     * This method is used to initialize userForm. We are doing this inside this method so that
     * we can also  populate the team list for multiselect dropdown.
     */
    fetchTeams() {
        const self = this;
        self.subscriptions['teamsList'] = self.commonService.get('user', `/${self.commonService.app._id}/group`, { noApp: true, count: -1 })
            .subscribe((teams) => {
                self.teamList = teams;
                const index = self.teamList.findIndex(e => e.name === '#');
                if (index >= 0) {
                    self.teamList.splice(index, 1);
                }
                const controls = self.teamList.map(e => self.fb.control(false));
                self.userForm.addControl('teamData', self.fb.array(controls));
            });
    }

    getBotList() {
        const self = this;
        if (self.subscriptions['botList']) {
            self.subscriptions['botList'].unsubscribe();
        }
        if (self.hasPermission('PMB') || self.hasPermission('PVB')) {
            self.getBotCount();
            self.showLazyLoader = true;
            self.subscriptions['botList'] = self.commonService.get('user', `/${self.commonService.app._id}/bot`, self.apiConfig)
                .subscribe((users) => {
                    self.showLazyLoader = false;
                    if (users.length > 0) {
                        users.forEach((usr) => {
                            usr.checked = false;
                            self.botList.push(usr);
                        });
                    }
                }, (err) => {
                    self.showLazyLoader = false;
                    self.ts.error(err.error.message);
                });
        }
    }

    getBotCount() {
        const self = this;
        if (self.subscriptions['botCount']) {
            self.subscriptions['botCount'].unsubscribe();
        }
        if (self.hasPermission('PMB') || self.hasPermission('PVB')) {
            self.subscriptions['botCount'] = self.commonService.get('user', `/${self.commonService.app._id}/bot/utils/count`, self.apiConfig)
                .subscribe((res) => {
                    self.totalRecords = res;
                }, (err) => {
                    self.ts.error(err.error.message);
                });
        }
    }

    hasPermission(type: string) {
        const self = this;
        return self.commonService.hasPermission(type);
    }

    getLastActiveTime(time) {
        if (time) {
            const lastLoggedIn = new Date(time);
            return moment(lastLoggedIn).fromNow() === 'a day ago' ? '1 day ago' : moment(lastLoggedIn).fromNow();
        }
        return;
    }

    editBot(e, user: UserDetails) {
        e.stopPropagation();
        const self = this;
        self.showUsrManage = true;
        self.selectedBot = user;
        self.updateBreadCrumb(self.selectedBot.basicDetails.name);
    }

    search(searchTerm) {
        const self = this;
        self.apiConfig.filter = {
            $or: [
                { username: '/' + searchTerm + '/' },
                { 'basicDetails.name': '/' + searchTerm + '/' }
            ],
            bot: true
        };
        self.apiConfig.page = 1;
        self.botList = [];
        self.getBotList();
    }

    clearSearch() {
        const self = this;
        self.initConfig();
        self.getBotList();
    }

    sortSelected(model: any) {
        const self = this;
        self.botList = [];
        self.apiConfig.sort = self.appService.getSortQuery(model);
        self.getBotList();
        self.getBotCount();
    }

    loadMore(data: any) {
        const self = this;
        self.botList = [];
        self.apiConfig.page = data.page;
        self.getBotList();
    }

    isThisBot(user) {
        return user._id === this.commonService.userDetails._id;
    }

    removeSelectedBots() {
        const self = this;
        const selectedBots = [];
        self.botList.forEach((usr) => {
            if (usr.checked) {
                selectedBots.push(usr._id);
            }
        });
        self.removeBots(selectedBots);
    }

    updateBreadCrumb(usr) {
        const self = this;
        if (self.breadcrumbPaths.length === 2) {
            self.breadcrumbPaths.pop();
        }
        self.breadcrumbPaths.push({
            active: true,
            label: usr
        });
    }

    removeBots(userIds: Array<string>) {
        const self = this;
        self.subscriptions['removeBots'] = self.commonService
            .put('user', `/app/${self.commonService.app._id}/removeBots`, { userIds })
            .subscribe((res) => {
                self.initConfig();
                self.botList = [];
                self.apiConfig.page = 1;
                self.getBotList();
                self.ts.success(`Removed Bot(s) from ${self.commonService.app._id} App Successfully`);
            }, (err) => {
                self.commonService.errorToast(err);
            });
    }

    isAppAdmin(user: UserDetails) {
        const self = this;
        return !!(user.accessControl.apps
            && user.accessControl.apps.length > 0
            && user.accessControl.apps.find(e => e._id === self.commonService.app._id));

    }

    get groupList() {
        const self = this;
        return self.userForm.get('teamData') ? (self.userForm.get('teamData') as FormArray).controls : [];
    }

    get authType() {
        const self = this;
        return self.commonService.userDetails.auth.authType;
    }

    get selected() {
        const self = this;
        return self.botList.filter(e => e.checked).length;
    }

    get invalidName() {
        const self = this;
        return self.userForm.get('userData.basicDetails.name').dirty
            && self.userForm.get('userData.basicDetails.name').hasError('required');
    }

    get invalidBotname() {
        const self = this;
        return self.userForm.get('userData.username').dirty &&
            self.userForm.get('userData.username').hasError('required');
    }

    get invalidPassword() {
        const self = this;
        return self.userForm.get('userData.password').dirty &&
            self.userForm.get('userData.password').hasError('required');
    }

    get invalidPasswordLength() {
        const self = this;
        return self.userForm.get('userData.password').dirty &&
            self.userForm.get('userData.password').hasError('minlength');
    }

    get invalidEmail() {
        const self = this;
        return self.userForm.get('userData.basicDetails.email').dirty &&
            self.userForm.get('userData.basicDetails.email').hasError('pattern');
    }

    get invalidTeamSize() {
        const self = this;
        return self.userForm.get('teamData').dirty &&
            self.userForm.get('teamData').hasError('required');
    }

    set checkAll(val) {
        const self = this;
        self.botList.forEach(u => {
            u.checked = val;
        });
    }

    get checkAll() {
        const self = this;
        if (!self.botList || self.botList.length === 0) {
            return false;
        }
        return self.botList.every(e => e.checked);
    }
}
