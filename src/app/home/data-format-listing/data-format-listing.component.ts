import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { switchMap, catchError, map } from 'rxjs/operators';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';

import { GetOptions, CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-data-format-listing',
  templateUrl: './data-format-listing.component.html',
  styleUrls: ['./data-format-listing.component.scss']
})
export class DataFormatListingComponent implements OnInit, OnDestroy {
  @ViewChild('newDataFormatModal', { static: false }) newDataFormatModal: TemplateRef<HTMLElement>;
  @ViewChild('cloneDataFormatModal', { static: false }) cloneDataFormatModal: TemplateRef<HTMLElement>;
  form: FormGroup;
  cloneForm: FormGroup;
  app: string;
  dataFormatList: Array<any> = [];
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
  newDataFormatModalRef: NgbModalRef;
  cloneDataFormatModalRef: NgbModalRef;
  cloneData: any;

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
    self.cloneForm = self.fb.group({
      name: [null, [Validators.required, Validators.maxLength(40), Validators.pattern(/\w+/)]],
      description: [null, [Validators.maxLength(240), Validators.pattern(/\w+/)]]
    });
  }

  ngOnInit() {
    const self = this;
    self.app = self.commonService.app._id;
    self.showLazyLoader = true;
    self.getDataFormats();
    self.commonService.apiCalls.componentLoading = false;

    self.changeAppSubscription = self.commonService.appChange.subscribe(app => {
      self.app = self.commonService.app._id;
      self.showLazyLoader = true;
      self.commonService.apiCalls.componentLoading = false;
      self.dataFormatList = [];
      self.getDataFormats();
    });
  }

  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach(e => {
      self.subscriptions[e].unsubscribe();
    });
    if (self.newDataFormatModalRef) {
      self.newDataFormatModalRef.close();
    }
  }

  newDataFormat() {
    const self = this;
    self.newDataFormatModalRef = self.commonService.modal(self.newDataFormatModal, { size: 'sm' });
    self.newDataFormatModalRef.result.then(close => {
      if (close && self.form.valid) {
        self.triggerDataFormatCreate();
      }
      self.form.reset();
    }, dismiss => {
      self.form.reset();
    });
  }

  triggerDataFormatCreate() {
    const self = this;
    const payload = self.form.value;
    payload.app = self.commonService.app._id;
    self.commonService.post('partnerManager', '/dataFormat', payload).subscribe(res => {
      self.ts.success('Data Format Created.');
      self.appService.editServiceId = res._id;
      self.router.navigate(['/app/', self.commonService.app._id, 'dfm', res._id]);
    }, err => {
      self.commonService.errorToast(err);
    });
  }

  editDataFormat(index: number) {
    const self = this;
    self.appService.editServiceId = self.dataFormatList[index]._id;
    self.router.navigate(['/app/', self.commonService.app._id, 'dfm', self.appService.editServiceId]);
  }

  cloneDataFormat(index: number) {
    const self = this;
    self.cloneData = self.dataFormatList[index];
    self.cloneForm.get('name').patchValue(self.cloneData.name + ' Copy');
    self.cloneForm.get('description').patchValue(self.cloneData.description);
    self.cloneDataFormatModalRef = self.commonService.modal(self.cloneDataFormatModal, { size: 'sm' });
    self.cloneDataFormatModalRef.result.then(close => {
      self.cloneData = null;
      self.cloneForm.reset({ desTab: true });
    }, dismiss => {
      self.cloneData = null;
      self.cloneForm.reset({ desTab: true });
    });
  }

  triggerClone() {
    const self = this;
    const payload = self.cloneForm.value;
    payload.app = self.commonService.app._id;
    payload.definition = self.cloneData.definition;
    payload.formatType = self.cloneData.formatType;
    payload.character = self.cloneData.character;
    payload.excelType = self.cloneData.excelType;
    self.commonService.post('partnerManager', '/dataFormat', payload).subscribe(res => {
      self.ts.success('Data Format Cloned.');
      self.appService.editServiceId = res._id;
      self.cloneDataFormatModalRef.close(false);
      self.router.navigate(['/app/', self.commonService.app._id, 'dfm', res._id]);
    }, err => {
      self.commonService.errorToast(err);
    });
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
      self.getDataFormats();
    }
  }

  getDataFormats() {
    if (this.subscriptions['getDataFormats']) {
      this.subscriptions['getDataFormats'].unsubscribe();
    }
    this.showLazyLoader = true;
    this.subscriptions['getDataFormats'] = this.commonService.get('partnerManager', '/dataFormat', this.apiConfig)
      .pipe(
        switchMap(
          (dfArray: any[]) => {
            if (!dfArray || !dfArray.length) {
              return of([]);
            }
            return forkJoin(
              dfArray.map(
                df => this.commonService.get('partnerManager', '/flow/', {
                  select: 'name',
                  filter: {
                    dataFormat: df._id
                  }
                }).pipe(
                  map(flowArray => ({ ...df, flowCount: flowArray.length })),
                  catchError(() => (of({ ...df, flowCount: 0 }))),
                )
              )
            )
          }
        )
      )
      .subscribe(res => {
        this.showLazyLoader = false;
        if (res.length > 0) {
          res.forEach(item => {
            this.dataFormatList.push(item);
          });
        }
      }, err => {
        this.showLazyLoader = false;
        this.commonService.errorToast(err, 'We are unable to fetch data formats, please try again later');
      });
  }

  deleteDataFormat(index: number) {
    const self = this;
    self.alertModal.statusChange = false;
    self.alertModal.title = 'Delete Data Format';
    self.alertModal.message = 'Are you sure you want to delete <span class="text-delete font-weight-bold">'
      + self.dataFormatList[index].name
      + '</span> data format?';
    self.alertModal.index = index;
    self.openDeleteModal.emit(self.alertModal);
  }

  closeDeleteModal(data) {
    const self = this;
    if (data) {
      self.showLazyLoader = true;
      self.subscriptions['deleteDataFormat'] = self.commonService
        .delete('partnerManager', '/dataFormat/' + self.dataFormatList[data.index]._id).subscribe(d => {
          self.showLazyLoader = false;
          self.ts.success(d.message ? d.message : 'Data Format deleted Successfully');
          self.clearSearch();
        }, err => {
          self.showLazyLoader = false;
          self.commonService.errorToast(err, 'Oops, something went wrong. Please try again later.');
        });
    }
  }

  search(searchTerm: string) {
    const self = this;
    self.apiConfig.page = 1;
    self.apiConfig.filter = {
      name: '/' + searchTerm + '/'
    };
    self.dataFormatList = [];
    self.getDataFormats();
  }

  clearSearch() {
    const self = this;
    self.apiConfig.page = 1;
    self.apiConfig.filter = null;
    self.dataFormatList = [];
    self.getDataFormats();
  }
  hasPermissionForDataFormat(id: string) {
    const self = this;
    if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      const list = self.commonService.getEntityPermissions('DF_' + id);
      if (list.length > 0 && list.find(e => e.id === 'PNDF')) {
        return false;
      } else if (list.length === 0 && !self.hasManagePermission('DF') && !self.hasViewPermission('DF')) {
        return false;
      } else {
        return true;
      }
    }
  }

  canEditDataFormat(id: string) {
    const self = this;
    if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      const list = self.commonService.getEntityPermissions('DF_' + id);
      if (list.length > 0 && list.find(e => e.id === 'PMDF')) {
        return true;
      } else if (list.length === 0 && self.hasManagePermission('DF')) {
        return true;
      } else {
        return false;
      }
    }
  }

  hasManagePermission(entity: string) {
    const self = this;
    const retValue = self.commonService.hasPermission('PMDF', entity);
    return retValue;
  }
  hasViewPermission(entity: string) {
    const self = this;
    return self.commonService.hasPermission('PVDF', entity);
  }

}
