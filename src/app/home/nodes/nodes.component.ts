import { Component, EventEmitter, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import * as _ from 'lodash'
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { switchMap } from 'rxjs/operators';

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
  form: UntypedFormGroup = new UntypedFormGroup({});
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
  cloneData: boolean = false;
  isClone: boolean;
  openDeleteModal: EventEmitter<any> = new EventEmitter<any>();
  subscriptions: any;
  sortModel: any;
  copied: any;
  breadcrumbPaths: Array<Breadcrumb>;




  constructor(private commonService: CommonService, private appService: AppService,   private router: Router,  private fb: UntypedFormBuilder,) {
    this.breadcrumbPaths = [{
      active: true,
      label: 'Nodes'
    }];

    this.subscriptions = {};
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(40), Validators.pattern(/\w+/)]],
      description: [null, [Validators.maxLength(240), Validators.pattern(/\w+/)]],
      type: ['SYSTEM', [Validators.required]],
      inputNode: []
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
    this.copied = {};
    this.showLazyLoader = true;
    this.sortModel = {};
    this.appService.invokeEvent.subscribe(res => {
       this.getNodes();
    });
   }

  ngOnInit(): void {
    this.commonService.changeBreadcrumb(this.breadcrumbPaths);
    this.getNodes();
  
  }

  newNode() {
    this.form.reset({  type: 'SYSTEM' });
    this.showNewNodeWindow = true;
  }

  getNodes() {
    this.showLazyLoader = true;
    this.nodeList = [];
    return this.commonService.get('config', `/${this.commonService.app._id}/processflow/utils/count`).pipe(switchMap((count: any) => {
      return this.commonService.get('config', `/${this.commonService.app._id}/processflow/node`, {
        count: count,
      });
    })).subscribe((res: any) => {
      this.showLazyLoader = false;
      // res.forEach(item => {
      //   item.url = 'https://' + this.commonService.userDetails.fqdn + `/b2b/pipes/${this.app}` + item.inputNode.options.path;
      //   // this.flowList.push(item);
      // });
      this.nodeList = res;
      this.nodeList.forEach(e => {
        if (e.status == 'Pending') {
          this.commonService.updateStatus(e._id, 'node');
        }
      })
    }, err => {
      this.showLazyLoader = false;
      console.log(err);
      this.commonService.errorToast(err);
    });
  }

  triggerNodeCreate() {
    if (this.form.invalid) {
      return;
    }
    this.showLazyLoader = true;
    this.showNewNodeWindow = false;
    const payload = this.form.value;
    // payload['category'] = this.form.get('type').value;
    payload.app = this.commonService.app._id;
    payload.nodes = [];
    this.commonService.post('config', `/${this.commonService.app._id}/processflow/node/`, payload).subscribe(res => {
      this.showLazyLoader = false;
      this.form.reset({ type: 'SYSTEM' });
      this.ts.success('Node has been created.');
      this.appService.edit = res._id;
      this.router.navigate(['/app/', this.commonService.app._id, 'node', res._id]);
    }, err => {
      this.showLazyLoader = false;
      this.form.reset({ type: 'SYSTEM' });
      this.commonService.errorToast(err);
    });
  }

  triggerNodeClone() {
    if (this.form.invalid) {
      return;
    }
    this.showLazyLoader = true;
    this.showNewNodeWindow = false;
    // const payload = _.cloneDeep(this.form.value);
    // payload['dataStructures'] = this.cloneData.dataStructures || [];
    // payload['nodes'] = this.cloneData.nodes || [];
    // payload.app = this.commonService.app._id;
    const keyArray = ['deploymentName', '_id', '_metadata', 'lastInvoked', 'status', 'version', 'url'];
    // keyArray.forEach(key => {
    //   delete this.cloneData[key];
    // });
    const val = this.form.get('name').value
    // this.cloneData.name = val;
    // this.cloneData.inputNode = { ...this.cloneData.inputNode, ...this.form.get('inputNode').value };
    // this.cloneData.inputNode.options.path = val ? '/' + _.camelCase(val) : null;
    this.commonService.post('config', `/${this.commonService.app._id}/node`, this.cloneData).subscribe(res => {
      this.showLazyLoader = false;
      this.isClone = false;
      this.form.reset({ type: 'SYSTEM' });
      this.ts.success('Node has been cloned.');
      this.appService.edit = res._id;
      this.router.navigate(['/app/', this.commonService.app._id, 'node', res._id]);
    }, err => {
      this.showLazyLoader = false;
      this.form.reset({ type: 'SYSTEM' });
      this.isClone = false;
      this.commonService.errorToast(err);
    });
  }


  discardDraft(id: string) {
    const node = this.nodeList.find((e) => e._id === id);
    const nodeIndex = this.nodeList.findIndex((e) => e._id === id);
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
          if (node.status === 'Draft') {
            request = this.commonService.put(
              'config',
              `/${this.commonService.app._id}/processflow/node/` + id
            );
          } else {
            request = this.commonService.put(
              'config',
              `/${this.commonService.app._id}/processflow/node/${id}/draftDelete`
            );
          }
          request.subscribe(
            (res) => {
              this.ts.success('Draft Deleted.');
              if (node.status !== 'Draft') {
                this.router.navigate([
                  '/app/',
                  this.commonService.app._id,
                  'node',
                  id,
                ]);
              } else {
                if (nodeIndex > -1) {
                  this.nodeList.splice(nodeIndex, 1);
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
    this.router.navigate(['/app/', this.commonService.app._id, 'node', this.appService.edit,
    ]);
  }

  viewNode(item: any) {
    this.router.navigate(['/app', this.commonService.app._id, 'node', item._id]);
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
    this.form.get('type').patchValue(temp.category);
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

  // get selectedPlugin() {
  //   return this.staterPluginList.find(e => e._selected);
  // }
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

  closeDeleteModal(data) {
    if (data) {
      const url =
        `/${this.commonService.app._id}/node/` +
        this.records[data.index]._id;
      this.showLazyLoader = true;
      this.subscriptions['deleteservice'] = this.commonService
        .delete('config', url)
        .subscribe(
          (d) => {
            this.showLazyLoader = false;
            this.ts.info(d.message ? d.message : 'Deleting Node...');
            this.records[data.index].status = 'Pending';
            this.commonService.updateDelete(this.records[data.index]._id, 'node')
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

  copyUrl(node: any) {
    this.copied[node._id] = true;
    this.appService.copyToClipboard(node.url);
    setTimeout(() => {
      this.copied[node._id] = false;
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
    return this.hasPermission('PMPN');
  }

  hasPermission(type: string, entity?: string) {
    return this.commonService.hasPermission(type, entity);
  }
  hasWritePermission(entity: string) {
    return this.commonService.hasPermission('PMPN', entity);
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

  get invalidForm() {
    if (this.form.invalid) {
      return true;
    }
    return false;
  }


}
