import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  EventEmitter,
} from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import {
  CommonService,
  GetOptions,
} from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { FilterPipe } from 'src/app/utils/pipes/filter.pipe';

@Component({
  selector: 'odp-local-bot',
  templateUrl: './local-bot.component.html',
  styleUrls: ['./local-bot.component.scss'],
  providers: [FilterPipe],
  animations: [
    trigger('slide', [
      state(
        'focus',
        style({
          left: '10px',
        })
      ),
      transition('blur <=> focus', [
        animate('300ms cubic-bezier(0.86, 0, 0.07, 1)'),
      ]),
    ]),
  ],
})
export class LocalBotComponent implements OnInit {
  @ViewChild('newBotTextarea', { static: false })
  newBotTextarea: HTMLInputElement;
  @ViewChild('newBotModal', { static: false })
  newBotModal: TemplateRef<HTMLElement>;
  @ViewChild('newKeyModal', { static: false })
  newKeyModal: TemplateRef<HTMLElement>;
  @ViewChild('newAttributeModal', { static: false })
  newAttributeModal: TemplateRef<HTMLElement>;
  @ViewChild('assignTeamModal', { static: false })
  assignTeamModal: TemplateRef<HTMLElement>;
  @ViewChild('editAttributeModal', { static: false })
  editAttributeModal: TemplateRef<HTMLElement>;
  botRecords: Array<any>;
  botForm: FormGroup;
  keyForm: FormGroup;
  newBotModalRef: NgbModalRef;
  editBotModalRef: NgbModalRef;
  newKeyModalRef: NgbModalRef;
  newAttributeModalRef: NgbModalRef;
  assignTeamModalRef: NgbModalRef;
  editAttributeModalRef: NgbModalRef;
  subscriptions: any = {};
  selectedBot: any;
  isCreate: boolean;
  showLazyLoader: boolean;
  filterTeamStr = '';
  teamOptions: GetOptions = {};
  allTeams: Array<any>;
  additionalDetails: FormGroup;
  types: Array<any>;
  openDeleteModal: EventEmitter<any>;
  openDeleteBotModal: EventEmitter<any>;
  selectedGroups: Array<any>;
  userGroupConfig: GetOptions = {};
  userTeams: Array<any>;
  slideState: string;
  searchTerm: string;
  botCount = 0;
  ignoreOutside: boolean;
  isInvalidDate: boolean;
  isLoading: boolean = false;
  isDataLoading: boolean = false;
  currentTab: string;
  ogKeys: any[];


  constructor(
    public commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private ts: ToastrService,
    private fb: FormBuilder,
    private filter: FilterPipe
  ) {
    const self = this;
    self.botRecords = [];
    self.selectedBot = {};
    self.openDeleteModal = new EventEmitter();
    self.openDeleteBotModal = new EventEmitter();
    self.userGroupConfig.filter = {};
    self.selectedGroups = [];
    self.slideState = 'blur';
    self.types = [
      { class: 'odp-abc', value: 'String', label: 'Text' },
      { class: 'odp-123', value: 'Number', label: 'Number' },
      { class: 'odp-boolean', value: 'Boolean', label: 'True/False' },
      { class: 'odp-calendar', value: 'Date', label: 'Date' },
    ];
    self.botForm = self.fb.group({
      botName: [
        null,
        [
          Validators.required,
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z0-9\\s-_@#.]+'),
        ],
      ],
      desc: [null, [Validators.maxLength(240)]],
    });
    self.keyForm = self.fb.group({
      label: [
        null,
        [
          Validators.required,
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z0-9\\s-_]+'),
        ],
      ],
      expires: [null, [Validators.required, Validators.min(1)]],
    });
    self.additionalDetails = self.fb.group({
      extraInfo: self.fb.array([]),
    });
  }

  ngOnInit() {
    const self = this;
    self.getBotRecords();
    self.getBotCount();
    this.keyForm.get('expires').valueChanges.subscribe((value) => {
      self.onDaysChange(value);
    });
    this.currentTab = 'Key'
  }

  getBotRecords() {
    const self = this;
    if (self.subscriptions['getUserList']) {
      self.subscriptions['getUserList'].unsubscribe();
    }
    self.showLazyLoader = true;
    let options = {
      filter: {
        bot: true,
      },
      noApp: true,
    };
    self.subscriptions['getUserList'] = self.commonService
      .get('user', `/${self.commonService.app._id}/bot`, options)
      .subscribe(
        (users) => {
          self.showLazyLoader = false;
          if (users.length) {
            self.selectedBot = users[0];
            self.selectRecord(self.selectedBot)
            self.getUserTeam();
          }
          self.botRecords = users;

        },
        (err) => {
          self.showLazyLoader = false;
          self.ts.error(err.error.message);
        }
      );
  }
  getBotCount() {
    const self = this;
    if (self.subscriptions['getUserCount']) {
      self.subscriptions['getUserCount'].unsubscribe();
    }
    self.showLazyLoader = true;
    let options = {
      filter: {
        bot: true,
      },
      noApp: true,
    };
    self.subscriptions['getUserCount'] = self.commonService
      .get('user', `/${self.commonService.app._id}/bot/utils/count`, options)
      .subscribe(
        (count) => {
          self.botCount = count;
        },
        (err) => {
          self.showLazyLoader = false;
          self.ts.error(err.error.message);
        }
      );
  }
  onChange(value) {
    const self = this;
    if (self.subscriptions['getUserList']) {
      self.subscriptions['getUserList'].unsubscribe();
    }
    if (value && value.length < 3) {
      return;
    }
    self.showLazyLoader = true;
    let options = {
      filter: {
        bot: true,
        'basicDetails.name': '/' + value + '/',
      },
      noApp: true,
    };
    self.subscriptions['getUserList'] = self.commonService
      .get('user', `/${self.commonService.app._id}/bot`, options)
      .subscribe(
        (users) => {
          self.showLazyLoader = false;
          if (users.length) {
            self.selectedBot = users[0];
          }
          self.botRecords = users;
        },
        (err) => {
          self.showLazyLoader = false;
          self.ts.error(err.error.message);
        }
      );
  }
  clear() {
    const self = this;
    self.searchTerm = null;
    self.getBotRecords();
  }
  createBot() {
    const self = this;
    this.botForm.markAllAsTouched()
    this.botForm.dirty;
    const payload = {
      user: {
        bot: true,
        basicDetails: {
          name: self.botForm.get('botName').value,
        },
        description: self.botForm.get('desc').value,
      },
    };
    if (this.botForm.valid) {
      self.isLoading = true
      self.commonService
        .post('user', `/${self.commonService.app._id}/bot`, payload)
        .subscribe(
          (res) => {
            self.botForm.reset();
            self.getBotRecords();
            self.getBotCount();
            self.userTeams = [];
            self.isCreate = false;
            self.isLoading = false
          },
          (err) => {
            self.isLoading = false
            self.commonService.errorToast(
              err,
              'Oops, something went wrong. Please try again later.'
            );
          }
        );
    }
    // self.newBotModalRef = self.commonService.modal(self.newBotModal, {
    //   size: 'sm',
    // });
    // self.newBotModalRef.result.then(
    //   (close) => {
    //     if (close) {
    //       const payload = {
    //         user: {
    //           bot: true,
    //           basicDetails: {
    //             name: self.botForm.get('botName').value,
    //           },
    //           description: self.botForm.get('desc').value,
    //         },
    //       };
    //       self.commonService
    //         .post('user', `/${self.commonService.app._id}/bot`, payload)
    //         .subscribe(
    //           (res) => {
    //             self.botForm.reset();
    //             self.getBotRecords();
    //             self.getBotCount();
    //             self.userTeams = [];
    //           },
    //           (err) => {
    //             self.commonService.errorToast(
    //               err,
    //               'Oops, something went wrong. Please try again later.'
    //             );
    //           }
    //         );
    //     } else {
    //       self.botForm.reset();
    //     }
    //   },
    //   (dismiss) => {
    //     self.botForm.reset();
    //   }
    // );
  }
  selectRecord(bot) {
    const self = this;
    if (bot && bot.botKeys) {
      self.selectedBot.botKeys.forEach((key) => {
        key.isNew = false;
      });
    }
    self.selectedBot = bot;
    self.ogKeys = bot.botKeys;
    self.getUserTeam();
  }
  editBot() {
    const self = this;
    self.showLazyLoader = true;
    self.isCreate = false;
    self.botForm.get('botName').patchValue(self.selectedBot.basicDetails.name);
    self.botForm.get('desc').patchValue(self.selectedBot.description);
    self.editBotModalRef = self.commonService.modal(self.newBotModal, {
      size: 'sm',
    });
    self.editBotModalRef.result.then(
      (close) => {
        if (close) {
          self.selectedBot.basicDetails.name =
            self.botForm.get('botName').value;
          self.selectedBot.description = self.botForm.get('desc').value;

          self.subscriptions['userDtl'] = self.commonService
            .put(
              'user',
              `/${this.commonService.app._id}/bot/${this.selectedBot._id}`,
              self.selectedBot
            )
            .subscribe(
              (res) => {
                self.showLazyLoader = false;

                self.botForm.reset();
                self.selectedBot = res;
              },
              (err) => {
                self.commonService.errorToast(
                  err,
                  'Oops, something went wrong. Please try again later.'
                );
              }
            );
        } else {
          self.showLazyLoader = false;
          self.botForm.reset();
        }
      },
      (dismiss) => {
        self.showLazyLoader = false;
        self.botForm.reset();
      }
    );
  }
  createBotKey() {
    const self = this;
    self.isCreate = true;
    self.newKeyModalRef = self.commonService.modal(self.newKeyModal, {
      size: 'sm',
    });
    self.newKeyModalRef.result.then(
      (close) => {
        if (close) {
          if (self.keyForm.invalid || this.isInvalidDate) {
            return;
          }
          const payload = self.keyForm.value;
          payload.expires = payload.expires * 1440;
          self.showLazyLoader = true;

          self.commonService
            .post(
              'user',
              `/${self.commonService.app._id}/bot/utils/botKey/${self.selectedBot._id}`,
              payload
            )
            .subscribe(
              (res) => {
                self.showLazyLoader = false;
                self.keyForm.reset();
                if (!self.selectedBot.botKeys) {
                  self.selectedBot.botKeys = [];
                }
                res.isNew = true;
                res.isLatest = true;
                self.selectedBot.botKeys = [res, ...self.selectedBot.botKeys];
                setTimeout(() => {
                  self.selectedBot.botKeys.forEach((key) => {
                    key.isLatest = false;
                  });
                }, 10000);
              },
              (err) => {
                self.showLazyLoader = false;
                self.commonService.errorToast(
                  err,
                  'Oops, something went wrong. Please try again later.'
                );
              }
            );
        } else {
          self.keyForm.reset();
        }
      },
      (dismiss) => {
        self.keyForm.reset();
      }
    );
  }

  getColor(bot) {
    return bot.isActive ? '1CAD49' : '76CE91';
  }

  deleteUser(id?: string) {
    const self = this;
    const alertModal: any = {};
    alertModal.statusChange = false;
    alertModal.title = 'Delete Bot';
    alertModal.message =
      'Are you sure you want to delete <span class="text-delete font-weight-bold">' +
      self.selectedBot.basicDetails.name +
      '</span> bot?';
    alertModal._id = self.selectedBot._id;
    self.openDeleteBotModal.emit(alertModal);
  }

  closeDeleteBotModal(data) {
    const self = this;
    if (data) {
      self.showLazyLoader = true;
      self.subscriptions['removeUsers'] = self.commonService
        .put('user', `/${self.commonService.app._id}/user/utils/removeBots`, {
          userIds: [data._id],
        })
        .subscribe(
          () => {
            self.showLazyLoader = false;
            self.getBotRecords();
            self.getBotCount();
          },
          (err) => {
            self.showLazyLoader = false;
            self.commonService.errorToast(
              err,
              'Oops, something went wrong. Please try again later.'
            );
          }
        );
    }
  }

  createNewProperty() {
    const self = this;
    if (self.userAttributeList.length) {
      self.userAttributeList.forEach((element) => {
        let form = self.fb.group({
          key: ['', Validators.required],
          type: ['String', Validators.required],
          value: ['', Validators.required],
          label: ['', [Validators.required, Validators.maxLength(30)]],
        });
        form.patchValue(element);
        (self.additionalDetails.get('extraInfo') as FormArray).push(form);
      });
    } else {
      const form = self.fb.group({
        label: ['', [Validators.required, Validators.maxLength(30)]],
        key: ['', [Validators.required]],
        type: ['String', [Validators.required]],
        value: ['', [Validators.required]],
      });
      (self.additionalDetails.get('extraInfo') as FormArray).push(form);
    }
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
  }

  teamSearch(event) {
    const self = this;
    self.filterTeamStr = event;
  }

  resetTeams() {
    const self = this;
    self.filterTeamStr = '';
  }
  getAllTeams() {
    const self = this;
    self.teamOptions.filter = { users: { $ne: self.selectedBot._id } };
    self.teamOptions.filter.app = self.commonService.app._id;
    self.teamOptions.count = -1;
    self.showLazyLoader = true;

    self.subscriptions['allTeams'] = self.commonService
      .get('user', `/${self.commonService.app._id}/group/`, self.teamOptions)
      .subscribe(
        (_teams) => {
          self.showLazyLoader = false;
          self.allTeams = _teams;
          const index = self.allTeams.findIndex((e) => e.name === '#');
          if (index >= 0) {
            self.allTeams.splice(index, 1);
          }
          self.allTeams.forEach((_team) => {
            _team.teamSelected = false;
          });
        },
        (err) => {
          self.showLazyLoader = false;
          self.ts.error(err.error.message);
        }
      );
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
  // To Add additional information for user
  addNewDetail() {
    const self = this;
    const newData = self.fb.group({
      key: ['', [Validators.required, Validators.maxLength(30)]],
      type: ['String', [Validators.required]],
      value: ['', [Validators.required, Validators.maxLength(30)]],
      label: ['', [Validators.required, Validators.maxLength(30)]],
    });
    (self.additionalDetails.get('extraInfo') as FormArray).push(newData);
  }
  get userAttributes() {
    const self = this;
    return (self.additionalDetails.get('extraInfo') as FormArray).controls;
  }

  getLabelError(i) {
    const self = this;
    return (
      self.additionalDetails.get(['extraInfo', i, 'label']).touched &&
      !self.additionalDetails.get(['extraInfo', i, 'label']).pristine &&
      self.additionalDetails.get(['extraInfo', i, 'label']).hasError('required')
    );
  }

  getValError(i) {
    const self = this;
    return (
      self.additionalDetails.get(['extraInfo', i, 'value']).touched &&
      self.additionalDetails.get(['extraInfo', i, 'value']).hasError('required')
    );
  }

  setKey(i) {
    const self = this;
    const val = self.additionalDetails.get(['extraInfo', i, 'label']).value;
    self.additionalDetails
      .get(['extraInfo', i, 'key'])
      .patchValue(self.appService.toCamelCase(val));
  }

  newField(event) {
    const self = this;
    if (event.key === 'Enter') {
      self.addNewDetail();
    }
  }
  setUserAttributeType(type: any, index: number) {
    const self = this;
    self.additionalDetails
      .get(['extraInfo', index, 'type'])
      .patchValue(type.value);
    self.additionalDetails
      .get(['extraInfo', index, 'type'])
      .updateValueAndValidity();
    if (type.value === 'Boolean') {
      self.additionalDetails
        .get(['extraInfo', index, 'value'])
        .patchValue(false);
    } else {
      self.additionalDetails
        .get(['extraInfo', index, 'value'])
        .patchValue(null);
    }
    self.additionalDetails
      .get(['extraInfo', index, 'value'])
      .updateValueAndValidity();
  }

  private resetAdditionDetailForm() {
    const self = this;
    self.additionalDetails.reset();
    self.additionalDetails = self.fb.group({
      extraInfo: self.fb.array([]),
    });
  }
  addExtraDetails() {
    const self = this;
    let empty = false;
    self.userAttributes.forEach((control) => {
      const label = control.get('label').value;
      const val = control.get('value').value;
      empty = label === '' || val === '';
    });
    if (empty) {
      self.ts.warning(
        'Please check the form fields, looks like few fields are empty'
      );
    } else {
      self.newAttributeModalRef.close();
      self.selectedBot.attributes = {};
      self.userAttributes.forEach((data) => {
        const payload = data.value;
        const detailKey = payload.key;
        delete payload.key;

        self.selectedBot.attributes[detailKey] = payload;
      });
      self.showLazyLoader = true;

      self.commonService
        .put(
          'user',
          `/${this.commonService.app._id}/bot/${self.selectedBot._id}`,
          self.selectedBot
        )
        .subscribe(
          () => {
            self.showLazyLoader = false;
            self.ts.success('Added custom Details successfully');
            self.resetAdditionDetailForm();
            self.getBotRecords();
          },
          (err) => {
            self.showLazyLoader = false;
            self.ts.error(err.error.message);
            self.resetAdditionDetailForm();
          }
        );
    }
  }
  get userAttributeList() {
    const self = this;
    const arr = [];
    if (self.selectedBot && self.selectedBot.attributes) {
      Object.keys(self.selectedBot.attributes).forEach((key) => {
        arr.push({
          key,
          label: self.selectedBot.attributes[key].label,
          value: self.selectedBot.attributes[key].value,
          type: self.selectedBot.attributes[key].type,
        });
      });
    }
    return arr;
  }
  removeField(index) {
    const self = this;
    (self.additionalDetails.get('extraInfo') as FormArray).removeAt(index);
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
            team.users.push(self.selectedBot._id);
            teamIds.push(team._id);
          });
          self.showLazyLoader = true;
          self.commonService
            .put(
              'user',
              `/${this.commonService.app._id}/user/utils/addToGroups/${self.selectedBot._id}`,
              { groups: teamIds }
            )
            .subscribe(
              () => {
                self.showLazyLoader = false;
                self.getUserTeam();
                self.ts.success('Bot has been added to group successfully');
              },
              (err) => {
                self.ts.error(err.error.message);
              }
            );
        }
      },
      (dismiss) => { }
    );
  }
  getUserTeam() {
    const self = this;
    self.userGroupConfig.filter.users = self.selectedBot._id;
    self.userGroupConfig.count = -1;
    self.showLazyLoader = true;

    self.subscriptions['userTeams'] = self.commonService
      .get(
        'user',
        `/${self.commonService.app._id}/group/`,
        self.userGroupConfig
      )
      .subscribe(
        (_teams) => {
          self.showLazyLoader = false;
          self.userTeams = _teams;
          const index = self.userTeams.findIndex((e) => e.name === '#');
          if (index >= 0) {
            self.userTeams.splice(index, 1);
          }
        },
        (err) => {
          self.showLazyLoader = false;
          self.ts.error(err.error.message);
        }
      );
  }
  onDataChange(event) {
    const self = this;
    this.selectRecord(event)
  }
  onDataChangeInGroup(event) {
    const self = this;
    self.getUserTeam();
  }
  toggleStatus(event) {
    const self = this;
    self.showLazyLoader = true;
    self.commonService
      .put(
        'user',
        `/${self.commonService.app._id}/bot/utils/status/${self.selectedBot._id
        }/${self.selectedBot.isActive ? 'disable' : 'enable'}?app=${this.commonService.app._id
        }`
      )
      .subscribe(
        (res) => {
          self.selectedBot = res;
          const index = self.botRecords.findIndex((e) => e._id === res._id);
          self.botRecords[index] = res;
          self.showLazyLoader = false;
          self.ts.success(
            `The ${res?.basicDetails?.name || ''} bot is ${res?.isActive ? 'enabled' : 'disabled'
            }.`
          );
        },
        (err) => {
          self.ts.error(err.error.message);
          self.showLazyLoader = false;
        }
      );
  }
  getUserAttributeValue(index: number) {
    const self = this;
    return self.additionalDetails.get(['extraInfo', index, 'value']).value;
  }
  setUserAttributeValue(val: boolean, index: number) {
    const self = this;
    self.additionalDetails.get(['extraInfo', index, 'value']).patchValue(val);
  }
  hasPermission(type: string): boolean {
    const self = this;
    return self.commonService.hasPermission(type);
  }
  copyId() {
    const self = this;
    self.appService.copyToClipboard(self.selectedBot._id);
    self.ts.success('Id copied successfully');
  }
  onFocus(event: Event) {
    const self = this;
    self.slideState = 'focus';
  }
  onBlur(event: Event) {
    const self = this;
    self.slideState = 'blur';
  }

  onDaysChange(evnt) {
    const self = this;
    self.isInvalidDate = false;
    const time = new Date().getTime();
    const expiryDate = new Date(time + evnt * 60000);
    if (expiryDate.toDateString() === 'Invalid Date') {
      self.isInvalidDate = true;
    }
  }
  get manageGroup() {
    const self = this;
    return self.commonService.hasPermission('PMBG');
  }

  get viewGroup() {
    const self = this;
    return self.commonService.hasPermission('PVBG');
  }

  closeBotModals() {
    const self = this;
    if (self.botForm.invalid) {
      return;
    }
    if (self.newBotModalRef) {
      self.newBotModalRef.close(true);
    } else if (self.editBotModalRef) {
      self.editBotModalRef.close(true);
    }
  }

  switchTab(tab) {
    this.isDataLoading = true;
    this.currentTab = tab;
    this.isDataLoading = false;
  }

  enterToSelect(event, currentTab) {
    if (currentTab === 'Key') {
      if (event === 'reset') {
        this.searchTerm = '';
        this.selectRecord['botkeys'] = this.ogKeys;
        this.selectedBot = {};
        this.selectRecord(this.selectedBot);
      } else {
        const self = this;
        if (self.searchTerm) {
          const returnedData = self.filter.transform(
            self.selectedBot.botKeys,
            self.searchTerm
          );
          this.selectRecord['botkeys'] = returnedData;
        }
      }
    }
  }

  showSearch() {
    return this.ogKeys?.length > 0
  }

  add(tab) {

  }
  closeWindow() {
    this.isCreate = false;
  }
}
