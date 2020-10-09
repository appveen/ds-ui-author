import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, EventEmitter, } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { GetOptions, CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-nano-service-listing',
  templateUrl: './nano-service-listing.component.html',
  styleUrls: ['./nano-service-listing.component.scss']
})
export class NanoServiceListingComponent implements OnInit, OnDestroy {

  @ViewChild('newNanoServiceModal', { static: false }) newNanoServiceModal: TemplateRef<HTMLElement>;
  form: FormGroup;
  app: string;
  nanoServiceList: Array<any> = [];
  apiConfig: GetOptions;
  alertModal: {
    statusChange?: boolean;
    title: string;
    message: string;
    index: number;
  };
  showLazyLoader = true;
  changeAppSubscription: any;
  subscriptions: any = {};
  showAddButton: boolean;
  showMoreOptions: any;
  openDeleteModal: EventEmitter<any>;
  newNanoServiceModalRef: NgbModalRef;
  constructor(public commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private ts: ToastrService,
    private fb: FormBuilder) {
    const self = this;
    self.alertModal = {
      statusChange: false,
      title: '',
      message: '',
      index: -1
    };
    self.showMoreOptions = {};
    self.form = self.fb.group({
      name: [null, [Validators.required, Validators.maxLength(40), Validators.pattern(/\w+/)]],
      description: [null, [Validators.maxLength(240), Validators.pattern(/\w+/)]]
    });
    self.openDeleteModal = new EventEmitter();
    self.apiConfig = {
      page: 1,
      count: 30
    };
  }
  ngOnInit() {
    const self = this;
    self.app = self.commonService.app._id;
    self.showLazyLoader = true;
    self.getNanoServices();
    self.commonService.apiCalls.componentLoading = false;

    self.changeAppSubscription = self.commonService.appChange.subscribe(_app => {
      self.app = self.commonService.app._id;
      self.showLazyLoader = true;
      self.commonService.apiCalls.componentLoading = false;
      self.nanoServiceList = [];
      self.getNanoServices();
    });
  }

  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach(e => {
      self.subscriptions[e].unsubscribe();
    });
    if (self.newNanoServiceModalRef) {
      self.newNanoServiceModalRef.close();
    }
  }

  newNanoService() {
    const self = this;
    self.newNanoServiceModalRef = self.commonService.modal(self.newNanoServiceModal, { size: 'sm' });
    self.newNanoServiceModalRef.result.then(close => {
      if (close && self.form.valid) {
        self.triggerNanoServiceCreate();
      }
      self.form.reset();
    }, dismiss => {
      self.form.reset();
    });
  }

  triggerNanoServiceCreate() {
    const self = this;
    const payload = self.form.value;
    payload.app = self.commonService.app._id;
    self.commonService.post('partnerManager', '/nanoService', payload).subscribe(res => {
      self.ts.success('Nano Service Created.');
      self.appService.edit = res._id;
      self.router.navigate(['/app/', self.commonService.app._id, 'nsm', res._id]);
    }, err => {
      self.commonService.errorToast(err);
    });
  }

  editNanoService(index: number) {
    const self = this;
    self.appService.edit = self.nanoServiceList[index]._id;
    self.router.navigate(['/app/', self.commonService.app._id, 'nsm', self.appService.edit]);
  }
  viewNanoService(index) {
    const self = this;
    self.router.navigate(['/app/', self.commonService.app._id, 'nsm', self.nanoServiceList[index]._id]);
  }

  loadMore(event) {
    const self = this;
    if (event.target.scrollTop >= 244) {
      self.showAddButton = true;
    } else {
      self.showAddButton = false;
    }
    if (event.target.scrollTop + event.target.offsetHeight === event.target.children[0].offsetHeight) {
      self.apiConfig.page = self.apiConfig.page + 1;
      self.getNanoServices();
    }
  }

  getNanoServices() {
    const self = this;
    if (self.subscriptions['getNanoServices']) {
      self.subscriptions['getNanoServices'].unsubscribe();
    }
    self.showLazyLoader = true;
    self.subscriptions['getNanoServices'] = self.commonService.get('partnerManager', '/nanoService', self.apiConfig)
      .subscribe(res => {
        self.showLazyLoader = false;
        if (res.length > 0) {
          res.forEach(_item => {
            self.fetchFlowsInUse(_item);
            self.nanoServiceList.push(_item);
          });
        }
      }, err => {
        self.showLazyLoader = false;
        self.commonService.errorToast(err, 'We are unable to fetch nano service, please try again later');
      });
  }

  deleteNanoService(index: number) {
    const self = this;
    self.alertModal.statusChange = false;
    self.alertModal.title = 'Delete Nano Service?';
    self.alertModal.message = 'Are you sure you want to delete <span class="text-delete font-weight-bold">'
      + self.nanoServiceList[index].name + '</span> Nano Service?';
    self.alertModal.index = index;
    self.openDeleteModal.emit(self.alertModal);
  }

  closeDeleteModal(data) {
    const self = this;
    if (data) {
      self.showLazyLoader = true;
      self.subscriptions['deleteNanoServices'] = self.commonService
        .delete('partnerManager', '/nanoService/' + self.nanoServiceList[data.index]._id).subscribe(_d => {
          self.showLazyLoader = false;
          self.ts.info(_d.message ? _d.message : 'Nano Service deleted Successfully');
          self.clearSearch();
        }, err => {
          self.showLazyLoader = false;
          self.commonService.errorToast(err, 'Oops, something went wrong. Please try again later.');
        });
    }
  }

  search(searchTerm: string) {
    const self = this;
    self.apiConfig.filter = {
      'name': '/' + searchTerm + '/'
    };
    self.apiConfig.page = 1;
    self.nanoServiceList = [];
    self.getNanoServices();
  }

  clearSearch() {
    const self = this;
    self.apiConfig.filter = null;
    self.apiConfig.page = 1;
    self.nanoServiceList = [];
    self.getNanoServices();
  }
  

  canManageNanoService(id: string) {
    const self = this;
    const list1 = self.commonService.getEntityPermissions('NS_' + id);
    const list2 = self.commonService.getEntityPermissions('NS');
    if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      if (list1.length === 0 && list2.find(e => e.id.substr(0, 4) === 'PMNS'
        && e.id !== 'PMNSBC'
        && e.id !== 'PMNSBD')) {
        return true;
      } else if (list1.length > 0 && list1.find(e => e.id.substr(0, 4) === 'PMNS'
        && e.id !== 'PMNSBC'
        && e.id !== 'PMNSBD')) {
        return true;
      } else {
        return false;
      }
    }
  }
  canDeleteNanoService(id: string) {
    const self = this;
    const list = self.commonService.getEntityPermissions('PM_' + id);
    if (list.length === 0 && self.hasPermission('PMPBD')) {
      return true;
    } else if (list.length > 0 && list.find(e => e.id === 'PMPBD')) {
      return true;
    } else {
      return false;
    }
  }

  hasPermission(type: string, entity?: string) {
    const self = this;
    return self.commonService.hasPermission(type, entity);
  }
  hasWritePermission(entity: string) {
    const self = this;
    return self.commonService.hasPermission('PMNSBC', entity);
  }

  fetchFlowsInUse(flow: any) {
    const self = this;
    self.commonService.get('partnerManager', '/flow/', {
      select: 'name',
      count: 4,
      filter: {
        nanoService: flow._id
      }
    }).subscribe(res => {
      flow.flows = res;
    }, err => {
      flow.flows = [];
    });
  }

  getFlowInfo(flows: Array<any>) {
    if (!flows || flows.length === 0) {
      return '<span class="text-muted">Not in use</span>';
    } else {
      if (flows.length > 3) {
        return `<span class="text-dark">${flows.map(e => e.name).splice(0, 3).join(', ')}</span>&nbsp;
        <span class="text-accent">+ more</span>`;
      } else {
        return `<span class="text-dark">${flows.map(e => e.name).join(', ')}</span>`;
      }
    }
  }
  hasPermissionForNanoService(id: string) {
    const self = this;
    if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      const list = self.commonService.getEntityPermissions('NS_' + id);
      if (list.length > 0 && list.find(e => e.id.startsWith('PMNS') || e.id.startsWith('PVNS'))) {
        return true;
      } else if (list.length === 0
          && (self.commonService.hasPermissionStartsWith('PMNS', 'NS')
              || self.commonService.hasPermissionStartsWith('PVNS', 'NS'))) {
        return true;
      } else {
        return false;
      }
    }
  }
}
