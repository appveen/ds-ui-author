import { Component, OnInit, OnDestroy, EventEmitter, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs/operators';
import * as _ from 'lodash';

import { GetOptions, CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { CommonFilterPipe } from 'src/app/utils/pipes/common-filter/common-filter.pipe';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'odp-b2b-flows',
  templateUrl: './b2b-flows.component.html',
  styleUrls: ['./b2b-flows.component.scss'],
  providers: [CommonFilterPipe]
})
export class B2bFlowsComponent implements OnInit, OnDestroy {

  @ViewChild('alertModalTemplate', { static: false }) alertModalTemplate: TemplateRef<HTMLElement>;
  alertModalTemplateRef: NgbModalRef;
  form: FormGroup;
  apiConfig: GetOptions;
  flowList: Array<any>;
  alertModal: {
    statusChange?: boolean;
    title: string;
    message: string;
    index: number;
  };
  subscriptions: any;
  showNewFlowWindow: boolean;
  showLazyLoader: boolean;
  showYamlWindow: boolean;
  selectedFlow: any;
  copied: any;
  showOptionsDropdown: any;
  selectedItemEvent: any
  selectedLibrary: any;
  sortModel: any;
  breadcrumbPaths: Array<Breadcrumb>;
  openDeleteModal: EventEmitter<any>;
  searchTerm: string;
  isClone: boolean = false;
  cloneData: any;
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
      type: ['API'],
      inputNode: []
    });
    this.apiConfig = {
      page: 1,
      count: 30
    };
    this.flowList = [];
    this.alertModal = {
      statusChange: false,
      title: '',
      message: '',
      index: -1,
    };
    this.openDeleteModal = new EventEmitter();
    this.copied = {};
    this.showOptionsDropdown = {};
    this.showLazyLoader = true;
    this.sortModel = {};
    this.selectedFlow = {};
    this.breadcrumbPaths = [{
      active: true,
      label: 'Data Pipes'
    }];
  }
  ngOnInit() {
    this.getFlows();
    this.commonService.changeBreadcrumb(this.breadcrumbPaths);
    this.commonService.apiCalls.componentLoading = false;
    this.form.get('type').valueChanges.subscribe(val => {
      const name = this.form.get('name').value;
      this.form.get('inputNode').patchValue({
        _id: this.appService.getNodeID(),
        type: val,
        options: {
          method: 'POST',
          path: name ? _.camelCase(name) : null
        }
      });
    });
    this.form.get('name').valueChanges.subscribe(val => {
      let inputNode = this.form.get('inputNode').value;
      const type = this.form.get('type').value;
      if (!inputNode) {
        inputNode = {
          type: type ? type : 'API'
        };
      }

      if (this.isClone && this.cloneData) {
        this.cloneData['name'] = val;
        inputNode = this.cloneData?.inputNode || inputNode;
        if (inputNode.options) {
          inputNode.options['method'] = 'POST';
          inputNode.options['path'] = val ? '/' + _.camelCase(val) : null;
        }
      }
      else {
        inputNode.options = {
          method: 'POST',
          path: val ? '/' + _.camelCase(val) : null
        };
      }
      this.form.get('inputNode').patchValue(inputNode);
    });
    this.subscriptions.appChange = this.commonService.appChange.subscribe(app => {
      this.getFlows()
    });
    this.subscriptions['flow.delete'] = this.commonService.flow.delete.subscribe(data => {
      this.getFlows()
    });
    this.subscriptions['flow.status'] = this.commonService.flow.status.subscribe(data => {
      this.getFlows()
    });
    this.subscriptions['flow.new'] = this.commonService.flow.new.subscribe(data => {
      this.getFlows()
    });
  }

  ngOnDestroy() {
    Object.keys(this.subscriptions).forEach(e => {
      this.subscriptions[e].unsubscribe();
    });
  }

  newFlow() {
    this.form.reset({ inputNode: { type: 'API' } });
    this.showNewFlowWindow = true;
  }

  triggerFlowCreate() {
    if (this.form.invalid) {
      return;
    }
    this.showLazyLoader = true;
    this.showNewFlowWindow = false;
    const payload = this.form.value;
    payload.app = this.commonService.app._id;
    payload.nodes = [];
    this.commonService.post('partnerManager', `/${this.commonService.app._id}/flow`, payload).subscribe(res => {
      this.showLazyLoader = false;
      this.form.reset({ type: 'API' });
      this.ts.success('Flow has been created.');
      this.appService.edit = res._id;
      this.router.navigate(['/app/', this.commonService.app._id, 'flow', res._id]);
    }, err => {
      this.showLazyLoader = false;
      this.form.reset({ type: 'API' });
      this.commonService.errorToast(err);
    });
  }

  triggerFlowClone() {
    if (this.form.invalid) {
      return;
    }
    this.showLazyLoader = true;
    this.showNewFlowWindow = false;
    const payload = _.cloneDeep(this.form.value);
    payload['dataStructures'] = this.cloneData.dataStructures || [];
    payload['nodes'] = this.cloneData.nodes || [];
    payload.app = this.commonService.app._id;
    this.commonService.post('partnerManager', `/${this.commonService.app._id}/flow`, payload).subscribe(res => {
      this.showLazyLoader = false;
      this.isClone = false;
      this.form.reset({ type: 'API' });
      this.ts.success('Flow has been created.');
      this.appService.edit = res._id;
      this.router.navigate(['/app/', this.commonService.app._id, 'flow', res._id]);
    }, err => {
      this.showLazyLoader = false;
      this.form.reset({ type: 'API' });
      this.isClone = false;
      this.commonService.errorToast(err);
    });
  }

  getFlows() {
    this.showLazyLoader = true;
    this.flowList = [];
    return this.commonService.get('partnerManager', `/${this.commonService.app._id}/flow/utils/count`).pipe(switchMap((count: any) => {
      return this.commonService.get('partnerManager', `/${this.commonService.app._id}/flow`, {
        count: count,
      });
    })).subscribe((res: any) => {
      this.showLazyLoader = false;
      res.forEach(item => {
        item.url = 'https://' + this.commonService.userDetails.fqdn + `/b2b/pipes/${this.app}` + item.inputNode.options.path;
        this.flowList.push(item);
      });
    }, err => {
      this.showLazyLoader = false;
      console.log(err);
      this.commonService.errorToast(err);
    });
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



  canManageFlow(id: string) {
    if (this.commonService.isAppAdmin || this.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      return this.hasPermission('PMIF');
    }
  }

  canDeleteFlow(id: string) {
    return this.hasPermission('PMIF');
  }

  canDeployFlow(flow) {
    if (!flow.draftVersion) {
      return false;
    }
    if (this.commonService.userDetails.isSuperAdmin) {
      return true;
    } else if (
      this.commonService.isAppAdmin &&
      !this.commonService.userDetails.verifyDeploymentUser
    ) {
      return true;
    } else if (
      this.commonService.userDetails.verifyDeploymentUser &&
      this.commonService.userDetails._id === flow._metadata.lastUpdatedBy
    ) {
      return false;
    } else {
      return this.commonService.hasPermission('PMIFPD', 'FLOW');
    }
  }

  canStartStopFlow(id: string) {
    const temp = this.flowList.find((e) => e._id === id);
    if (temp && temp.status !== 'Stopped' && temp.status !== 'Active') {
      return false;
    }
    if (
      this.commonService.isAppAdmin ||
      this.commonService.userDetails.isSuperAdmin
    ) {
      return true;
    } else {
      return this.commonService.hasPermission('PMIFPS', 'FLOW');
    }
  }

  hasPermission(type: string, entity?: string) {
    return this.commonService.hasPermission(type, entity);
  }
  hasWritePermission(entity: string) {
    return this.commonService.hasPermission('PMIF', entity);
  }

  deployFlow(index: number) {
    this.alertModal.statusChange = true;
    if (
      this.flowList[index].status === 'Draft' ||
      this.flowList[index].draftVersion
    ) {
      this.alertModal.title = 'Deploy ' + this.flowList[index].name + '?';
      this.alertModal.message =
        'Are you sure you want to Deploy this data pipe? Once Deployed, "' +
        this.flowList[index].name +
        '" will be running the latest version.';
    } else {
      return;
    }
    this.alertModalTemplateRef = this.commonService.modal(
      this.alertModalTemplate
    );
    this.alertModalTemplateRef.result.then(
      (close) => {
        if (close) {
          const url =
            `/${this.commonService.app._id}/flow/utils/` +
            this.flowList[index]._id +
            '/deploy';
          this.subscriptions['updateservice'] = this.commonService
            .put('partnerManager', url, { app: this.commonService.app._id })
            .subscribe(
              (d) => {
                this.ts.info('Deploying data pipe...');
                this.flowList[index].status = 'Pending';
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

  toggleFlowStatus(index: number) {
    this.alertModal.statusChange = true;

    if (this.flowList[index].status === 'Active') {
      this.alertModal.title = 'Stop ' + this.flowList[index].name + '?';
      this.alertModal.message =
        'Are you sure you want to stop this data pipe? : ' + this.flowList[index].name;
    } else {
      this.alertModal.title = 'Start ' + this.flowList[index].name + '?';
      this.alertModal.message =
        'Are you sure you want to start this data pipe? : ' + this.flowList[index].name;
    }
    this.alertModalTemplateRef = this.commonService.modal(
      this.alertModalTemplate
    );
    this.alertModalTemplateRef.result.then(
      (close) => {
        if (close) {
          let url =
            `/${this.commonService.app._id}/flow/utils/` +
            this.flowList[index]._id +
            '/start';
          if (this.flowList[index].status === 'Active') {
            url =
              `/${this.commonService.app._id}/flow/utils/` +
              this.flowList[index]._id +
              '/stop';
          }
          this.subscriptions['updateservice'] = this.commonService
            .put('partnerManager', url, { app: this.commonService.app._id })
            .subscribe(
              (d) => {
                if (this.flowList[index].status === 'Active') {
                  this.ts.info('Stopping data pipe...');
                } else {
                  this.ts.info('Starting data pipe...');
                }
                this.flowList[index].status = 'Pending';
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

  closeDeleteModal(data) {
    if (data) {
      const url =
        `/${this.commonService.app._id}/flow/` +
        this.flowList[data.index]._id;
      this.showLazyLoader = true;
      this.subscriptions['deleteservice'] = this.commonService
        .delete('partnerManager', url)
        .subscribe(
          (d) => {
            this.showLazyLoader = false;
            this.ts.info(d.message ? d.message : 'Deleting flow...');
            this.flowList[data.index].status = 'Pending';
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

  editFlow(index: number) {
    this.appService.edit = this.flowList[index]._id;
    this.router.navigate(['/app/', this.commonService.app._id, 'flow', this.appService.edit,
    ]);
  }

  viewFlow(item: any) {
    this.router.navigate(['/app', this.commonService.app._id, 'flow', item._id]);
  }

  deleteFlow(index: number) {
    this.alertModal.statusChange = false;
    this.alertModal.title = 'Delete Flow?';
    this.alertModal.message =
      'Are you sure you want to delete this flow? This action will delete : ' + this.flowList[index].name;
    this.alertModal.index = index;
    this.openDeleteModal.emit(this.alertModal);
  }

  cloneFlow(index: number) {
    this.cloneData = null;
    this.form.reset();
    this.isClone = true;
    const temp = this.flowList[index];
    this.form.get('name').patchValue(temp.name + ' Copy');
    this.form.get('type').patchValue(temp.inputNode.type);
    this.form.get('inputNode').patchValue(temp.inputNode);
    this.cloneData = _.cloneDeep(temp);
    console.log(temp)
    this.showNewFlowWindow = true;
  }

  closeYamlWindow() {
    this.showYamlWindow = false;
    this.selectedFlow = null;
  }

  getYamls(index: number) {
    this.selectedFlow = this.flowList[index];

    if (!this.selectedFlow.serviceYaml || !this.selectedFlow.deploymentYaml) {
      this.commonService.get('partnerManager', `/${this.commonService.app._id}/flow/utils/${this.flowList[index]._id}/yamls`, {})
        .subscribe(data => {
          this.selectedFlow.serviceYaml = data.service;
          this.selectedFlow.deploymentYaml = data.deployment;
          this.showYamlWindow = true;
        },
          (err) => {
            this.commonService.errorToast(err);
          });
    } else {
      this.showYamlWindow = true;
    }
  }

  downloadYamls() {
    this.appService.downloadText(this.selectedFlow.name + '.yaml', this.selectedFlow.serviceYaml + '\n---\n' + this.selectedFlow.deploymentYaml);
  }

  copyText(text: string, type: string) {
    this.appService.copyToClipboard(text);
    this.copied[type] = true;
    setTimeout(() => {
      this.copied[type] = false;
    }, 2000);
  }

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

  showDropDown(event: any, i: number) {
    this.selectedItemEvent = event;
    Object.keys(this.showOptionsDropdown).forEach(key => {
      this.showOptionsDropdown[key] = false;
    })
    this.selectedLibrary = this.flowList[i];
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
    let records = this.commonFilter.transform(this.flowList, 'name', this.searchTerm);
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
}




