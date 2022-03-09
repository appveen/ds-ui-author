import { Component, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-faas-cell',
  templateUrl: './faas-cell.component.html',
  styleUrls: ['./faas-cell.component.scss']
})
export class FaasCellComponent implements ICellRendererAngularComp {

  params: ICellRendererParams;
  field: string;
  value: any;
  openDeleteModal: EventEmitter<any>;
  showLazyLoader: boolean;
  alertModal: {
    statusChange?: boolean;
    title: string;
    message: string;
    index: number;
  };

  constructor(private commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private ts: ToastrService) {
    this.openDeleteModal = new EventEmitter();
    this.alertModal = {
      statusChange: false,
      title: '',
      message: '',
      index: -1
    };
  }
  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.value = params.value;
    this.field = params.colDef.field;
  }

  refresh(params: ICellRendererParams): boolean {
    return true;
  }

  redirectToManage(edit?: boolean) {
    this.appService.edit = edit;
    this.router.navigate(['/app', this.commonService.app._id, 'faas', this.data?._id]);
  }

  deleteFaas() {
    this.alertModal.title = 'Delete Function?';
    this.alertModal.message = 'Are you sure you want to delete <span class="text-delete font-weight-bold">'
      + this.data.name + '</span> Function?';
    this.openDeleteModal.emit(this.alertModal);
  }

  stopFaas(data) {
    this.data.app = this.commonService.app._id;
    data.status = 'Undeployed';
    let request;
    request = this.commonService.put('partnerManager', `/${this.commonService.app._id}/faas/${data._id}/stop`, data);
    request.subscribe(res => {
      this.ts.success('Stopped ' + data.name + ' function.');
    }, err => {
      this.commonService.errorToast(err);
    });

  }

  startFaas(data) {
    this.data.app = this.commonService.app._id;
    data.status = 'Pending';
    let request;
    request = this.commonService.put('partnerManager', `/${this.commonService.app._id}/faas/${data._id}/start`, data);
    request.subscribe(res => {
      this.ts.success('Started ' + data.name + ' function.');
    }, err => {
      this.commonService.errorToast(err);
    });

  }

  closeDeleteModal(data) {
    if (data) {
      this.showLazyLoader = true;
      this.commonService
        .delete('partnerManager', `/${this.commonService.app._id}/faas/${this.data._id}`).subscribe(_d => {
          this.showLazyLoader = false;
          this.ts.info(_d.message ? _d.message : 'Function deleted Successfully');
          this.params.api.purgeInfiniteCache();
        }, err => {
          this.showLazyLoader = false;
          this.commonService.errorToast(err, 'Oops, something went wrong. Please try again later.');
        });
    }
  }

  copyUrl() {
    const url = this.fqdn + this.data.url;
    this.appService.copyToClipboard(url);
  }

  get data() {
    if (this.params && this.params.node && this.params.node.data) {
      return this.params.node.data;
    }
    return {};
  }

  get fqdn() {
    if (this.commonService.userDetails && this.commonService.userDetails.fqdn) {
      return this.commonService.userDetails.fqdn;
    }
    return '-';
  }
  get hasManagePermission() {
    return this.commonService.hasPermission('PMF')
  }

  get hasStartStopPermission() {
    return this.commonService.hasPermission('PMFPS')
  }
}
