import { Component, EventEmitter, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as _  from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { AppService } from 'src/app/utils/services/app.service';
import { GetOptions, CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-node-details',
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.scss']
})
export class NodeDetailsComponent {
  @ViewChild('pageChangeModalTemplate', { static: false }) pageChangeModalTemplate;
  subscriptions: any = {};
  activeTab: number;
  apiConfig: GetOptions;
  showLazyLoader: boolean;
  alertModalData: any;
  breadcrumbPaths: Array<Breadcrumb>;
  alertModalRef: NgbModalRef;
  pageChangeModalTemplateRef: NgbModalRef;
  updatedGrpName: string;
  updatedGrpDesc: string;
  openDeleteModal: EventEmitter<any>;
  alertModal: {
    statusChange?: boolean;
    title: string;
    message: string;
    _id: string;
  };
  allUsers: Array<any>;
  node: any;
  oldData: any;
  edit: any;
  availableNodes: Array<any>;
  isDeleted: boolean = false;
  options: any = {}
  changesDone: EventEmitter<any> = new EventEmitter<any>();
  dataStructure: any = {}; 
  toggle: any;
  showDataMapping: boolean = false;

  nodeType: string = 'SYSTEM';
  constructor(private commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private route: ActivatedRoute,
    private ts: ToastrService) {
    this.apiConfig = {};
    this.alertModalData = {};
    this.breadcrumbPaths = [];
    this.updatedGrpName = '';
    this.updatedGrpDesc = '';
    this.openDeleteModal = new EventEmitter();
    this.alertModal = {
      statusChange: false,
      title: '',
      message: '',
      _id: null
    };
    this.edit = {
      status: false
    };
    this.node = {
      values: {}
    };
    this.availableNodes = [];
  }

  ngOnInit() {
    this.breadcrumbPaths.push({
      active: false,
      label: 'Nodes',
      url: '/app/' + this.commonService.app._id + '/node'
    });
    this.commonService.changeBreadcrumb(this.breadcrumbPaths)
    // this.getAvailableNodes();
    this.route.params.subscribe(param => {
      if (param.id) {
        if (this.appService.editLibraryId) {
          this.edit.status = true;
          this.appService.editLibraryId = null;
        }
        // this.getNode(param.id);
      }
    });
  }

  getAvailableNodes() {
    this.showLazyLoader = true;
    this.subscriptions['getAvailableNodes'] = this.commonService.get('config', `/${this.commonService.app._id}/node/utils/availableNodes`).subscribe(res => {
      this.showLazyLoader = false;
      console.log(res);
      this.availableNodes = res;
    }, err => {
      this.activeTab = 0;
      this.showLazyLoader = false;
      this.commonService.errorToast(err, 'Unable to fetch user groups, please try again later');
    });
  }

  getNode(id: string) {
    this.showLazyLoader = true;
    this.apiConfig.filter = {
      app: this.commonService.app._id
    };
    this.subscriptions['getNode'] = this.commonService.get('config', `/${this.commonService.app._id}/node/` + id, this.apiConfig).subscribe(res => {
      this.showLazyLoader = false;
      if (!res.values || _.isEmpty(res.values)) {
        res.values = {};
      }
      this.node = res;
      this.oldData = this.appService.cloneObject(res);
      this.breadcrumbPaths.push({
        active: true,
        label: this.node.name
      });
      this.commonService.changeBreadcrumb(this.breadcrumbPaths)
    }, err => {
      this.activeTab = 0;
      this.showLazyLoader = false;
      this.commonService.errorToast(err, 'Unable to fetch user groups, please try again later');
    });
  }
  ngOnDestroy() {
    Object.keys(this.subscriptions).forEach(e => {
      this.subscriptions[e].unsubscribe();
    });
    if (this.pageChangeModalTemplateRef) {
      this.pageChangeModalTemplateRef.close();
    }
    if (this.alertModalRef) {
      this.alertModalRef.close();
    }
  }

  onTypeChange(val: string) {
    this.node.values = {};
    if (val == 'SFTP') {
      this.node.values.sftpAuthType = 'none';
    }
  }

  saveNode() {
    const payload = this.appService.cloneObject(this.node);
    delete payload?.options
    let response;
    // if (_.isEmpty(payload.values)) {
    //   delete payload.values
    // }
    payload.app = this.commonService.app._id;
    if (!this.canEditGroup) {
      delete payload.name;
      delete payload.description;
    }
    this.showLazyLoader = true;
    if (this.node._id) {
      response = this.commonService.put('config', `/${this.commonService.app._id}/node/` + this.node._id, payload);
    } else {
      response = this.commonService.post('config', `/${this.commonService.app._id}/node/`, payload);
    }
    this.subscriptions['saveNode'] = response.subscribe(res => {
      if (!res.values || _.isEmpty(res.values)) {
        res.values = {};
      }
      this.updatedGrpName = res.name;
      this.updatedGrpDesc = res.description;
      this.showLazyLoader = false;
      this.ts.success('Node saved successfully');
      this.node = res;
      this.oldData = this.appService.cloneObject(this.node);
      this.router.navigate(['/app', this.commonService.app._id, 'con']);
    }, err => {
      this.showLazyLoader = false;
      this.commonService.errorToast(err);
    });
  }


  onFormatChange(event, _){

  }
  deleteNode() {
    this.alertModal.statusChange = false;
    this.alertModal.title = 'Delete Node';
    this.alertModal.message = 'Are you sure you want to delete <span class="text-delete font-weight-bold">'
      + this.node.name + '</span> Node?';
    this.alertModal._id = this.node._id;
    this.openDeleteModal.emit(this.alertModal);
  }

  closeDeleteModal(data) {
    if (data) {
      this.isDeleted = true
      const url = `/${this.commonService.app._id}/node/${data._id}`
      this.showLazyLoader = true;
      this.subscriptions['deleteNode'] = this.commonService.delete('config', url).subscribe(d => {
        this.showLazyLoader = false;
        this.ts.success('Node deleted sucessfully');
        this.router.navigate(['/app', this.commonService.app._id, 'con']);
      }, err => {
        this.showLazyLoader = false;
        this.commonService.errorToast(err, 'Unable to delete, please try again later');
      });
    }
  }

  hasPermission(type: string, entity?: string) {
    return this.commonService.hasPermission(type, entity);
  }

  hasPermissionStartsWith(segment: string) {
    return this.commonService.hasPermissionStartsWith(segment);
  }

  getPermissionObject(type: string, entity: string) {
    return {
      id: type,
      app: this.commonService.app._id,
      entity,
      type: 'author'
    };
  }

  isChangesDone() {
    const isEqual = _.isEqual(this.node, this.oldData)
    return !isEqual;
  }
  canDeactivate(): Promise<boolean> | boolean {
    if (this.isChangesDone() && !this.isDeleted) {
      return new Promise((resolve, reject) => {
        this.pageChangeModalTemplateRef = this.commonService.modal(this.pageChangeModalTemplate);
        this.pageChangeModalTemplateRef.result.then(close => {
          resolve(close);
        }, dismiss => {
          resolve(false);
        });
      });
    }
    return true;
  }

  setValue(field: string, value: string) {
    if (!value) {
      this.node.values[field] = null;
    }
    else {
      this.node.values[field] = value;
    }
  }

  getValue(field: string) {
    return this.node.values[field];
  }

  parseCondition(condition: any) {
    if (!condition) {
      return true;
    }
    return Object.keys(condition).every(key => {
      return this.node.values[key] == condition[key];
    });
  }

  testConnection() {
    const payload = this.appService.cloneObject(this.node);
    payload.app = this.commonService.app._id;
    if (!this.canEditGroup) {
      delete payload.name;
      delete payload.description;
    }

    this.subscriptions['saveNode'] = this.commonService.post('config', `/${this.commonService.app._id}/node/utils/test`, payload).subscribe(res => {
      this.ts.success(res.message);
    }, err => {

      this.commonService.errorToast(err);
    });
  }

  get canEditGroup() {
    if (this.commonService.isAppAdmin || this.commonService.userDetails.isSuperAdmin || this.hasPermissionStartsWith('PMCON')) {
      return true;
    } else {
      const list = this.commonService.getEntityPermissions('CON');
      if (list.length === 0 && this.hasPermission('PMCONBU', 'CON')) {
        return true;
      } else if (list.length > 0 && list.find(e => e.id === 'PMCONBU')) {
        return true;
      } else {
        return false;
      }
    }
  }

  get editBasicDetails() {
    if (this.commonService.hasPermission('PMCONBU')) {
      return true;
    }
    return false;
  }
}

