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

  closeDeleteModal(data) {
    if (data) {
      this.showLazyLoader = true;
      this.commonService
        .delete('partnerManager', '/faas/' + this.data._id).subscribe(_d => {
          this.showLazyLoader = false;
          this.ts.info(_d.message ? _d.message : 'Function deleted Successfully');
          this.params.api.purgeInfiniteCache();
        }, err => {
          this.showLazyLoader = false;
          this.commonService.errorToast(err, 'Oops, something went wrong. Please try again later.');
        });
    }
  }

  get data() {
    if (this.params && this.params.node && this.params.node.data) {
      return this.params.node.data;
    }
    return {};
  }
}
