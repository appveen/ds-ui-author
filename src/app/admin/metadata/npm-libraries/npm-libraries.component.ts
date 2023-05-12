import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs/operators';
import * as _ from 'lodash';

import { GetOptions, CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonFilterPipe } from 'src/app/utils/pipes/common-filter/common-filter.pipe';

@Component({
  selector: 'odp-npm-libraries',
  templateUrl: './npm-libraries.component.html',
  styleUrls: ['./npm-libraries.component.scss'],
  providers: [CommonFilterPipe]
})
export class NpmLibrariesComponent implements OnInit {

  apiConfig: GetOptions;
  customNodeList: Array<any>;
  alertModal: {
    statusChange?: boolean;
    title: string;
    message: string;
    index: number;
  };
  subscriptions: any;
  showNewNodeWindow: boolean;
  showLazyLoader: boolean;
  selectedNode: any;
  selectedItemEvent: any
  openDeleteModal: EventEmitter<any>;
  searchTerm: string;
  isClone: boolean;
  isEdit: boolean;
  cloneData: any;
  toggleExpand: boolean;
  params: Array<any>;
  categoryList: Array<any>;
  constructor(public commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private ts: ToastrService,
    private commonFilter: CommonFilterPipe) {
    this.subscriptions = {};
    this.apiConfig = {
      page: 1,
      count: 30
    };
    this.customNodeList = [];
    this.alertModal = {
      statusChange: false,
      title: '',
      message: '',
      index: -1,
    };
    this.openDeleteModal = new EventEmitter();
    this.showLazyLoader = true;
  }
  ngOnInit() {
    this.getNpmLibraries();
    this.commonService.apiCalls.componentLoading = false;
  }

  ngOnDestroy() {
    Object.keys(this.subscriptions).forEach(e => {
      this.subscriptions[e].unsubscribe();
    });
  }

  newNode() {
    this.customNodeList.push({});
  }

  saveLibrary(item: any, index: number) {
    this.showLazyLoader = true;
    const payload = item;
    payload.app = 'Admin';
    let request;
    if (payload._id) {
      request = this.commonService.put('partnerManager', `/admin/flow/utils/node-library/${payload._id}`, payload)
    } else {
      request = this.commonService.post('partnerManager', `/admin/flow/utils/node-library`, payload)
    }
    request.subscribe(res => {
      this.showLazyLoader = false;
      if (payload._id) {
        this.ts.success('Library has been updated.');
      } else {
        this.ts.success('Library has been added.');
      }
      this.getNpmLibraries();
    }, err => {
      this.showLazyLoader = false;
      this.commonService.errorToast(err);
    });
  }

  getNpmLibraries() {
    this.showLazyLoader = true;
    this.customNodeList = [];
    this.commonService.get('partnerManager', `/admin/flow/utils/node-library`, {
      noApp: true
    }).subscribe((res: any) => {
      this.showLazyLoader = false;
      this.customNodeList = res;
    }, err => {
      this.showLazyLoader = false;
      console.log(err);
      this.commonService.errorToast(err);
    });
  }


  canManageNode(id: string) {
    if (this.commonService.isAppAdmin || this.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      return this.hasPermission('PMPN');
    }
  }

  canViewNode(id: string) {
    if (this.commonService.isAppAdmin || this.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      return this.hasPermission('PVPN');
    }
  }

  canDeleteNode(id: string) {
    return this.hasPermission('PMPN');
  }

  hasPermission(type: string, entity?: string) {
    return this.commonService.hasPermission(type, entity);
  }
  hasWritePermission(entity: string) {
    return this.commonService.hasPermission('PMPN', entity);
  }

  removeLibrary(item: any, index: number) {
    this.alertModal.statusChange = false;
    this.alertModal.title = 'Remove Library?';
    this.alertModal.message =
      'Are you sure you want to remove this library? This action will remove : ' + this.records[index].name;
    this.alertModal.index = index;
    this.openDeleteModal.emit(this.alertModal);
  }

  closeDeleteModal(data) {
    if (data) {
      if (!this.records[data.index]._id) {
        this.records.splice(data.index, 1);
        return;
      }
      const url =
        `/admin/flow/utils/node-library/` +
        this.records[data.index]._id;
      this.showLazyLoader = true;
      this.subscriptions['deleteLibrary'] = this.commonService
        .delete('partnerManager', url)
        .subscribe(
          (d) => {
            this.showLazyLoader = false;
            this.records.splice(data.index, 1);
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

  private compare(a: any, b: any) {
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    } else {
      return 0;
    }
  }
  get records() {
    return this.commonFilter.transform(this.customNodeList, 'name', this.searchTerm);
  }

  get app() {
    return this.commonService.app._id;
  }
}
