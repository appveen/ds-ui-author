import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, EventEmitter, } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';

import { GetOptions, CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-faas-listing',
  templateUrl: './faas-listing.component.html',
  styleUrls: ['./faas-listing.component.scss']
})
export class FaasListingComponent implements OnInit, OnDestroy {

  @ViewChild('newFaasModal', { static: false }) newFaasModal: TemplateRef<HTMLElement>;
  form: FormGroup;
  app: string;
  faasList: Array<any> = [];
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
  newFaasModalRef: NgbModalRef;
  constructor(public commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private ts: ToastrService,
    private fb: FormBuilder) {
    this.alertModal = {
      statusChange: false,
      title: '',
      message: '',
      index: -1
    };
    this.showMoreOptions = {};
    this.form = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(40), Validators.pattern(/\w+/)]],
      description: [null, [Validators.maxLength(240), Validators.pattern(/\w+/)]],
      api: [null]
    });
    this.openDeleteModal = new EventEmitter();
    this.apiConfig = {
      page: 1,
      count: 30
    };
  }
  ngOnInit() {
    this.app = this.commonService.app._id;
    this.showLazyLoader = true;
    this.getFaass();
    this.commonService.apiCalls.componentLoading = false;
    this.form.get('api').disable();
    this.form.get('name').valueChanges.subscribe(val => {
      this.form.get('api').patchValue(`/api/a/faas/${this.commonService.app._id}/${_.camelCase(val)}`);
    });
    this.changeAppSubscription = this.commonService.appChange.subscribe(_app => {
      this.app = this.commonService.app._id;
      this.showLazyLoader = true;
      this.commonService.apiCalls.componentLoading = false;
      this.faasList = [];
      this.getFaass();
    });
  }

  ngOnDestroy() {
    Object.keys(this.subscriptions).forEach(e => {
      this.subscriptions[e].unsubscribe();
    });
    if (this.newFaasModalRef) {
      this.newFaasModalRef.close();
    }
  }

  newFaas() {
    this.newFaasModalRef = this.commonService.modal(this.newFaasModal, { size: 'sm' });
    this.newFaasModalRef.result.then(close => {
      if (close && this.form.valid) {
        this.triggerFaasCreate();
      }
      this.form.reset();
    }, dismiss => {
      this.form.reset();
    });
  }

  triggerFaasCreate() {
    const payload = this.form.value;
    payload.app = this.commonService.app._id;
    this.commonService.post('partnerManager', '/faas', payload).subscribe(res => {
      this.ts.success('Nano Service Created.');
      this.appService.edit = res._id;
      this.router.navigate(['/app/', this.commonService.app._id, 'faas', res._id]);
    }, err => {
      this.commonService.errorToast(err);
    });
  }

  editFaas(index: number) {
    this.appService.edit = this.faasList[index]._id;
    this.router.navigate(['/app/', this.commonService.app._id, 'faas', this.appService.edit]);
  }
  viewFaas(index) {
    this.router.navigate(['/app/', this.commonService.app._id, 'faas', this.faasList[index]._id]);
  }

  loadMore(event) {
    if (event.target.scrollTop >= 244) {
      this.showAddButton = true;
    } else {
      this.showAddButton = false;
    }
    if (event.target.scrollTop + event.target.offsetHeight === event.target.children[0].offsetHeight) {
      this.apiConfig.page = this.apiConfig.page + 1;
      this.getFaass();
    }
  }

  getFaass() {
    if (this.subscriptions['getFaass']) {
      this.subscriptions['getFaass'].unsubscribe();
    }
    this.showLazyLoader = true;
    this.subscriptions['getFaass'] = this.commonService.get('partnerManager', '/faas', this.apiConfig)
      .subscribe(res => {
        this.showLazyLoader = false;
        if (res.length > 0) {
          res.forEach(_item => {
            this.fetchFlowsInUse(_item);
            this.faasList.push(_item);
          });
        }
      }, err => {
        this.showLazyLoader = false;
        this.commonService.errorToast(err, 'We are unable to fetch nano service, please try again later');
      });
  }

  deleteFaas(index: number) {
    this.alertModal.statusChange = false;
    this.alertModal.title = 'Delete Nano Service?';
    this.alertModal.message = 'Are you sure you want to delete <span class="text-delete font-weight-bold">'
      + this.faasList[index].name + '</span> Nano Service?';
    this.alertModal.index = index;
    this.openDeleteModal.emit(this.alertModal);
  }

  closeDeleteModal(data) {
    if (data) {
      this.showLazyLoader = true;
      this.subscriptions['deleteFaass'] = this.commonService
        .delete('partnerManager', '/faas/' + this.faasList[data.index]._id).subscribe(_d => {
          this.showLazyLoader = false;
          this.ts.info(_d.message ? _d.message : 'Nano Service deleted Successfully');
          this.clearSearch();
        }, err => {
          this.showLazyLoader = false;
          this.commonService.errorToast(err, 'Oops, something went wrong. Please try again later.');
        });
    }
  }

  search(searchTerm: string) {
    this.apiConfig.filter = {
      'name': '/' + searchTerm + '/'
    };
    this.apiConfig.page = 1;
    this.faasList = [];
    this.getFaass();
  }

  clearSearch() {
    this.apiConfig.filter = null;
    this.apiConfig.page = 1;
    this.faasList = [];
    this.getFaass();
  }


  canManageFaas(id: string) {
    const list1 = this.commonService.getEntityPermissions('FU_' + id);
    const list2 = this.commonService.getEntityPermissions('FU');
    if (this.commonService.isAppAdmin || this.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      if (list1.length === 0 && list2.find(e => e.id.substr(0, 4) === 'PMFU'
        && e.id !== 'PMFUBC'
        && e.id !== 'PMFUBD')) {
        return true;
      } else if (list1.length > 0 && list1.find(e => e.id.substr(0, 4) === 'PMFU'
        && e.id !== 'PMFUBC'
        && e.id !== 'PMFUBD')) {
        return true;
      } else {
        return false;
      }
    }
  }
  canDeleteFaas(id: string) {
    const list = this.commonService.getEntityPermissions('PM_' + id);
    if (list.length === 0 && this.hasPermission('PMPBD')) {
      return true;
    } else if (list.length > 0 && list.find(e => e.id === 'PMPBD')) {
      return true;
    } else {
      return false;
    }
  }

  hasPermission(type: string, entity?: string) {
    return this.commonService.hasPermission(type, entity);
  }
  hasWritePermission(entity: string) {
    return this.commonService.hasPermission('PMFUBC', entity);
  }

  fetchFlowsInUse(flow: any) {
    this.commonService.get('partnerManager', '/flow/', {
      select: 'name',
      count: 4,
      filter: {
        faas: flow._id
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
  hasPermissionForFaas(id: string) {
    if (this.commonService.isAppAdmin || this.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      const list = this.commonService.getEntityPermissions('FU_' + id);
      if (list.length > 0 && list.find(e => e.id.startsWith('PMFU') || e.id.startsWith('PVFU'))) {
        return true;
      } else if (list.length === 0
        && (this.commonService.hasPermissionStartsWith('PMFU', 'FU')
          || this.commonService.hasPermissionStartsWith('PVFU', 'FU'))) {
        return true;
      } else {
        return false;
      }
    }
  }

}
