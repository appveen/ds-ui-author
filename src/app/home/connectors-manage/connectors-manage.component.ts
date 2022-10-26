import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs/operators';
import * as _ from 'lodash';

import { CommonService } from '../../utils/services/common.service';
import { AppService } from '../../utils/services/app.service';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';

@Component({
  selector: 'odp-connectors-manage',
  templateUrl: './connectors-manage.component.html',
  styleUrls: ['./connectors-manage.component.scss']
})
export class ConnectorsManageComponent implements OnInit, OnDestroy {

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
  edit: any;
  connectorData: any;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private route: ActivatedRoute,
    private ts: ToastrService) {
    this.edit = {
      status: false
    };
    this.alertModal = {
      statusChange: false,
      title: '',
      message: '',
      index: -1
    };
    this.breadcrumbPaths = [{
      active: false,
      label: 'Connectors',
      url: '/app/' + this.commonService.app._id + '/con'
    }];

    this.commonService.changeBreadcrumb(this.breadcrumbPaths)
    this.openDeleteModal = new EventEmitter();
    this.showLazyLoader = true;
  }

  ngOnInit() {
    this.showLazyLoader = true;
    this.commonService.apiCalls.componentLoading = false;
    this.route.params.subscribe(params => {
      if (params.id) {
        this.edit.id = params.id;
        if (this.appService.editLibraryId) {
          this.appService.editLibraryId = null;
          this.edit.status = true;
        }
        this.getConnector(params.id);
      }
    });
  }

  ngOnDestroy() {
    Object.keys(this.subscriptions).forEach(e => {
      this.subscriptions[e].unsubscribe();
    });
  }

  getConnector(id: string) {
    if (this.subscriptions['getConnector']) {
      this.subscriptions['getConnector'].unsubscribe();
    }
    this.showLazyLoader = true;
    this.connectorList = [];
    this.subscriptions['getConnector'] = this.commonService.get('user', `/${this.commonService.app._id}/connector/${id}`)
      .subscribe(res => {
        this.showLazyLoader = false;
        this.connectorData = res;
        this.breadcrumbPaths.push({
          active: true,
          label: res.name + (this.edit.status ? ' (Edit)' : '')
        });
        this.commonService.changeBreadcrumb(this.breadcrumbPaths)
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

  hasManagePermission(entity: string) {
    return this.commonService.hasPermission('PMCON', entity);
  }
  hasViewPermission(entity: string) {
    return this.commonService.hasPermission('PVCON', entity);
  }

  get app() {
    return this.commonService.app._id;
  }

}
