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
  selector: 'odp-custom-node',
  templateUrl: './custom-node.component.html',
  styleUrls: ['./custom-node.component.scss'],
  providers: [CommonFilterPipe]
})
export class CustomNodeComponent implements OnInit {

  form: FormGroup;
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
  sortModel: any;
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
    private fb: FormBuilder,
    private commonFilter: CommonFilterPipe) {
    this.subscriptions = {};
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(40), Validators.pattern(/\w+/)]],
      description: [null, [Validators.maxLength(240), Validators.pattern(/\w+/)]],
      category: ['', [Validators.required, Validators.maxLength(24), Validators.pattern(/\w+/)]],
      type: ['', [Validators.required, Validators.maxLength(24), Validators.pattern(/\w+/)]],
      code: []
    });
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
    this.sortModel = {};
    this.params = [];
    this.categoryList = [
      {
        label: 'File',
        value: 'FILE'
      },
      {
        label: 'API',
        value: 'API'
      },
      {
        label: 'Transform',
        value: 'TRANSFORM'
      },
      {
        label: 'Miscellaneous',
        value: 'MISC'
      }
    ];
  }
  ngOnInit() {
    this.getNodes();
    this.commonService.apiCalls.componentLoading = false;
  }

  ngOnDestroy() {
    Object.keys(this.subscriptions).forEach(e => {
      this.subscriptions[e].unsubscribe();
    });
  }

  newNode() {
    this.form.reset({ type: 'PROCESS', category: 'MISC' });
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
    this.commonService.post('partnerManager', `/admin/node`, payload).subscribe(res => {
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
    this.commonService.post('partnerManager', `/admin/node`, this.cloneData).subscribe(res => {
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
    this.customNodeList = [];
    return this.commonService.get('partnerManager', `/admin/node/utils/count`, { noApp: true }).pipe(switchMap((count: any) => {
      return this.commonService.get('partnerManager', `/admin/node`, {
        count: count,
        noApp: true
      });
    })).subscribe((res: any) => {
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
  closeDeleteModal(data) {
    if (data) {
      const url =
        `/admin/node/` +
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

  selectNode(item: any) {
    if (!item.code || !item.code.trim()) {
      item.code = '// do something\nreturn state;';
    }
    if (!item.type || !item.type.trim()) {
      item.type = 'PROCESS';
    }
    if (!item.category || !item.category.trim()) {
      item.category = 'MISC';
    }
    this.selectedNode = null;
    this.params = item.params || [];
    setTimeout(() => {
      this.selectedNode = item;
    }, 100);
    this.isEdit = true;
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

  saveNode() {
    this.selectedNode.params = this.params;
    const url = `/admin/node/` + this.selectedNode._id;
    this.showLazyLoader = true;
    this.commonService
      .put('partnerManager', url, this.selectedNode)
      .subscribe(
        (d) => {
          this.showLazyLoader = false;
          this.getNodes();
          this.ts.success('Node Saved Successfully');
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

  triggerSaveNode() {

  }

  addParam() {
    this.params.push({ htmlType: 'input', dataType: 'text' });
  }

  removeParam(index: number) {
    this.params.splice(index, 1);
  }

  convertToKey(value: string, item: any) {
    item.key = this.appService.toCamelCase(value);
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
    let records = this.commonFilter.transform(this.customNodeList, 'name', this.searchTerm);
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

  get isInvalid() {
    if (!this.selectedNode) {
      return true;
    }
    if (!this.selectedNode.name || !this.selectedNode.name.trim()) {
      return true;
    }
    if (!this.selectedNode.type || !this.selectedNode.type.trim()) {
      return true;
    }
    if (!this.selectedNode.category || !this.selectedNode.category.trim()) {
      return true;
    }
    return false;
  }
}
