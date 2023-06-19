import { Component, EventEmitter, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import * as _ from 'lodash'
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';

@Component({
  selector: 'odp-nodes',
  templateUrl: './nodes.component.html',
  styleUrls: ['./nodes.component.scss']
})
export class NodesComponent implements OnInit {
  showNewNodeWindow: boolean;
  showLazyLoader: boolean;
  selectedItemEvent: any;
  selectedLibrary: any;
  nodeList: any;
  @ViewChild('alertModalTemplate', { static: false }) alertModalTemplate: TemplateRef<HTMLElement>;
  alertModalTemplateRef: NgbModalRef;
  form: UntypedFormGroup;
  apiConfig: GetOptions;
  alertModal: {
    statusChange?: boolean;
    title: string;
    message: string;
    index: number;
  };
  searchTerm: string;
  ts: any;
  records: any = [];
  cloneData: null;
  isClone: boolean;
  openDeleteModal: EventEmitter<any>;
  subscriptions: any;
  sortModel: any;
  copied: any;
  breadcrumbPaths: Array<Breadcrumb>;




  constructor(private commonService: CommonService, private appService: AppService,   private router: Router) {
    this.breadcrumbPaths = [{
      active: true,
      label: 'Nodes'
    }];
   }

  ngOnInit(): void {
    this.commonService.changeBreadcrumb(this.breadcrumbPaths);
  
  }

  newNode() {
    this.form.reset({ inputNode: { type: 'API' } });
    this.showNewNodeWindow = true;
  }


  discardDraft(id: string) {
    const flow = this.nodeList.find((e) => e._id === id);
    const flowIndex = this.nodeList.findIndex((e) => e._id === id);
    this.alertModal = {
      title: 'Discard Draft',
      message: 'Are you sure you want to discard draft version?',
      index: 1,
    };
    this.alertModalTemplateRef = this.commonService.modal(
      this.alertModalTemplate,
      { size: 'bm' }
    );
    this.alertModalTemplateRef.result.then(
      (close) => {
        if (close) {
          let request;
          if (flow.status === 'Draft') {
            request = this.commonService.put(
              'partnerManager',
              `/${this.commonService.app._id}/flow/utils/` + id
            );
          } else {
            request = this.commonService.put(
              'partnerManager',
              `/${this.commonService.app._id}/flow/utils/${id}/draftDelete`
            );
          }
          request.subscribe(
            (res) => {
              this.ts.success('Draft Deleted.');
              if (flow.status !== 'Draft') {
                this.router.navigate([
                  '/app/',
                  this.commonService.app._id,
                  'flow',
                  id,
                ]);
              } else {
                if (flowIndex > -1) {
                  this.nodeList.splice(flowIndex, 1);
                }
              }
            },
            (err) => {
              this.commonService.errorToast(err);
            }
          );
        }
      },
      (dismiss) => { }
    );
  }

  editNode(item: any) {
    this.appService.edit = item._id;
    this.router.navigate(['/app/', this.commonService.app._id, 'flow', this.appService.edit,
    ]);
  }

  viewNode(item: any) {
    this.router.navigate(['/app', this.commonService.app._id, 'flow', item._id]);
  }

  deleteNode(index: number) {
    this.alertModal.statusChange = false;
    this.alertModal.title = 'Delete Node?';
    this.alertModal.message =
      'Are you sure you want to delete this flow? This action will delete : ' + this.records[index].name;
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

  showDropDown(event: any, i: number) {
    this.selectedItemEvent = event;
    Object.keys(this.showOptionsDropdown).forEach(key => {
      this.showOptionsDropdown[key] = false;
    })
    this.selectedLibrary = this.nodeList[i];
    this.showOptionsDropdown[i] = true;
  }
  showOptionsDropdown(showOptionsDropdown: any) {
    throw new Error('Method not implemented.');
  }

  // get invalidForm() {
  //   if (this.form.invalid || (this.form.get('type').value === 'PLUGIN' && !this.selectedPlugin)) {
  //     return true;
  //   }
  //   return false;
  // }

  // get selectedPlugin() {
  //   return this.staterPluginList.find(e => e._selected);
  // }
  canManageNode(id: string) {
    if (this.commonService.isAppAdmin || this.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      return this.hasPermission('PMIF');
    }
  }

  canViewNode(id: string) {
    if (this.commonService.isAppAdmin || this.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      return this.hasPermission('PVIF');
    }
  }

  closeDeleteModal(data) {
    if (data) {
      const url =
        `/${this.commonService.app._id}/flow/` +
        this.records[data.index]._id;
      this.showLazyLoader = true;
      this.subscriptions['deleteservice'] = this.commonService
        .delete('partnerManager', url)
        .subscribe(
          (d) => {
            this.showLazyLoader = false;
            this.ts.info(d.message ? d.message : 'Deleting Node...');
            this.records[data.index].status = 'Pending';
            this.commonService.updateDelete(this.records[data.index]._id, 'flow')
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

  getStatusClass(srvc) {
    if (srvc.status.toLowerCase() === 'active') {
      return 'text-success';
    }
    if (srvc.status.toLowerCase() === 'stopped' || srvc.status.toLowerCase() === 'undeployed') {
      return 'text-danger';
    }
    if (srvc.status.toLowerCase() === 'draft') {
      return 'text-accent';
    }
    if (srvc.status.toLowerCase() === 'pending') {
      return 'text-warning';
    }
    return 'text-secondary';
  }

  getStatusLabel(srvc) {
    if (srvc.status.toLowerCase() === 'stopped' || srvc.status.toLowerCase() === 'undeployed') {
      return 'Stopped';
    }
    return srvc.status;
  }

  // copyText(text: string, type: string) {
  //   this.appService.copyToClipboard(text);
  //   this.copied[type] = true;
  //   setTimeout(() => {
  //     this.copied[type] = false;
  //   }, 2000);
  // }

  copyUrl(flow: any) {
    this.copied[flow._id] = true;
    this.appService.copyToClipboard(flow.url);
    setTimeout(() => {
      this.copied[flow._id] = false;
    }, 2000);
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


  canDeleteNode(id: string) {
    return this.hasPermission('PMIF');
  }

  hasPermission(type: string, entity?: string) {
    return this.commonService.hasPermission(type, entity);
  }
  hasWritePermission(entity: string) {
    return this.commonService.hasPermission('PMIF', entity);
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


}
