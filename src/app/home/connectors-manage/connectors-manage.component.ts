import { Component, OnInit, OnDestroy, EventEmitter, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';

import { CommonService, GetOptions } from '../../utils/services/common.service';
import { AppService } from '../../utils/services/app.service';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'odp-connectors-manage',
  templateUrl: './connectors-manage.component.html',
  styleUrls: ['./connectors-manage.component.scss']
})
export class ConnectorsManageComponent implements OnInit, OnDestroy {

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
  connector: any;
  oldData: any;
  edit: any;
  availableConnectors: Array<any>;
  isDeleted: boolean = false;
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
    this.connector = {
      values: {}
    };
    this.availableConnectors = [];
  }

  ngOnInit() {
    this.breadcrumbPaths.push({
      active: false,
      label: 'Connectors',
      url: '/app/' + this.commonService.app._id + '/con'
    });
    this.commonService.changeBreadcrumb(this.breadcrumbPaths)
    this.getAvailableConnectors();
    this.route.params.subscribe(param => {
      if (param.id) {
        if (this.appService.editLibraryId) {
          this.edit.status = true;
          this.appService.editLibraryId = null;
        }
        this.getConnector(param.id);
      }
    });
  }

  getAvailableConnectors() {
    this.showLazyLoader = true;
    this.subscriptions['getAvailableConnectors'] = this.commonService.get('user', `/${this.commonService.app._id}/connector/utils/availableConnectors`).subscribe(res => {
      this.showLazyLoader = false;
      console.log(res);
      this.availableConnectors = res;
    }, err => {
      this.activeTab = 0;
      this.showLazyLoader = false;
      this.commonService.errorToast(err, 'Unable to fetch user groups, please try again later');
    });
  }

  getConnector(id: string) {
    this.showLazyLoader = true;
    this.apiConfig.filter = {
      app: this.commonService.app._id
    };
    this.subscriptions['getConnector'] = this.commonService.get('user', `/${this.commonService.app._id}/connector/` + id, this.apiConfig).subscribe(res => {
      this.showLazyLoader = false;
      if (!res.values || _.isEmpty(res.values)) {
        res.values = {};
      }
      this.connector = res;
      this.oldData = this.appService.cloneObject(res);
      this.breadcrumbPaths.push({
        active: true,
        label: this.connector.name
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
    this.connector.values = {};
    if (val == 'SFTP') {
      this.connector.values.sftpAuthType = 'none';
    }
  }

  saveConnector() {
    const payload = this.appService.cloneObject(this.connector);
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
    if (this.connector._id) {
      response = this.commonService.put('user', `/${this.commonService.app._id}/connector/` + this.connector._id, payload);
    } else {
      response = this.commonService.post('user', `/${this.commonService.app._id}/connector/`, payload);
    }
    this.subscriptions['saveConnector'] = response.subscribe(res => {
      if (!res.values || _.isEmpty(res.values)) {
        res.values = {};
      }
      this.updatedGrpName = res.name;
      this.updatedGrpDesc = res.description;
      this.showLazyLoader = false;
      this.ts.success('Connector saved successfully');
      this.connector = res;
      this.oldData = this.appService.cloneObject(this.connector);
      this.router.navigate(['/app', this.commonService.app._id, 'con']);
    }, err => {
      this.showLazyLoader = false;
      this.commonService.errorToast(err);
    });
  }

  deleteConnector() {
    this.alertModal.statusChange = false;
    this.alertModal.title = 'Delete Connector';
    this.alertModal.message = 'Are you sure you want to delete <span class="text-delete font-weight-bold">'
      + this.connector.name + '</span> Connector?';
    this.alertModal._id = this.connector._id;
    this.openDeleteModal.emit(this.alertModal);
  }

  closeDeleteModal(data) {
    if (data) {
      this.isDeleted = true
      const url = `/${this.commonService.app._id}/connector/${data._id}`
      this.showLazyLoader = true;
      this.subscriptions['deleteConnector'] = this.commonService.delete('user', url).subscribe(d => {
        this.showLazyLoader = false;
        this.ts.success('Connector deleted sucessfully');
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
    const isEqual = _.isEqual(this.connector, this.oldData)
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
      this.connector.values[field] = null;
    }
    else {
      this.connector.values[field] = value;
    }
  }

  getValue(field: string) {
    return this.connector.values[field];
  }

  parseCondition(condition: any) {
    if (!condition) {
      return true;
    }
    return Object.keys(condition).every(key => {
      return this.connector.values[key] == condition[key];
    });
  }

  testConnection() {
    const payload = this.appService.cloneObject(this.connector);
    delete payload?.options
    payload.app = this.commonService.app._id;
    if (!this.canEditGroup) {
      delete payload.name;
      delete payload.description;
    }

    this.subscriptions['saveConnector'] = this.commonService.post('user', `/${this.commonService.app._id}/connector/utils/test`, payload).subscribe(res => {
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
