import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  TemplateRef,
  EventEmitter,
  Input,
} from '@angular/core';
import {
  trigger,
  style,
  transition,
  animate,
  query,
  stagger,
  group,
} from '@angular/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { App } from 'src/app/utils/interfaces/app';
import {
  CommonService,
  GetOptions,
} from 'src/app/utils/services/common.service';
import { FilterPipe } from 'src/app/utils/pipes/filter.pipe';
import { AppService } from 'src/app/utils/services/app.service';
import { UserDetails } from '../../definitions/userDetails';
import * as _ from 'lodash';

@Component({
  selector: 'odp-app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.scss'],
  animations: [
    trigger('listItems', [
      transition('* => *', [
        group([
          query('.app-card', [
            style({ transform: 'scale(0)' }),
            animate('200ms ease-in', style({ transform: 'scale(1)' })),
          ]),
          query(
            ':enter',
            [
              style({ transform: 'scale(0)' }),
              stagger('50ms ease-in', [
                animate('200ms ease-in', style({ transform: 'scale(1)' })),
              ]),
            ],
            { optional: true }
          ),
        ]),
        query(
          ':leave',
          [
            stagger('50ms', [
              animate('200ms ease-out', style({ transform: 'scale(0)' })),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
  providers: [FilterPipe],
})
export class AppListComponent implements OnInit, OnDestroy {
  @ViewChild('newAppModal', { static: false })
  newAppModal: TemplateRef<HTMLElement>;
  @Input() isHome: boolean = false;
  subscriptions: any;
  appList: Array<App>;
  apiConfig: GetOptions;
  errorMessage: string;
  newAppModalRef: NgbModalRef;
  createAppLoader: boolean;
  searchTerm: string;
  deleteModalRef: NgbModalRef;
  appIndex = -1;
  appOptions: any;
  openDeleteModal: EventEmitter<any>;
  alertModal: {
    statusChange?: boolean;
    title: string;
    message: string;
    _id: string;
    appIndex?: string;
  };
  showLazyLoader: boolean;
  form: FormGroup;
  timezones: Array<any>;
  userDetails: UserDetails;
  isSuperadmin: boolean;
  constructor(
    private commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private fb: FormBuilder,
    private ts: ToastrService,
    private appFilter: FilterPipe
  ) {
    const self = this;
    self.subscriptions = {};
    self.appList = [];
    self.apiConfig = {};
    self.searchTerm = '';
    self.openDeleteModal = new EventEmitter();
    self.alertModal = {
      statusChange: false,
      title: '',
      message: '',
      _id: null,
    };
    self.form = self.fb.group({
      _id: [
        null,
        [
          Validators.required,
          Validators.maxLength(40),
          Validators.pattern('[a-zA-z0-9_-]+'),
        ],
      ],
      defaultTimezone: this.commonService.userDetails?.defaultTimezone
        ? [this.commonService.userDetails.defaultTimezone]
        : [JSON.parse(localStorage.getItem('ba-user')).defaultTimezone],
      description: [null],
      serviceVersionValidity: self.fb.group({
        validityType: ['count', [Validators.required]],
        validityValue: [-1, [Validators.required]],
      }),
    });
    this.timezones = this.appService.getTimezones();
  }

  ngOnInit() {
    const self = this;
    self.appOptions = {};
    self.apiConfig.count = -1;
    self.apiConfig.select = 'name logo.thumbnail';
    self.apiConfig.noApp = true;
    self.apiConfig.sort = '_id';
    self.isSuperadmin =
      self.commonService.userDetails?.isSuperAdmin ||
      JSON.parse(localStorage.getItem('ba-user')).isSuperAdmin;
    self.isSuperadmin ? self.getApps() : self.getUserApps();
  }

  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach((e) => {
      self.subscriptions[e].unsubscribe();
    });
    if (self.newAppModalRef) {
      self.newAppModalRef.close();
    }
  }

  getApps() {
    const self = this;
    self.commonService.get('user', '/admin/app', self.apiConfig).subscribe(
      (res) => {
        self.appList = [];
        self.commonService.appList = [];
        res.forEach((item) => {
          item.firstLetter = item._id.charAt(0);
          item.bg = this.appColor();
          if (_.isEmpty(item.logo)) {
            delete item.logo;
          }
          self.appList.push(item);
          self.commonService.appList.push(item);
        });
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getUserApps() {
    const self = this;
    self.commonService.get('user', '/data/app', self.apiConfig).subscribe(
      (res) => {
        self.appList = [];
        self.commonService.appList = [];
        res.forEach((item) => {
          item.firstLetter = item._id.charAt(0);
          item.bg = this.appColor();
          if (_.isEmpty(item.logo)) {
            delete item.logo;
          }
          self.appList.push(item);
          self.commonService.appList.push(item);
        });
        if (self.appList.length === 1) {
          this.useApp(self.appList[0]._id);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  newApp() {
    const self = this;
    self.newAppModalRef = self.commonService.modal(self.newAppModal);
    self.newAppModalRef.result.then(
      (close) => {
        self.errorMessage = null;
        self.form.reset({
          type: 'Management',
          serviceVersionValidity: {
            validityType: 'count',
            validityValue: -1,
          },
        });
      },
      (dismiss) => {
        self.errorMessage = null;
        self.form.reset({
          type: 'Management',
          serviceVersionValidity: {
            validityType: 'count',
            validityValue: -1,
          },
        });
      }
    );
  }

  createApp() {
    const self = this;
    const payload: App = self.form.value;
    self.errorMessage = null;
    self.createAppLoader = true;
    self.showLazyLoader = true;
    self.commonService.post('user', '/admin/app', payload).subscribe(
      (res) => {
        self.createAppLoader = false;
        self.newAppModalRef.close();
        self.commonService.appList.push(res);
        self.showLazyLoader = false;
        self.router.navigate(['/app', res._id, 'sm']);
      },
      (err) => {
        self.showLazyLoader = false;
        self.createAppLoader = false;
        self.errorMessage = err.error.message;
      }
    );
  }

  useApp(name: string) {
    const self = this;
    self.commonService.app = self.appList.find((e) => e._id === name);
    self.commonService.saveLastActiveApp();
    self.router.navigate(['/app', name]);
  }

  deleteApp(app: any, appIndex) {
    const self = this;
    self.alertModal.statusChange = false;
    self.alertModal.title = 'Delete App';
    self.alertModal.message =
      'Are you sure you want to delete app <span class="text-delete font-weight-bold">' +
      app._id +
      '</span>? This action will delete the entire app including all the data services within it. This action is undoable.';
    self.alertModal._id = app._id;
    self.alertModal.appIndex = appIndex;
    self.openDeleteModal.emit(self.alertModal);
  }

  closeDeleteModal(data) {
    const self = this;
    if (data) {
      const url = '/admin/app/' + data._id;
      self.showLazyLoader = true;
      self.subscriptions['deleteApp'] = self.commonService
        .delete('user', url)
        .subscribe(
          (d) => {
            self.showLazyLoader = false;
            self.ts.success('App deleted successfully');
            self.appOptions[data.appIndex] = false;
            self.getApps();
          },
          (err) => {
            self.showLazyLoader = false;
            self.commonService.errorToast(
              err,
              'Unable to delete, please try again later'
            );
          }
        );
    }
  }

  enterToSelect(event: KeyboardEvent) {
    const self = this;
    if (self.searchTerm) {
      const returnedApps = self.appFilter.transform(
        self.appList,
        self.searchTerm
      );
      if (returnedApps.length > 0) {
        self.useApp(returnedApps[0]._id);
      }
    } else if (self.appList.length > 0) {
      self.useApp(self.appList[0]._id);
    }
  }

  get dummyRows() {
    const self = this;
    const arr = new Array(12);
    arr.fill(1);
    return arr;
  }

  getText(app) {
    console.log(app);
    return app.firstLetter;
  }

  appColor() {
    const colorArray = [
      '#5CA469',
      '#3466A1',
      '#A64A46',
      '#D0A051',
      '#959A91',
      '#E76779',
    ];
    return _.sample(colorArray);
  }
}
