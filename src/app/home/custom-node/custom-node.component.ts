import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs/operators';
import * as _ from 'lodash';

import { GetOptions, CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { CommonFilterPipe } from 'src/app/utils/pipes/common-filter/common-filter.pipe';


@Component({
  selector: 'odp-custom-node',
  templateUrl: './custom-node.component.html',
  styleUrls: ['./custom-node.component.scss'],
  providers: [CommonFilterPipe]
})
export class CustomNodeComponent implements OnInit {

  form: FormGroup;
  apiConfig: GetOptions;
  nodeList: Array<any>;
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
  showOptionsDropdown: any;
  selectedItemEvent: any
  selectedLibrary: any;
  sortModel: any;
  breadcrumbPaths: Array<Breadcrumb>;
  openDeleteModal: EventEmitter<any>;
  searchTerm: string;
  isClone: boolean;
  isEdit: boolean;
  cloneData: any;
  showEditNodeWindow: boolean;
  constructor(public commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private ts: ToastrService,
    private fb: FormBuilder,
    private commonFilter: CommonFilterPipe) {
    this.subscriptions = {};
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(40), Validators.pattern(/\w+/)]],
      description: [null, [Validators.maxLength(240), Validators.pattern(/\w+/)]],
      code: [],
      category: [],
      type: []
    });
    this.apiConfig = {
      page: 1,
      count: 30
    };
    this.nodeList = [];
    this.alertModal = {
      statusChange: false,
      title: '',
      message: '',
      index: -1,
    };
    this.openDeleteModal = new EventEmitter();
    this.showOptionsDropdown = {};
    this.showLazyLoader = true;
    this.sortModel = {};
    this.selectedNode = {};
    this.breadcrumbPaths = [{
      active: true,
      label: 'Process Nodes'
    }];
  }
  ngOnInit() {
    this.getNodes();
    this.commonService.changeBreadcrumb(this.breadcrumbPaths);
    this.commonService.apiCalls.componentLoading = false;
  }

  ngOnDestroy() {
    Object.keys(this.subscriptions).forEach(e => {
      this.subscriptions[e].unsubscribe();
    });
  }

  newNode() {
    this.form.get('category').clearValidators();
    this.form.get('type').clearValidators();
    this.form.reset({});
    this.showNewNodeWindow = true;
  }

  triggerNodeCreate() {
    if (this.form.invalid) {
      return;
    }
    this.showLazyLoader = true;
    this.showNewNodeWindow = false;
    const payload = this.form.value;
    payload.app = this.commonService.app._id;
    payload.nodes = [];
    this.commonService.post('partnerManager', `/${this.commonService.app._id}/node`, payload).subscribe(res => {
      this.showLazyLoader = false;
      this.ts.success('Process Node has been created.');
      this.getNodes();
    }, err => {
      this.showLazyLoader = false;
      this.commonService.errorToast(err);
    });
  }

  triggerNodeClone() {
    if (this.form.invalid) {
      return;
    }
    this.showLazyLoader = true;
    this.showNewNodeWindow = false;
    const keyArray = ['deploymentName', '_id', '_metadata', 'version'];
    keyArray.forEach(key => {
      delete this.cloneData[key];
    });
    const val = this.form.get('name').value
    this.cloneData.name = val;
    this.cloneData.inputNode.options.path = val ? '/' + _.camelCase(val) : null;
    this.commonService.post('partnerManager', `/${this.commonService.app._id}/node`, this.cloneData).subscribe(res => {
      this.showLazyLoader = false;
      this.isClone = false;
      this.ts.success('Process Node has been cloned.');
      this.getNodes();
    }, err => {
      this.showLazyLoader = false;
      this.isClone = false;
      this.commonService.errorToast(err);
    });
  }

  getNodes() {
    this.showLazyLoader = true;
    this.nodeList = [];
    return this.commonService.get('partnerManager', `/${this.commonService.app._id}/node/utils/count`).pipe(switchMap((count: any) => {
      return this.commonService.get('partnerManager', `/${this.commonService.app._id}/node`, {
        count: count,
      });
    })).subscribe((res: any) => {
      this.showLazyLoader = false;
      this.nodeList = res;
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
  closeDeleteModal(data) {
    if (data) {
      const url =
        `/${this.commonService.app._id}/node/` +
        this.records[data.index]._id;
      this.showLazyLoader = true;
      this.subscriptions['deleteservice'] = this.commonService
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

  editNode(item: any) {
    // this.appService.edit = item._id;
    // this.router.navigate(['/app/', this.commonService.app._id, 'node', this.appService.edit]);
    if (!item.code || !item.code.trim()) {
      item.code = '// do something\nreturn state;'
    }
    this.form.patchValue(item);
    this.form.get('category').setValidators([Validators.required]);
    this.form.get('type').setValidators([Validators.required]);
    this.showEditNodeWindow = true;
    this.isEdit = true;
  }

  viewNode(item: any) {
    // this.router.navigate(['/app', this.commonService.app._id, 'node', item._id]);
    if (!item.code || !item.code.trim()) {
      item.code = '// do something\nreturn state;'
    }
    this.form.patchValue(item);
    this.form.get('category').setValidators([Validators.required]);
    this.form.get('type').setValidators([Validators.required]);
    this.showEditNodeWindow = true;
    this.isEdit = false;
  }

  deleteNode(index: number) {
    this.alertModal.statusChange = false;
    this.alertModal.title = 'Delete Node?';
    this.alertModal.message =
      'Are you sure you want to delete this node? This action will delete : ' + this.records[index].name;
    this.alertModal.index = index;
    this.openDeleteModal.emit(this.alertModal);
  }

  cloneNode(item: any) {
    this.cloneData = null;
    this.form.reset();
    this.isClone = true;
    const temp = item;
    this.form.get('name').patchValue(temp.name + ' Copy');
    this.form.get('type').patchValue(temp.inputNode.type);
    this.form.get('inputNode').patchValue(temp.inputNode);
    this.cloneData = _.cloneDeep(temp);
    console.log(temp)
    this.showNewNodeWindow = true;
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
    this.selectedLibrary = this.nodeList[i];
    this.showOptionsDropdown[i] = true;
  }

  saveNode() {

  }

  triggerSaveNode() {

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
    let records = this.commonFilter.transform(this.nodeList, 'name', this.searchTerm);
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

  get code() {
    return this.form.get('code').value;
  }

  set code(data: string) {
    this.form.get('code').patchValue(data);
  }
}
