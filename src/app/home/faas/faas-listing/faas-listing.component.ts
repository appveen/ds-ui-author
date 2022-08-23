import { Component, OnInit, OnDestroy, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';

import { GetOptions, CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonFilterPipe } from 'src/app/utils/pipes/common-filter/common-filter.pipe';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'odp-faas-listing',
  templateUrl: './faas-listing.component.html',
  styleUrls: ['./faas-listing.component.scss'],
  providers: [CommonFilterPipe]
})
export class FaasListingComponent implements OnInit, OnDestroy {

  @ViewChild('alertModalTemplate', { static: false }) alertModalTemplate: TemplateRef<HTMLElement>;
  form: FormGroup;
  apiConfig: GetOptions;
  subscriptions: any;
  totalCount: number;
  showNewFaasWindow: boolean;
  searchTerm: string;
  faasList: Array<any>;
  alertModal: {
    statusChange?: boolean;
    title: string;
    message: string;
    index: number;
  };
  openDeleteModal: EventEmitter<any>;
  alertModalTemplateRef: NgbModalRef;
  showLazyLoader: boolean;
  easterEggEnabled: boolean;
  copied: any;
  constructor(public commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private ts: ToastrService,
    private fb: FormBuilder,
    private commonFilter: CommonFilterPipe) {
    this.subscriptions = {};
    this.form = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(40), Validators.pattern(/\w+/)]],
      description: [null, [Validators.maxLength(240), Validators.pattern(/\w+/)]],
      api: [null],
      code: [null]
    });
    this.apiConfig = {
      page: 1,
      count: 30
    };
    this.faasList = [];
    this.alertModal = {
      statusChange: false,
      title: '',
      message: '',
      index: -1,
    };
    this.openDeleteModal = new EventEmitter();
    this.copied = {};
  }
  ngOnInit() {
    this.commonService.apiCalls.componentLoading = false;
    this.getFaasCount();
    this.getFaas();
    this.form.get('api').disable();
    this.form.get('name').valueChanges.subscribe(val => {
      this.form.get('api').patchValue(`/api/a/faas/${this.commonService.app._id}/${_.camelCase(val)}`);
    });
    this.subscriptions.appChange = this.commonService.appChange.subscribe(app => {
      this.resetSearch();
    });
    this.subscriptions['faas.delete'] = this.commonService.faas.delete.subscribe(data => {
      this.resetSearch();
    });
    this.subscriptions['faas.status'] = this.commonService.faas.status.subscribe(data => {
      this.resetSearch();
    });
    this.subscriptions['faas.new'] = this.commonService.faas.new.subscribe(data => {
      this.resetSearch();
    });
  }

  ngOnDestroy() {
    Object.keys(this.subscriptions).forEach(e => {
      this.subscriptions[e].unsubscribe();
    });
  }

  newFaas() {
    this.form.reset({});
    this.showNewFaasWindow = true;
  }

  triggerFaasCreate() {
    const payload = this.form.value;
    payload.app = this.commonService.app._id;
    this.commonService.post('partnerManager', `/${this.commonService.app._id}/faas`, payload).subscribe(res => {
      this.form.reset();
      this.ts.success('Function has been created.');
      this.appService.edit = res._id;
      this.router.navigate(['/app/', this.commonService.app._id, 'faas', res._id]);
    }, err => {
      this.form.reset();
      this.commonService.errorToast(err);
    });
  }

  getFaas() {
    return this.commonService.get('partnerManager', `/${this.commonService.app._id}/faas`, this.apiConfig).subscribe(res => {
      res.forEach(item => {
        item.url = 'https://' + this.commonService.userDetails.fqdn + item.url;
        this.faasList.push(item);
      });
    }, err => {
      this.commonService.errorToast(err);
    });
  }

  getFaasCount() {
    return this.commonService.get('partnerManager', `/${this.commonService.app._id}/faas/utils/count`, { filter: this.apiConfig.filter }).subscribe(res => {
      this.totalCount = res;
    }, err => {
      this.commonService.errorToast(err);
    });
  }

  resetSearch() {
    this.searchTerm = null;
    this.faasList = [];
    this.apiConfig.filter = {};
    this.getFaasCount();
    this.getFaas();
  }

  search(value) {
    this.searchTerm = value;
    if (!value || !value.trim()) {
      return;
    }
    if (!this.apiConfig.filter) {
      this.apiConfig.filter = {};
    }
    this.searchTerm = value;
    this.apiConfig.filter.name = '/' + value.trim() + '/';
    this.faasList = [];
    this.getFaasCount();
    this.getFaas();
  }

  canManageFaas(id: string) {
    if (this.commonService.isAppAdmin || this.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      return this.hasPermission('PMF');
    }
  }

  canDeployFunction(faas) {
    if (!faas.draftVersion) {
      return false;
    }
    if (this.commonService.userDetails.isSuperAdmin) {
      return true;
    } else if (
      this.commonService.isAppAdmin &&
      !this.commonService.userDetails.verifyDeploymentUser
    ) {
      return true;
    } else if (
      this.commonService.userDetails.verifyDeploymentUser &&
      this.commonService.userDetails._id === faas._metadata.lastUpdatedBy
    ) {
      return false;
    } else {
      return this.commonService.hasPermission('PMFPD', 'FAAS');
    }
  }

  canStartStopFunction(id: string) {
    const temp = this.faasList.find((e) => e._id === id);
    if (temp && temp.status !== 'Stopped' && temp.status !== 'Active') {
      return false;
    }
    if (
      this.commonService.isAppAdmin ||
      this.commonService.userDetails.isSuperAdmin
    ) {
      return true;
    } else {
      return this.commonService.hasPermission('PMFPS', 'FAAS');
    }
  }

  hasPermission(type: string, entity?: string) {
    return this.commonService.hasPermission(type, entity);
  }

  hasWritePermission(entity: string) {
    return this.commonService.hasPermission('PMF', entity);
  }

  getStatusClass(srvc) {
    if (srvc.status.toLowerCase() === 'active') {
      return 'text-success';
    }
    if (srvc.status.toLowerCase() === 'stopped' || srvc.status.toLowerCase() === 'undeployed') {
      return 'text-danger';
    }
    if (srvc.status.toLowerCase() === 'draft') {
      return 'text-accent';
    }
    if (srvc.status.toLowerCase() === 'pending') {
      return 'text-warning';
    }
    return 'text-secondary';
  }

  getStatusLabel(srvc){
    if (srvc.status.toLowerCase() === 'stopped' || srvc.status.toLowerCase() === 'undeployed') {
      return 'Stopped';
    }
    return srvc.status;
  }


  deployFunction(index: number) {
    this.alertModal.statusChange = true;
    if (
      this.faasList[index].status === 'Draft' ||
      this.faasList[index].draftVersion
    ) {
      this.alertModal.title = 'Deploy ' + this.faasList[index].name + '?';
      this.alertModal.message =
        'Are you sure you want to Deploy this function? Once Deployed, "' +
        this.faasList[index].name +
        '" will be running the latest version.';
    } else {
      return;
    }
    this.alertModalTemplateRef = this.commonService.modal(
      this.alertModalTemplate
    );
    this.alertModalTemplateRef.result.then(
      (close) => {
        if (close) {
          const url =
            `/${this.commonService.app._id}/faas/utils/` +
            this.faasList[index]._id +
            '/deploy';
          this.subscriptions['updateservice'] = this.commonService
            .put('partnerManager', url, { app: this.commonService.app._id })
            .subscribe(
              (d) => {
                this.ts.info('Deploying function...');
                this.faasList[index].status = 'Pending';
              },
              (err) => {
                this.commonService.errorToast(err);
              }
            );
        }
      },
      (dismiss) => { }
    );
  }

  toggleFunctionStatus(index: number) {
    this.alertModal.statusChange = true;

    if (this.faasList[index].status === 'Active') {
      this.alertModal.title = 'Stop ' + this.faasList[index].name + '?';
      this.alertModal.message =
        'Are you sure you want to stop this function? : ' + this.faasList[index].name;
    } else {
      this.alertModal.title = 'Start ' + this.faasList[index].name + '?';
      this.alertModal.message =
        'Are you sure you want to start this function? : ' + this.faasList[index].name;
    }
    this.alertModalTemplateRef = this.commonService.modal(
      this.alertModalTemplate
    );
    this.alertModalTemplateRef.result.then(
      (close) => {
        if (close) {
          let url =
            `/${this.commonService.app._id}/faas/utils/` +
            this.faasList[index]._id +
            '/start';
          if (this.faasList[index].status === 'Active') {
            url =
              `/${this.commonService.app._id}/faas/utils/` +
              this.faasList[index]._id +
              '/stop';
          }
          this.subscriptions['updateservice'] = this.commonService
            .put('partnerManager', url, { app: this.commonService.app._id })
            .subscribe(
              (d) => {
                if (this.faasList[index].status === 'Active') {
                  this.ts.info('Stopping function...');
                } else {
                  this.ts.info('Starting function...');
                }
                this.faasList[index].status = 'Pending';
              },
              (err) => {
                this.commonService.errorToast(err);
              }
            );
        }
      },
      (dismiss) => { }
    );
  }

  closeDeleteModal(data) {
    if (data) {
      const url =
        `/${this.commonService.app._id}/faas/` +
        this.faasList[data.index]._id;
      this.showLazyLoader = true;
      this.subscriptions['deleteservice'] = this.commonService
        .delete('partnerManager', url)
        .subscribe(
          (d) => {
            this.showLazyLoader = false;
            this.ts.info(d.message ? d.message : 'Deleting function...');
            this.faasList[data.index].status = 'Pending';
          },
          (err) => {
            this.showLazyLoader = false;
            this.commonService.errorToast(
              err,
              'Oops, something went wrong. Please try again later.'
            );
          }
        );
    }
  }

  editFunction(index: number) {
    this.appService.editServiceId = this.faasList[index]._id;
    this.router.navigate(['/app/', this.commonService.app._id, 'faas', this.appService.editServiceId,
    ]);
  }

  viewFunction(index: number) {
    this.router.navigate(['/app', this.commonService.app._id, 'faas', this.faasList[index]._id]);
  }

  deleteFunction(index: number) {
    this.alertModal.statusChange = false;
    this.alertModal.title = 'Delete Function?';
    this.alertModal.message =
      'Are you sure you want to delete this function? This action will delete : ' + this.faasList[index].name;
    this.alertModal.index = index;
    this.openDeleteModal.emit(this.alertModal);
  }

  cloneFunction(index: number) {
    this.form.reset();
    const temp = this.faasList[index];
    this.form.get('name').patchValue(temp.name + ' Copy');
    this.form.get('code').patchValue(temp.code);
    this.showNewFaasWindow = true;
  }

  copyUrl(faas: any) {
    this.copied[faas._id] = true;
    this.appService.copyToClipboard(faas.url);
    setTimeout(() => {
      this.copied[faas._id] = false;
    }, 2000);
  }


  get records() {
    if (!this.faasList) {
      return [];
    }
    return this.commonFilter.transform(this.faasList, 'name', this.searchTerm) || [];
  }
}
