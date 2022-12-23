import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, EventEmitter } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { AppService } from 'src/app/utils/services/app.service';
import { GetOptions, CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-partner-listing',
  templateUrl: './partner-listing.component.html',
  styleUrls: ['./partner-listing.component.scss']
})
export class PartnerListingComponent implements OnInit, OnDestroy {

  @ViewChild('newPartnerModal', { static: false }) newPartnerModal: TemplateRef<HTMLElement>;
  form: UntypedFormGroup;
  app: string;
  partnerList: Array<any> = [];
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
  newPartnerModalRef: NgbModalRef;
  openDeleteModal: EventEmitter<any>;
  internal: false;
  constructor(public commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private ts: ToastrService,
    private fb: UntypedFormBuilder) {
    const self = this;
    self.alertModal = {
      statusChange: false,
      title: '',
      message: '',
      index: -1
    };
    self.showMoreOptions = {};
    self.form = self.fb.group({
      name: [null, [Validators.required, Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9\\s-_]+')]],
      description: [null, [Validators.maxLength(240)]]
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
    self.getPartners();
    self.commonService.apiCalls.componentLoading = false;

    self.changeAppSubscription = self.commonService.appChange.subscribe(_app => {
      self.app = self.commonService.app._id;
      self.showLazyLoader = true;
      self.commonService.apiCalls.componentLoading = false;
      self.partnerList = [];
      self.getPartners();
    });
  }

  hasPermissionForPartner(id: string) {
    const self = this;
    if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      const list = self.commonService.getEntityPermissions('PM_' + id);
      if (list.length > 0 && list.find(e => e.id.startsWith('PMP') || e.id.startsWith('PVP'))) {
        return true;
      } else if (list.length === 0
        && (self.commonService.hasPermissionStartsWith('PMP', 'PM')
          || self.commonService.hasPermissionStartsWith('PVP', 'PM'))) {
        return true;
      } else {
        return false;
      }
    }
  }

  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach(e => {
      self.subscriptions[e].unsubscribe();
    });
    if (self.newPartnerModalRef) {
      self.newPartnerModalRef.close();
    }
  }

  newPartner() {
    const self = this;
    self.newPartnerModalRef = self.commonService.modal(self.newPartnerModal, { size: 'sm' });
    self.newPartnerModalRef.result.then(close => {
      if (close) {
        const payload = self.form.value;
        payload.app = self.commonService.app._id;
        payload.internal = self.internal;
        self.showLazyLoader = true;
        self.subscriptions['newPartner'] = self.commonService.post('partnerManager', '/partner', payload).subscribe(res => {
          self.form.reset();
          self.showLazyLoader = false;
          self.router.navigate(['/app', self.commonService.app._id, 'po', res._id]);
        }, err => {
          self.form.reset();
          self.showLazyLoader = false;
          self.commonService.errorToast(err, 'Oops, something went wrong. Please try again later.');
        });
      } else {
        self.form.reset();
      }
    }, dismiss => {
      self.form.reset();
    });
  }

  viewPartner(index: number) {
    const self = this;
    self.router.navigate(['/app/', self.commonService.app._id, 'po', self.partnerList[index]._id]);
  }

  editPartner(index: number) {
    const self = this;
    self.appService.editServiceId = self.partnerList[index]._id;
    self.router.navigate(['/app/', self.commonService.app._id, 'po', self.appService.editServiceId]);
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
      self.getPartners();
    }
  }

  getPartners() {
    const self = this;
    if (self.subscriptions['getPartners']) {
      self.subscriptions['getPartners'].unsubscribe();
    }
    self.showLazyLoader = true;
    self.subscriptions['getPartners'] = self.commonService.get('partnerManager', '/partner', self.apiConfig)
      .subscribe(res => {
        self.showLazyLoader = false;
        if (res.length > 0) {
          res.forEach(_service => {
            self.partnerList.push(_service);
          });
        }
      }, err => {
        self.showLazyLoader = false;
        self.commonService.errorToast(err, 'We are unable to fetch partners, please try again later');
      });
  }

  deletePartner(index: number) {
    const self = this;
    self.alertModal.statusChange = false;
    self.alertModal.title = 'Delete Partner';
    self.alertModal.message = `Are you sure you want to delete this partner?
    This action will delete the integration flows and profiles for
    <span class="text-delete font-weight-bold">${self.partnerList[index].name}</span>. It is highly
    recommended that you take a backup of your data before doing this, as the delete cannot be be undone.`;
    self.alertModal.index = index;
    self.openDeleteModal.emit(self.alertModal);
  }

  closeDeleteModal(data) {
    const self = this;
    if (data) {
      self.showLazyLoader = true;
      self.subscriptions['deletePartner'] = self.commonService
        .delete('partnerManager', '/partner/' + self.partnerList[data.index]._id).subscribe(_d => {
          self.showLazyLoader = false;
          self.showMoreOptions[data.index] = false;
          self.ts.info(_d.message ? _d.message : 'Partner deleted Successfully');
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
      name: '/' + searchTerm + '/'
    };
    self.apiConfig.page = 1;
    self.partnerList = [];
    self.getPartners();
  }

  clearSearch() {
    const self = this;
    self.apiConfig.filter = null;
    self.apiConfig.page = 1;
    self.partnerList = [];
    self.getPartners();
  }

  hasPermission(type: string, entity?: string) {
    const self = this;
    return self.commonService.hasPermission(type, entity);
  }

  hasPermissionStartsWith(type: string, entity?: string) {
    const self = this;
    return self.commonService.hasPermissionStartsWith(type, entity);
  }

  canViewPartner(id: string) {
    const self = this;
    const list = self.commonService.getEntityPermissions('PM_' + id);
    if (list.length === 0 && (self.hasPermissionStartsWith('PVP') || self.canEditPartner(id))) {
      return true;
    } else if (list.length > 0 && (list.find(e => e.id.substr(0, 3) === 'PVP') || self.canEditPartner(id))) {
      return true;
    } else {
      return false;
    }
  }

  canEditPartner(id: string) {
    const self = this;
    const list1 = self.commonService.getEntityPermissions('PM_' + id);
    const list2 = self.commonService.getEntityPermissions('PM');
    if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      if (list1.length === 0 && list2.find(e => e.id.substr(0, 3) === 'PMP'
        && e.id !== 'PMPBC'
        && e.id !== 'PMPBD')) {
        return true;
      } else if (list1.length > 0 && list1.find(e => e.id.substr(0, 3) === 'PMP'
        && e.id !== 'PMPBC'
        && e.id !== 'PMPBD')) {
        return true;
      } else {
        return false;
      }
    }
  }

  canDeletePartner(id: string) {
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

  get canCreatePartner() {
    const self = this;
    return self.hasPermission('PMPBC');
  }
}
