import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  EventEmitter,
} from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormBuilder, UntypedFormArray } from '@angular/forms';
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
import { ManageBotGroupComponent } from './manage-bot-group/manage-bot-group.component';
import { ManageBotKeyComponent } from './manage-bot-key/manage-bot-key.component';
import { ManageBotPropertyComponent } from './manage-bot-property/manage-bot-property.component';
import { filter } from 'rxjs/operators';
import { Breadcrumb } from '../../utils/interfaces/breadcrumb';


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
  @ViewChild('manageGroups') manageGroups: ManageBotGroupComponent;
  @ViewChild('manageKeys') manageKeys: ManageBotKeyComponent;
  @ViewChild('manageProperty') manageProperty: ManageBotPropertyComponent;
  @ViewChild('editAttributeModal', { static: false })
  editAttributeModal: TemplateRef<HTMLElement>;
  botRecords: Array<any>;
  botForm: UntypedFormGroup;
  keyForm: UntypedFormGroup;
  attributeForm: UntypedFormGroup;
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
  additionalDetails: UntypedFormGroup;
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
  addNewKey: boolean;
  addNewProperty: boolean;
  isLoading: boolean = false;
  isDataLoading: boolean = false;
  currentTab: string;
  ogKeys: any[];
  expiryOptions: Array<any> = [{ label: 'Days', value: 'days' }, { label: 'months', value: 'months' }, { label: 'years', value: 'years' }];
  editMode: boolean = false;
  keyId: string;
  isLatest: boolean = false;
  breadcrumbPaths: Array<Breadcrumb>;


  constructor(
    public commonService: CommonService,
    public appService: AppService,
    private router: Router,
    private ts: ToastrService,
    private fb: UntypedFormBuilder,
    private filterTerm: FilterPipe
  ) {
    const self = this;
    this.breadcrumbPaths = [];
    self.botRecords = [];
    self.selectedBot = {};
    self.openDeleteModal = new EventEmitter();
    self.openDeleteBotModal = new EventEmitter();
    self.userGroupConfig.filter = {};
    self.selectedGroups = [];
    self.slideState = 'blur';
    self.types = [
      { class: 'dsi-text', value: 'String', label: 'Text' },
      { class: 'dsi-number', value: 'Number', label: 'Number' },
      { class: 'dsi-boolean', value: 'Boolean', label: 'True/False' },
      { class: 'dsi-date', value: 'Date', label: 'Date' },
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
      period: [null]
    });
    self.attributeForm = self.fb.group({
      key: ['', Validators.required],
      type: ['String', Validators.required],
      value: ['', Validators.required],
      label: ['', [Validators.required, Validators.maxLength(30)]],
    });
    this.attributeForm
      .get('label')
      .valueChanges.pipe(filter(() => !this.editMode))
      .subscribe((val: any) => {
        this.attributeForm
          .get('key')
          .patchValue(this.appService.toCamelCase(val));
      });

  }

  ngOnInit() {
    const self = this;
    this.breadcrumbPaths.push({
      active: true,
      label: 'Bots',
    });
    this.commonService.changeBreadcrumb(this.breadcrumbPaths)
    self.getBotRecords();
    self.getBotCount();
    this.keyForm.get('expires').valueChanges.subscribe((value) => {
      self.onDaysChange(value);
    });
    this.currentTab = 'Keys'
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
    self.getAllTeams();
    self.getUserTeam();
  }
  editBot() {
    const self = this;
    self.showLazyLoader = true;
    self.isCreate = false;
    self.botForm.get('botName').patchValue(self.selectedBot.basicDetails.name);
    self.editBotModalRef = self.commonService.modal(self.newBotModal, {
      size: 'sm',
    });
    self.editBotModalRef.result.then(
      (close) => {
        if (close) {
          self.selectedBot.basicDetails.name =
            self.botForm.get('botName').value;

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

  createKey() {
    this.keyForm.reset()
    this.addNewKey = true;
  }
  createBotKey() {
    const self = this;
    this.keyForm.markAllAsTouched()
    this.keyForm.dirty;
    if (self.keyForm.invalid || this.isInvalidDate) {
      return;
    }
    const payload = self.keyForm.value;
    if (payload.period == 'days') {
      payload.expires = payload.expires * 1440
    }
    if (payload.period == 'months') {
      payload.expires = payload.expires * 30 * 1440
    }
    if (payload.period == 'years') {
      payload.expires = payload.expires * 365 * 1440
    }

    if (this.editMode) {
      payload['keyId'] = this.keyId
    }
    self.showLazyLoader = true;

    const call = this.editMode ? self.commonService.put('user', `/${this.commonService.app._id}/bot/utils/botKey/${self.selectedBot._id}`, payload) : self.commonService
      .post(
        'user',
        `/${self.commonService.app._id}/bot/utils/botKey/${self.selectedBot._id}`,
        payload
      )

    call
      .subscribe(
        (res) => {
          self.showLazyLoader = false;
          this.addNewKey = false;
          self.keyForm.reset();
          if (this.editMode) {
            self.selectedBot.botKeys = res.botKeys
          }
          else {
            if (!self.selectedBot.botKeys) {
              self.selectedBot.botKeys = [];
            }
            res.isNew = true;
            res.isLatest = true;
            this.isLatest = true;
            self.selectedBot.botKeys = [res, ...self.selectedBot.botKeys];
          }

          setTimeout(() => {
            self.selectedBot.botKeys.forEach((key) => {
              key.isLatest = false;
            });
            this.editMode = false
            this.addNewKey = false

          }, 10000);
        }, err => {
          self.commonService.errorToast(
            err,
            err.message
          );
          this.showLazyLoader = false;
        })
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

  onAttributeFormTypeChange(type: any) {
    this.attributeForm.get('type').setValue(type);
    this.attributeForm
      .get('value')
      .setValue(type === 'Boolean' ? false : null);
  }


  addProperty() {
    if (this.attributeForm.valid) {
      const { key, ...rest } = this.attributeForm.value;
      if (!this.selectedBot.attributes) {
        this.selectedBot['attributes'] = {}
      }
      this.showLazyLoader = true;
      this.selectedBot.attributes[key] = this.appService.cloneObject(rest);
      this.commonService
        .put(
          'user',
          `/${this.commonService.app._id}/user/${this.selectedBot._id}`,
          this.selectedBot
        )
        .subscribe(
          (res) => {

            this.selectedBot.attributes = res.attributes
            this.addNewProperty = false;
            this.attributeForm.reset()
            this.editMode = false
            this.showLazyLoader = false;
            this.ts.success('Custom Details Saved Successfully');
          },
          (err) => {
            this.ts.error(err.error.message);
          }
        );
    }
  }

  setUserAttributeValue(val) {
    this.attributeForm.get('value').patchValue(val);
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
    (self.additionalDetails.get('extraInfo') as UntypedFormArray).push(newData);
  }
  get userAttributes() {
    const self = this;
    return (self.additionalDetails.get('extraInfo') as UntypedFormArray).controls;
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
    (self.additionalDetails.get('extraInfo') as UntypedFormArray).removeAt(index);
  }
  assignTeam() {
    const self = this;
    // self.getAllTeams();
    self.getUserTeam();
  }
  getUserTeam() {
    const self = this;
    self.showLazyLoader = true;
    self.userGroupConfig.filter.users = self.selectedBot._id;
    self.userGroupConfig.count = -1;
    self.userTeams=[];
    self.subscriptions['userTeams'] = self.commonService
      .get(
        'user',
        `/${self.commonService.app._id}/group/`,
        self.userGroupConfig
      )
      .subscribe(
        (_teams) => {
          _teams.forEach(item => {
            const authorPermissions = item.roles.filter(e => e.id.match(/^[A-Z]{2,}$/));
            item.hasAuthorRoles = authorPermissions.length > 0;
            item.hasAppcenterRoles = authorPermissions.length != item.roles.length;
            this.userTeams.push(item);
            const index = this.userTeams.findIndex(e => e.name === '#');
            if (index >= 0) {
              this.userTeams.splice(index, 1);
            }
          })
          this.showLazyLoader = false;
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

  // closeBotModals() {
  //   const self = this;
  //   if (self.botForm.invalid) {
  //     return;
  //   }
  //   if (self.newBotModalRef) {
  //     self.newBotModalRef.close(true);
  //   } else if (self.editBotModalRef) {
  //     self.editBotModalRef.close(true);
  //   }
  // }

  switchTab(tab) {
    this.isDataLoading = true;
    this.currentTab = tab;
    this.isDataLoading = false;
  }

  enterToSelect(event, currentTab) {
    this.searchTerm = event
    // if (currentTab === 'Keys') {
    //   if (event === 'reset') {
    //     this.searchTerm = '';
    //     this.selectRecord['botkeys'] = this.ogKeys;
    //     this.selectedBot = {};
    //     this.selectRecord(this.selectedBot);
    //   } else {
    //     const self = this;
    //     if (self.searchTerm) {
    //       const returnedData = self.filterTerm.transform(
    //         self.selectedBot.botKeys,
    //         self.searchTerm
    //       );
    //       this.selectRecord['botkeys'] = returnedData;
    //     }
    //   }
    // }
  }


  showSearch() {
    return this.ogKeys?.length > 0
  }

  add(tab) {
    if (tab === 'Groups') {
      this.manageGroups.openGroupModal()
    }
    if (tab === 'Keys') {
      this.keyForm.reset();
      this.keyForm.get('period').setValue('days')

      this.addNewKey = true;
    }
    if (tab === 'Properties') {
      this.attributeForm.reset();
      this.addNewProperty = true;
    }
  }
  closeWindow() {
    this.isCreate = false;
    this.addNewKey = false;
    this.addNewProperty = false;
  }

  periodChange(event) {
    this.attributeForm.get('period').setValue(event);
  }

  editAttribute(data) {
    this.attributeForm.setValue(data);
    this.editMode = true
    this.addNewProperty = true;
  }

  editKey(data) {
    this.keyForm.get('label').patchValue(data.label)
    this.keyForm.get('period').patchValue('days')
    this.keyForm.get('expires').patchValue(data.expires / 1440)
    this.editMode = true
    this.keyId = data._id;
    this.addNewKey = true;
  }

  // externalFilterChanged(event){
  //   this.searchTerm = event
  // }
}
