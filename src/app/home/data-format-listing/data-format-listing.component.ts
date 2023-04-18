import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { CommonFilterPipe } from 'src/app/utils/pipes/common-filter/common-filter.pipe';

@Component({
  selector: 'odp-data-format-listing',
  templateUrl: './data-format-listing.component.html',
  styleUrls: ['./data-format-listing.component.scss'],
  providers: [CommonFilterPipe]
})
export class DataFormatListingComponent implements OnInit, OnDestroy {
  dataFormatList: Array<any> = [];
  alertModal: {
    statusChange?: boolean;
    title: string;
    message: string;
    index: number;
  };
  showLazyLoader: boolean;
  subscriptions: any = {};
  breadcrumbPaths: Array<Breadcrumb>;
  openDeleteModal: EventEmitter<any>;
  form: FormGroup;
  showNewDataFormatWindow: boolean;
  showOptionsDropdown: any;
  selectedItemEvent: any
  selectedDataFormat: any;
  searchTerm: string;
  sortModel: any;
  formatList: Array<any>;
  cloneData: any;
  isClone: boolean;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private fb: FormBuilder,
    private ts: ToastrService,
    private commonPipe: CommonFilterPipe) {
    this.alertModal = {
      statusChange: false,
      title: '',
      message: '',
      index: -1
    };
    this.breadcrumbPaths = [{
      active: true,
      label: 'Data Formats'
    }];

    this.commonService.changeBreadcrumb(this.breadcrumbPaths)
    this.openDeleteModal = new EventEmitter();
    this.form = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(40), Validators.pattern(/\w+/)]],
      description: [null, [Validators.maxLength(240), Validators.pattern(/\w+/)]],
      strictValidation: [false],
      formatType: ['JSON', [Validators.required]],
      character: [',', [Validators.required]],
      excelType: ['xls', [Validators.required]],
      lineSeparator: ['\\\\n']
    });
    this.showOptionsDropdown = {};
    this.showLazyLoader = true;
    this.sortModel = {};
    this.formatList = this.appService.getFormatTypeList();;
  }

  ngOnInit() {
    this.showLazyLoader = true;
    this.commonService.apiCalls.componentLoading = false;
    this.getDataFormats();
    this.subscriptions['changeApp'] = this.commonService.appChange.subscribe(_app => {
      this.commonService.apiCalls.componentLoading = false;
      this.showLazyLoader = true;
      this.getDataFormats();
    });

  }

  ngOnDestroy() {
    Object.keys(this.subscriptions).forEach(e => {
      this.subscriptions[e].unsubscribe();
    });
  }

  newDataFormat() {
    this.form.reset({ formatType: 'JSON', character: ',', excelType: 'xls', lineSeparator: '\\\\n' });
    this.showNewDataFormatWindow = true;
  }

  triggerDataFormatCreate() {
    if (this.form.invalid) {
      return;
    }
    const payload = this.form.value;
    payload.app = this.commonService.app._id;
    payload.definition = [];
    this.showLazyLoader = true;
    this.commonService.post('partnerManager', `/${this.commonService.app._id}/dataFormat`, payload).subscribe(res => {
      this.ts.success('DataFormat Created.');
      this.appService.editLibraryId = res._id;
      this.showLazyLoader = false;
      this.router.navigate(['/app/', this.commonService.app._id, 'dfm', res._id]);
    }, err => {
      this.showLazyLoader = false;
      this.commonService.errorToast(err);
    });
  }

  editDataFormat(_index) {
    this.appService.editLibraryId = this.dataFormatList[_index]._id;

    this.router.navigate(['/app/', this.app, 'dfm', this.appService.editLibraryId]);
  }

  cloneDataFormat(_index) {
    this.appService.cloneLibraryId = this.records[_index]._id;
    this.cloneData= this.records[_index];
    this.isClone=true;
    this.form.patchValue({
      name: this.cloneData.name + ' Copy',
      formatType: this.cloneData.formatType,
      excelType: this.cloneData.excelType
    });
    this.showNewDataFormatWindow=true;
  }

  triggerDataFormatClone(){
    this.isClone=false;
    const payload = {
      name:this.form.value.name,
      formatType: this.form.value.formatType,
      app:this.cloneData.app,
      attributeCount:this.cloneData.attributeCount,
      character:this.cloneData.character,
      definition:this.cloneData.definition,
      excelType:this.cloneData.excelType,
      lineSeparator:this.cloneData.lineSeparator,
      strictValidation:this.cloneData.strictValidation
    };
    this.showLazyLoader = true;
    this.commonService.post('partnerManager', `/${this.commonService.app._id}/dataFormat`, payload).subscribe(res => {
      this.ts.success('DataFormat Cloned.');
      this.appService.editLibraryId = res._id;
      this.router.navigate(['/app/', this.commonService.app._id, 'dfm', res._id]);
      this.showLazyLoader = false;
    }, err => {
      this.showLazyLoader = false;
      this.commonService.errorToast(err);
    });
  }

  getDataFormats() {
    if (this.subscriptions['getDataFormats']) {
      this.subscriptions['getDataFormats'].unsubscribe();
    }
    this.showLazyLoader = true;
    this.dataFormatList = [];
    this.subscriptions['getDataFormats'] = this.commonService.get('partnerManager', `/${this.commonService.app._id}/dataFormat?countOnly=true`)
      .pipe(switchMap((ev: any) => {
        return this.commonService.get('partnerManager', `/${this.commonService.app._id}/dataFormat`, { count: ev });
      }))
      .subscribe(res => {
        this.showLazyLoader = false;
        if (res.length > 0) {
          res.forEach(item => {
            if (item && item.definition) {
              item._attributes = item?.definition?.length;
              item._references = 0;
            } else {
              item._attributes = 0;
              item._references = 0;
            }
            this.dataFormatList.push(item);
          });
        }
      }, err => {
        this.commonService.errorToast(err, 'We are unable to fetch records, please try again later');
      });
  }

  deleteDataFormat(_index) {
    this.alertModal.statusChange = false;
    this.alertModal.title = 'Delete dataFormat';
    this.alertModal.message = 'Are you sure you want to delete <span class="text-delete font-weight-bold">'
      + this.dataFormatList[_index].name + '</span> DataFormat?';
    this.alertModal.index = _index;
    this.openDeleteModal.emit(this.alertModal);
  }

  closeDeleteModal(data) {
    if (data) {
      const url = `/${this.commonService.app._id}/dataFormat/` + this.dataFormatList[data.index]._id;
      this.showLazyLoader = true;
      this.subscriptions['deleteDataFormat'] = this.commonService.delete('partnerManager', url).subscribe(_d => {
        this.showLazyLoader = false;
        this.ts.info(_d.message ? _d.message : 'DataFormat deleted');
        this.getDataFormats();
      }, err => {
        this.showLazyLoader = false;
        this.commonService.errorToast(err, 'Unable to delete, please try again later');
      });
    }
  }

  hasPermissionForDataFormat(id: string) {
    if (this.commonService.isAppAdmin || this.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      const list = this.commonService.getEntityPermissions('DF_' + id);
      if (list.length > 0 && list.find(e => e.id === 'PNDF')) {
        return false;
      } else if (list.length === 0 && !this.hasManagePermission('DF') && !this.hasViewPermission('DF')) {
        return false;
      } else {
        return true;
      }
    }
  }

  canEditDataFormat(id: string) {
    if (this.commonService.isAppAdmin || this.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      const list = this.commonService.getEntityPermissions('DF_' + id);
      if (list.length > 0 && list.find(e => e.id === 'PMDF')) {
        return true;
      } else if (list.length === 0 && this.hasManagePermission('DF')) {
        return true;
      } else {
        return false;
      }
    }
  }

  hasManagePermission(entity: string) {
    return this.commonService.hasPermission('PMDF', entity);
  }
  hasViewPermission(entity: string) {
    return this.commonService.hasPermission('PVDF', entity);
  }

  applySort(field: string) {
    if (!this.sortModel[field]) {
      this.sortModel = {};
      this.sortModel[field] = 1;
    } else if (this.sortModel[field] == 1) {
      this.sortModel[field] = -1;
    } else {
      delete this.sortModel[field];
    }
  }

  showDropDown(event: any, i: number) {
    this.selectedItemEvent = event;
    Object.keys(this.showOptionsDropdown).forEach(key => {
      this.showOptionsDropdown[key] = false;
    })
    this.selectedDataFormat = this.dataFormatList[i];
    this.showOptionsDropdown[i] = true;
  }

  selectFormat(format: any) {
    this.formatList.forEach(e => {
      e.selected = false;
    });
    format.selected = true;
    this.form.get('formatType').patchValue(format.formatType);
    if (format.formatType === 'EXCEL') {
      this.form.get('excelType').patchValue(format.excelType);
    }
  }

  isFormatSelected(format: any) {
    const formatType = this.form.get('formatType').value;
    const excelType = this.form.get('excelType').value;
    let flag = false;
    if (format.formatType == formatType) {
      if (format.formatType === 'EXCEL') {
        if (format.excelType == excelType) {
          flag = true;
        }
      } else {
        flag = true;
      }
    }
    return flag;
  }

  navigate(dataFormat) {
    this.router.navigate(['/app/', this.app, 'dfm', dataFormat._id])
  }

  private compare(a: any, b: any) {
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    } else {
      return 0;
    }
  }

  get dropDownStyle() {
    let top = (this.selectedItemEvent.clientY + 10);
    if (this.selectedItemEvent.clientY > 430) {
      top = this.selectedItemEvent.clientY - 106
    }
    return {
      top: top + 'px',
      right: '50px'
    };
  }

  get records() {
    let records = this.commonPipe.transform(this.dataFormatList, 'name', this.searchTerm);
    const field = Object.keys(this.sortModel)[0];
    if (field) {
      records = records.sort((a, b) => {
        if (this.sortModel[field] == 1) {
          if (typeof a[field] == 'number' || typeof b[field] == 'number') {
            return this.compare((a[field]), (b[field]));
          } else {
            return this.compare(_.lowerCase(a[field]), _.lowerCase(b[field]));
          }
        } else if (this.sortModel[field] == -1) {
          if (typeof a[field] == 'number' || typeof b[field] == 'number') {
            return this.compare((b[field]), (a[field]));
          } else {
            return this.compare(_.lowerCase(b[field]), _.lowerCase(a[field]));
          }
        } else {
          return 0;
        }
      });
    } else {
      records = records.sort((a, b) => {
        return this.compare(b._metadata.lastUpdated, a._metadata.lastUpdated);
      });
    }
    return records;
  }

  get app() {
    return this.commonService.app._id;
  }
}
