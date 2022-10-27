import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs/operators';
import * as _ from 'lodash';

import { CommonService } from '../../utils/services/common.service';
import { AppService } from '../../utils/services/app.service';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { CommonFilterPipe } from 'src/app/utils/pipes/common-filter/common-filter.pipe';

@Component({
  selector: 'odp-connectors',
  templateUrl: './connectors.component.html',
  styleUrls: ['./connectors.component.scss'],
  providers: [CommonFilterPipe]
})
export class ConnectorsComponent implements OnInit, OnDestroy {

  connectorList: Array<any> = [];
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
  showNewConnectorWindow: boolean;
  showOptionsDropdown: any;
  selectedItemEvent: any
  selectedConnector: any;
  searchTerm: string;
  sortModel: any;
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
      label: 'Connectors'
    }];

    this.commonService.changeBreadcrumb(this.breadcrumbPaths)
    this.openDeleteModal = new EventEmitter();
    this.form = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(40), Validators.pattern(/\w+/)]],
      type: ['MONGODB', [Validators.required]],
      description: [null, [Validators.maxLength(240), Validators.pattern(/\w+/)]]
    });
    this.showOptionsDropdown = {};
    this.showLazyLoader = true;
    this.sortModel = {};
  }

  ngOnInit() {
    this.showLazyLoader = true;
    this.commonService.apiCalls.componentLoading = false;
    this.getConnectors();
    this.subscriptions['changeApp'] = this.commonService.appChange.subscribe(_app => {
      this.commonService.apiCalls.componentLoading = false;
      this.showLazyLoader = true;
      this.getConnectors();
    });

  }

  ngOnDestroy() {
    Object.keys(this.subscriptions).forEach(e => {
      this.subscriptions[e].unsubscribe();
    });
  }

  newConnector() {
    this.form.reset({ type: 'MONGODB' });
    this.showNewConnectorWindow = true;
  }

  triggerConnectorCreate() {
    const payload = this.form.value;
    payload.app = this.commonService.app._id;
    this.showLazyLoader = true;
    this.commonService.post('user', `/${this.commonService.app._id}/connector`, payload).subscribe(res => {
      this.ts.success('Connector Created.');
      this.appService.editLibraryId = res._id;
      this.showLazyLoader = false;
      this.router.navigate(['/app/', this.commonService.app._id, 'con', res._id]);
    }, err => {
      this.showLazyLoader = false;
      this.commonService.errorToast(err);
    });
  }

  editConnector(_index) {
    this.appService.editLibraryId = this.connectorList[_index]._id;
    this.router.navigate(['/app/', this.app, 'con', this.appService.editLibraryId]);
  }

  getConnectors() {
    if (this.subscriptions['getConnectors']) {
      this.subscriptions['getConnectors'].unsubscribe();
    }
    this.showLazyLoader = true;
    this.connectorList = [];
    this.subscriptions['getConnectors'] = this.commonService.get('user', `/${this.commonService.app._id}/connector/utils/count`)
      .pipe(switchMap((ev: any) => {
        return this.commonService.get('user', `/${this.commonService.app._id}/connector`, { count: ev });
      }))
      .subscribe(res => {
        this.showLazyLoader = false;
        if (res.length > 0) {
          res.forEach(_connector => {
            this.connectorList.push(_connector);
          });
        }
      }, err => {
        this.commonService.errorToast(err, 'We are unable to fetch records, please try again later');
      });
  }

  deleteConnector(_index) {
    this.alertModal.statusChange = false;
    this.alertModal.title = 'Delete connector';
    this.alertModal.message = 'Are you sure you want to delete <span class="text-delete font-weight-bold">'
      + this.connectorList[_index].name + '</span> Connector?';
    this.alertModal.index = _index;
    this.openDeleteModal.emit(this.alertModal);
  }

  closeDeleteModal(data) {
    if (data) {
      const url = `/${this.commonService.app._id}/connector/` + this.connectorList[data.index]._id;
      this.showLazyLoader = true;
      this.subscriptions['deleteConnector'] = this.commonService.delete('user', url).subscribe(_d => {
        this.showLazyLoader = false;
        this.ts.info(_d.message ? _d.message : 'Connector deleted');
        this.getConnectors();
      }, err => {
        this.showLazyLoader = false;
        this.commonService.errorToast(err, 'Unable to delete, please try again later');
      });
    }
  }

  hasPermissionForConnector(id: string) {
    if (this.commonService.isAppAdmin || this.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      const list = this.commonService.getEntityPermissions('CON_' + id);
      if (list.length > 0 && list.find(e => e.id === 'PNCON')) {
        return false;
      } else if (list.length === 0 && !this.hasManagePermission('CON') && !this.hasViewPermission('CON')) {
        return false;
      } else {
        return true;
      }
    }
  }

  canEditConnector(id: string) {
    if (this.commonService.isAppAdmin || this.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      const list = this.commonService.getEntityPermissions('CON_' + id);
      if (list.length > 0 && list.find(e => e.id === 'PMCON')) {
        return true;
      } else if (list.length === 0 && this.hasManagePermission('CON')) {
        return true;
      } else {
        return false;
      }
    }
  }

  hasManagePermission(entity: string) {
    return this.commonService.hasPermission('PMCON', entity);
  }
  hasViewPermission(entity: string) {
    return this.commonService.hasPermission('PVCON', entity);
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
    this.selectedConnector = this.connectorList[i];
    this.showOptionsDropdown[i] = true;
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
    let records = this.commonPipe.transform(this.connectorList, 'name', this.searchTerm);
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

  navigate(id) {
    this.router.navigate(['/app/', this.app, 'con', id])
  }

}
