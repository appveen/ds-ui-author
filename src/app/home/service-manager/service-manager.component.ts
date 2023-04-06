import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';

import {
  CommonService,
  GetOptions,
} from 'src/app/utils/services/common.service';
import { environment } from 'src/environments/environment';
import { AppService } from 'src/app/utils/services/app.service';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { switchMap } from 'rxjs/operators';
import { CommonFilterPipe } from 'src/app/utils/pipes/common-filter/common-filter.pipe';
@Component({
  selector: 'odp-service-manager',
  templateUrl: './service-manager.component.html',
  styleUrls: ['./service-manager.component.scss'],
  providers: [CommonFilterPipe]
})
export class ServiceManagerComponent implements OnInit, OnDestroy {

  @ViewChild('alertModalTemplate', { static: false })
  alertModalTemplate: TemplateRef<HTMLElement>;

  serviceList: Array<any> = [];
  service: GetOptions;
  alertModal: {
    statusChange?: boolean;
    title: string;
    message: string;
    index: number;
  };
  showLazyLoader = true;
  // changeAppSubscription: any;
  subscriptions: any = {};
  showAddButton: boolean;
  breadcrumbPaths: Array<Breadcrumb>;
  openDeleteModal: EventEmitter<any>;
  form: FormGroup;
  cloneForm: FormGroup;
  alertModalTemplateRef: NgbModalRef;
  cloneData: any;
  easterEggEnabled: boolean;
  serviceRecordCounts: Array<any>;
  toggleImportWizard: boolean;
  showNewServiceWindow: boolean;
  showCloneServiceWindow: boolean;
  showYamlWindow: boolean;
  selectedService: any;
  copied: any;
  searchTerm: string;
  showOptionsDropdown: any;
  selectedItemEvent: any;
  sortModel: any;
  connectorList: Array<any>;
  defaultDC: any;
  defaultFC: any;
  mongoList: any[];
  tables: any[] = [];
  showDropdownOptions: any;
  constructor(
    public commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private fb: FormBuilder,
    private ts: ToastrService,
    private commonPipe: CommonFilterPipe
  ) {
    this.breadcrumbPaths = [{
      active: true,
      label: 'Data Services',
      url: null
    }];
    this.commonService.changeBreadcrumb(this.breadcrumbPaths)
    this.alertModal = {
      statusChange: false,
      title: '',
      message: '',
      index: -1,
    };
    this.openDeleteModal = new EventEmitter();
    const connectorForm = this.fb.group({
      data: [{}],
      file: [{}]
    })
    this.form = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(40), Validators.pattern(/\w+/)]],
      connectors: connectorForm,
      description: [null, [Validators.maxLength(240), Validators.pattern(/\w+/)]],
      schemaFree: []
    });

    this.cloneForm = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(40), Validators.pattern(/\w+/)]],
      description: [null, [Validators.maxLength(240), Validators.pattern(/\w+/)]],
      desTab: [true],
      intTab: [false],
      expTab: [false],
      rolTab: [false],
      setTab: [false],
    });
    this.serviceRecordCounts = [];
    window['imadeveloper'] = () => {
      this.easterEggEnabled = true;
      this.ts.success('You are Developer!');
    };
    this.copied = {};
    this.selectedService = {};
    this.showOptionsDropdown = {};
    this.sortModel = {};
  }

  ngOnInit() {
    this.showLazyLoader = true;
    // this.resetSearch();
    this.getServices();
    this.getConnectors();
    this.commonService.apiCalls.componentLoading = false;
    this.subscriptions['entity.delete'] = this.commonService.entity.delete.subscribe((data) => {
      const index = this.serviceList.findIndex((s) => {
        if (s._id === data) {
          return s;
        }
      });
      this.ts.success('Deleted ' + this.serviceList[index].name + '.');
      if (index > -1) {
        this.serviceList.splice(index, 1);
      }
    });
    this.subscriptions['entity.status'] = this.commonService.entity.status.subscribe((data) => {
      const index = this.serviceList.findIndex(e =>e._id === data[0]._id);
      if (index !== -1) {
        this.serviceList[index].status = data[0].status;
      }
      if (data[0].status === 'Undeployed') {
        this.ts.success('Stopped ' + this.serviceList[index].name + '.');
      } else if (data[0].message === 'Deployed') {
        this.ts.success('Started ' + this.serviceList[index].name + '.');
      }
      //  else if (data[0].status === 'Pending') {
      //   this.serviceList[index].status = 'Pending';
      // }
      this.getLatestRecord(this.serviceList[index], index);
    });
    this.subscriptions['entity.new'] = this.commonService.entity.new.subscribe((data) => {
      const index = this.serviceList.findIndex((s) => {
        if (s._id === data._id) {
          return s;
        }
      });
      if (index > -1) {
        this.serviceList[index].status = 'Active';
      } else {
        this.commonService
          .get(
            'serviceManager',
            `/${this.commonService.app._id}/service/` + data._id,
            { filter: { app: this.commonService.app._id } }
          )
          .subscribe(
            (service) => {
              // this.setServiceDetails(service);
              // this.serviceList.push(service);
            },
            (err) => {
              this.commonService.errorToast(err);
            }
          );
      }
    });

    this.commonService.appChange.subscribe((_app: any) => {
      this.showLazyLoader = true;
      this.commonService.apiCalls.componentLoading = false;
      this.getServices();
      this.getConnectors();
    });
    // this.form.get('name').valueChanges.subscribe(_val => {
    //   this.form.controls.api.patchValue('/' + _.camelCase(_val));
    //   this.form.get(['definition', 0, '_id', 'prefix']).patchValue(_.toUpper(_.camelCase(_val.substring(0, 3))));
    //   this.form.get(['definition', 0, '_id', 'counter']).patchValue(1001);
    // });
  }



  getConnectors() {
    const filter = {
      "options.isValid": true
    }
    if (this.subscriptions?.['getConnectors']) {
      this.subscriptions['getConnectors'].unsubscribe();
    }
    this.subscriptions['getConnectors'] = this.commonService.get('user', `/${this.commonService.app._id}/connector/utils/count`)
      .pipe(switchMap((ev: any) => {
        return this.commonService.get('user', `/${this.commonService.app._id}/connector`, { count: ev, select: '_id, name, category, type, options, _metadata', filter: filter });
      }))
      .subscribe(res => {
        this.connectorList = res;
        this.mongoList = res.filter(ele => ele.type === 'MONGODB');
        if (res.length > 0) {
          this.defaultDC = res.filter(ele => ele.category === 'DB').find(ele => this.checkDefault(ele._id))?._id;
          this.defaultFC = res.filter(ele => ele.category === 'STORAGE').find(ele => this.checkDefault(ele._id))?._id;
        }
        this.appService.connectorsList = res;
      }, err => {
        this.commonService.errorToast(err, 'We are unable to fetch records, please try again later');
      });

  }

  ngOnDestroy() {
    Object.keys(this.subscriptions).forEach((e) => {
      this.subscriptions[e].unsubscribe();
    });
    if (this.alertModalTemplateRef) {
      this.alertModalTemplateRef.close();
    }
  }

  newService() {
    this.form.reset({ name: this.searchTerm });
    this.form.get('schemaFree').setValue(false);
    this.form.get('connectors').get('data').setValue({
      _id: this.defaultDC
    })
    this.fetchTables(this.defaultDC)
    this.form.get('connectors').get('file').setValue({
      _id: this.defaultFC
    })
    this.showNewServiceWindow = true;
  }

  viewService(selectedRow: number) {
    this.router.navigate(['/app', this.app, 'sb', this.records[selectedRow]._id]);
  }

  discardDraft(id: string) {
    const service = this.serviceList.find((e) => e._id === id);
    const serviceIndex = this.serviceList.findIndex((e) => e._id === id);
    this.alertModal = {
      title: 'Discard Draft',
      message: 'Are you sure you want to discard draft version?',
      index: 1,
    };
    this.alertModalTemplateRef = this.commonService.modal(
      this.alertModalTemplate,
      { size: 'sm' }
    );
    this.alertModalTemplateRef.result.then(
      (close) => {
        if (close) {
          let request;
          if (service.status === 'Draft') {
            request = this.commonService.delete(
              'serviceManager',
              `/${this.commonService.app._id}/service/` + id
            );
          } else {
            request = this.commonService.delete(
              'serviceManager',
              `/${this.commonService.app._id}/service/utils/${id}/draftDelete`
            );
          }
          request.subscribe(
            (res) => {
              this.ts.success('Draft Deleted.');
              if (service.status !== 'Draft') {
                this.router.navigate([
                  '/app/',
                  this.commonService.app._id,
                  'sb',
                  id,
                ]);
              } else {
                if (serviceIndex > -1) {
                  this.serviceList.splice(serviceIndex, 1);
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

  triggerServiceCreate() {
    const payload = this.form.value;
    payload.app = this.commonService.app._id;
    this.showLazyLoader = true;
    payload.versionValidity = this.commonService.app.serviceVersionValidity;

    if (!this.hasPermission('PMDSSDH', 'SM')) {
      delete payload.versionValidity;
    }

    this.commonService
      .post('serviceManager', `/${this.commonService.app._id}/service`, payload)
      .subscribe(
        (res) => {
          this.ts.success('Service Created.');
          this.appService.editServiceId = res._id;
          this.showLazyLoader = false;

          this.router.navigate([
            '/app/',
            this.commonService.app._id,
            'sb',
            res._id,
          ]);
        },
        (err) => {
          this.showLazyLoader = false;
          this.commonService.errorToast(err);
        }
      );
  }

  editService(index: number) {
    this.appService.editServiceId = this.records[index]._id;
    this.router.navigate([
      '/app/',
      this.commonService.app._id,
      'sb',
      this.appService.editServiceId,
    ]);
  }

  repairService(index: number) {
    const url =
      `/${this.commonService.app._id}/service/utils/` +
      this.records[index]._id +
      '/repair';
    this.subscriptions['updateservice'] = this.commonService
      .put('serviceManager', url, null)
      .subscribe(
        (d) => {
          this.ts.info('Repairing data service...');
          this.records[index].status = 'Pending';
        },
        (err) => {
          this.commonService.errorToast(err);
        }
      );
  }

  getYamls(index: number) {
    this.selectedService = this.records[index];
    if (!this.selectedService.serviceYaml || !this.selectedService.deploymentYaml) {
      const url = `/${this.commonService.app._id}/service/utils/${this.selectedService._id}/yamls`;
      this.subscriptions['updateservice'] = this.commonService
        .get('serviceManager', url, null)
        .subscribe(
          (data) => {
            this.selectedService.serviceYaml = data.service;
            this.selectedService.deploymentYaml = data.deployment;
            this.showYamlWindow = true;
          },
          (err) => {
            this.commonService.errorToast(err);
          }
        );
    } else {
      this.showYamlWindow = true;
    }
  }

  closeYamlWindow() {
    this.showYamlWindow = false;
    this.selectedService = null;
  }

  downloadYamls() {
    this.appService.downloadText(this.selectedService.name + '.yaml', this.selectedService.serviceYaml + '\n---\n' + this.selectedService.deploymentYaml);
  }

  copyText(text: string, type: string) {
    this.appService.copyToClipboard(text);
    this.copied[type] = true;
    setTimeout(() => {
      this.copied[type] = false;
    }, 2000);
  }

  cloneService(index: number) {
    this.cloneForm.reset({ desTab: true });
    this.cloneData = this.records[index];
    this.cloneForm.get('name').patchValue(this.cloneData.name + ' Copy');
    this.cloneForm.get('description').patchValue(this.cloneData.description);
    this.showCloneServiceWindow = true;
  }

  triggerClone() {
    const payload = this.cloneForm.value;
    payload.app = this.commonService.app._id;
    if (payload.desTab) {
      payload.definition = this.cloneData.definition;
    }
    payload.schemaFree = this.cloneData.schemaFree;
    if (payload.rolTab) {
      payload.role = this.cloneData.role;
      if (payload.role && payload.role.roles) {
        this.appService.fixPermissionIdsInRoles(payload.role.roles);
        payload.role.fields = this.appService.getDefaultFields(
          payload.role.roles.map((e) => e.id),
          payload.definition,
          {}
        );
      }
    }
    if (payload.expTab) {
      payload.wizard = this.cloneData.wizard;
      payload.stateModel = this.cloneData.stateModel;
      payload.workflowConfig = this.cloneData.workflowConfig;
      if (payload.workflowConfig && payload.workflowConfig.makerCheckers) {
        this.appService.fixPermissionIdsInWF(
          payload.workflowConfig.makerCheckers
        );
      }
    }
    if (payload.setTab) {
      payload.tags = this.cloneData.tags;
      payload.disableInsights=this.cloneData.disableInsights;
      payload.permanentDeleteData=this.cloneData.permanentDeleteData;
      payload.versionValidity = this.cloneData.versionValidity;
      payload.headers = this.cloneData.headers;
      payload.enableSearchIndex = this.cloneData.enableSearchIndex;
      payload.connectors = this.cloneData.connectors;
    }
    if (payload.intTab) {
      payload.preHooks = this.cloneData.preHooks;
      payload.webHooks = this.cloneData.webHooks;
      payload.workflowHooks = this.cloneData.workflowHooks;
    }
    delete payload.desTab;
    delete payload.intTab;
    delete payload.expTab;
    delete payload.rolTab;
    delete payload.setTab;
    this.commonService
      .post('serviceManager', `/${this.commonService.app._id}/service`, payload)
      .subscribe(
        (res) => {
          this.ts.success('Service Cloned.');
          this.appService.editServiceId = res._id;
          this.showCloneServiceWindow = false;
          this.router.navigate([
            '/app/',
            this.commonService.app._id,
            'sb',
            res._id,
          ]);
        },
        (err) => {
          this.commonService.errorToast(err);
        }
      );
  }

  getServices() {
    if (this.subscriptions['getservice']) {
      this.subscriptions['getservice'].unsubscribe();
    }
    this.showLazyLoader = true;
    this.serviceList = [];
    this.subscriptions['getservice'] = this.commonService
      .get('serviceManager', `/${this.commonService.app._id}/service/utils/count`)
      .pipe(switchMap((ev: any) => {
        return this.commonService.get('serviceManager', `/${this.commonService.app._id}/service`, {
          count: ev
        })
      })).subscribe((res) => {
        this.showLazyLoader = false;
        if (res.length > 0) {
          res.forEach((service, i) => {
            this.setServiceDetails(service);
            service.docapi = `${environment.url.doc}/?q=/api/a/sm/${service.app}/service/utils/${service._id}/swagger/${service.app}${service.api}`;
            service._records = 0;
            this.serviceList.push(service);
          });
          this.serviceList.forEach(e=>{
            console.log(e.status=='Pending')
            if(e.status=='Pending'){
              this.commonService.updateStatus(e._id,'service');
            }
          })
          if (this.commonService.userDetails.verifyDeploymentUser) {
            this.getServicesWithDraftData();
          }
          this._getAllServiceRecords(res.map((e) => e._id)).subscribe(
            (counts: any) => {
              if (counts && counts.length > 0) {
                this.serviceRecordCounts = counts;
                this.serviceRecordCounts.forEach((item) => {
                  const temp = this.serviceList.find((e) => e._id === item._id);
                  if (temp) {
                    temp._records = item.count;
                  }
                });
              }
            },
            (err) => {
              this.commonService.errorToast(err, 'We are unable to fetch Data Service documents count, please try again later');
            }
          );
        }
      }, (err) => {
        this.commonService.errorToast(err, 'We are unable to fetch records, please try again later');
      });
  }

  getServicesWithDraftData() {
    if (this.subscriptions['getDraftservice']) {
      this.subscriptions['getDraftservice'].unsubscribe();
    }
    this.showLazyLoader = true;
    this.subscriptions['getDraftservice'] = this.commonService
      .get('serviceManager', `/${this.commonService.app._id}/service` + '?draft=true', this.service)
      .subscribe((res) => {
        this.showLazyLoader = false;
        res.forEach((item) => {
          const index = this.serviceList.findIndex((e) => e._id === item._id);
          this.serviceList[index]._metadata.lastUpdatedBy =
            item._metadata.lastUpdatedBy;
        });
      });
  }
  openDocs(index: number) {
    const docsAPI = this.records[index].docapi;
    window.open(docsAPI, '_blank');
  }

  setServiceDetails(service: any) {
    if (service.status === 'Undeployed') {
      service.status = 'Stopped';
    }
    if (service.definition) {
      service._attributes = service.definition.length - 1;
    } else {
      service._attributes = service.attributeCount;
    }
    service._references = service.relatedSchemas && service.relatedSchemas.incoming ? service.relatedSchemas.incoming.length : 0;
    service._preHooks = service.preHooks ? service.preHooks.length : 0;
    service._webHooks = service.webHooks ? service.webHooks.length + service._preHooks : 0 + service._preHooks;
    service.docapi = `${environment.url.doc}/?q=/api/a/sm/${service.app}/service/utils/${service._id}/swagger/${service.app}${service.api}`;
  }

  _getServiceRecords(service: any) {
    this.subscriptions['getservicerecord_' + service._id] = this.commonService
      .get('serviceManager', `/${this.commonService.app._id}/service/utils/count/${service._id}`,
        { filter: { app: this.commonService.app._id } }).subscribe((res) => {
          service._records = res;
        }, (err) => {
          service._records = 0;
        });
  }

  _getAllServiceRecords(serviceIds: Array<string>) {
    return this.commonService.get('serviceManager', `/${this.commonService.app._id}/service/utils/all/count`, {
      serviceIds: serviceIds.join(','),
      filter: { app: this.commonService.app._id },
    });
  }

  deleteService(index: number) {
    this.alertModal.statusChange = false;
    this.alertModal.title = 'Delete Data Service?';
    this.alertModal.message =
      'Are you sure you want to delete this data service? This action will delete ' +
      'the design, settings and integration configuration for <span class="font-weight-bold text-delete">' +
      this.records[index].name +
      '</span>. It is highly recommended that you take a backup of your data before doing this, as the delete cannot be be undone.';
    this.alertModal.index = index;
    this.openDeleteModal.emit(this.alertModal);
  }

  closeDeleteModal(data: any) {
    if (data) {
      const url = `/${this.commonService.app._id}/service/` + this.records[data.index]._id;
      this.showLazyLoader = true;
      this.subscriptions['deleteservice'] = this.commonService.delete('serviceManager', url).subscribe((d) => {
        this.showLazyLoader = false;
        this.ts.info(d.message ? d.message : 'Deleting data service...');
        this.records[data.index].status = 'Working';
        this.commonService.updateDelete(this.records[data.index]._id,'service');
      }, (err) => {
        this.showLazyLoader = false;
        this.commonService.errorToast(err, 'Oops, something went wrong. Please try again later.');
      });
    }
  }

  toggleServiceStatus(index: number) {
    this.alertModal.statusChange = true;
    if (this.records[index].status === 'Active') {
      this.alertModal.title = 'Stop ' + this.records[index].name + '?';
      this.alertModal.message =
        'Are you sure you want to stop this data service? Once stopped, "' +
        this.records[index].name +
        '" will no longer appear in the App Center. This action will also stop the API.';
    } else {
      this.alertModal.title = 'Start ' + this.records[index].name + '?';
      this.alertModal.message =
        'Are you sure you want to start this data service? Once started, "' +
        this.records[index].name +
        '" will appear in the App Center for users to work with. This action will also start the API.';
    }
    this.alertModalTemplateRef = this.commonService.modal(
      this.alertModalTemplate
    );
    this.alertModalTemplateRef.result.then(
      (close) => {
        if (close) {
          let url = `/${this.commonService.app._id}/service/utils/` + this.records[index]._id + '/start';
          if (this.records[index].status === 'Active') {
            url = `/${this.commonService.app._id}/service/utils/` + this.records[index]._id + '/stop';
          }
          this.subscriptions['updateservice'] = this.commonService
            .put('serviceManager', url, { app: this.commonService.app._id })
            .subscribe(
              (d) => {
                if (this.records[index].status === 'Active') {
                  this.ts.info('Stopping data service...');
                } else {
                  this.ts.info('Starting data service...');
                }
                this.commonService.updateStatus(this.records[index]._id,'service')
                this.records[index].status = 'Pending';
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

  deployService(index: number) {
    this.alertModal.statusChange = true;
    if (
      this.records[index].status === 'Draft' ||
      this.records[index].draftVersion
    ) {
      this.alertModal.title = 'Deploy ' + this.records[index].name + '?';
      this.alertModal.message =
        'Are you sure you want to Deploy this data service? Once Deployed, "' +
        this.records[index].name +
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
          const url = `/${this.commonService.app._id}/service/utils/` + this.records[index]._id + '/deploy';
          this.subscriptions['updateservice'] = this.commonService
            .put('serviceManager', url, { app: this.commonService.app._id })
            .subscribe((d) => {
              this.ts.info('Deploying data service...');
              this.records[index].status = 'Pending';
              this.commonService.updateStatus(this.records[index]._id,'service')
            }, (err) => {
              this.commonService.errorToast(err);
            });
        }
      },
      (dismiss) => { }
    );
  }

  showDeploy(index: number) {
    const srvc = this.records[index];
    if (srvc.status === 'Draft' || srvc.draftVersion) {
      return true;
    }
    return false;
  }

  isDeploy(index) {
    return this.showDeploy(index) && this.canDeployService(this.records[index]) && this.records[index].type != 'internal'
  }


  isStartStopService(index) {
    return this.canStartStopService(this.records[index]._id) &&
      this.records[index].type != 'internal'
  }


  hasPermissionForService(id: string) {
    if (
      this.commonService.isAppAdmin ||
      this.commonService.userDetails.isSuperAdmin
    ) {
      return true;
    } else {
      if (
        this.commonService.hasPermissionStartsWith('PMDS', 'SM') ||
        this.commonService.hasPermissionStartsWith('PVDS', 'SM')
      ) {
        return true;
      } else {
        return false;
      }
    }
  }

  canCloneService(id: string) {
    if (
      this.commonService.isAppAdmin ||
      this.commonService.userDetails.isSuperAdmin
    ) {
      return true;
    } else {
      return (
        this.commonService.hasPermission('PMDSD', 'SM') &&
        this.commonService.hasPermission('PMDSBC', 'SM')
      );
    }
  }

  canCloneTab(tab: string, id: string) {
    if (
      this.commonService.isAppAdmin ||
      this.commonService.userDetails.isSuperAdmin
    ) {
      return true;
    } else {
      return (
        this.commonService.hasPermission('PMDS' + tab, 'SM') &&
        this.commonService.hasPermission('PMDSBC', 'SM')
      );
    }
  }

  canEditService(id: string) {
    if (
      this.commonService.isAppAdmin ||
      this.commonService.userDetails.isSuperAdmin
    ) {
      return true;
    } else {
      const list2 = this.commonService.getEntityPermissions('SM');
      return Boolean(
        list2.find(
          (e) =>
            e.id.startsWith('PMDS') &&
            e.id !== 'PMDSBC' &&
            e.id !== 'PMDSBD' &&
            e.id !== 'PMDSPD' &&
            e.id !== 'PMDSPS'
        )
      );
    }
  }

  canDeleteService(id: string) {
    if (
      this.commonService.isAppAdmin ||
      this.commonService.userDetails.isSuperAdmin
    ) {
      return true;
    } else {
      return this.commonService.hasPermission('PMDSBD', 'SM');
    }
  }

  canDeployService(service) {
    if (this.commonService.userDetails.isSuperAdmin) {
      return true;
    } else if (
      this.commonService.isAppAdmin &&
      !this.commonService.userDetails.verifyDeploymentUser
    ) {
      return true;
    } else if (
      this.commonService.userDetails.verifyDeploymentUser &&
      this.commonService.userDetails._id === service._metadata.lastUpdatedBy
    ) {
      return false;
    } else {
      return this.commonService.hasPermission('PMDSPD', 'SM');
    }
  }

  canStartStopService(id: string) {
    const temp = this.serviceList.find((e) => e._id === id);
    if (temp.status !== 'Stopped' && temp.status !== 'Active') {
      return false;
    }
    if (
      this.commonService.isAppAdmin ||
      this.commonService.userDetails.isSuperAdmin
    ) {
      return true;
    } else {
      return this.commonService.hasPermission('PMDSPS', 'SM');
    }
  }

  hasCreatePermission(entity: string) {
    return this.commonService.hasPermission('PMDSBC', entity);
  }

  getLatestRecord(service: any, index: number) {
    const indx = this.serviceList.findIndex((s) => {
      if (s._id === service._id) {
        return s;
      }
    });
    if (indx > -1) {
      this.subscriptions['getservicerecord_' + service._id] = this.commonService
        .get(
          'serviceManager',
          `/${this.commonService.app._id}/service/` + service._id,
          { filter: { app: this.commonService.app._id } }
        )
        .subscribe(
          (res) => {
            this.setServiceDetails(res);
            this.serviceList.splice(index, 1, res);
            this.serviceRecordCounts.forEach((item) => {
              const temp = this.serviceList.find((e) => e._id === item._id);
              if (temp) {
                temp._records = item.count;
              }
            });
          },
          (err) => {
            console.error(err);
          }
        );
    }
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

  hasPermission(type: string, entity?: string) {
    return this.commonService.hasPermission(type, entity);
  }

  getStatusClass(srvc: any) {
    if (srvc.status === 'Active') {
      return 'text-success';
    }
    if (srvc.status === 'Stopped' || srvc.status === 'Undeployed') {
      return 'text-danger';
    }
    if (srvc.status === 'Draft') {
      return 'text-accent';
    }
    if (srvc.status === 'Pending') {
      return 'text-warning';
    }
    return 'text-secondary';
  }

  getStatusLabel(srvc: any) {
    if (srvc.status === 'Active') {
      return 'Running';
    }
    if (srvc.status === 'Stopped' || srvc.status === 'Undeployed') {
      return 'Stopped';
    }
    if (srvc.status === 'Draft') {
      return 'Draft';
    }
    if (srvc.status === 'Pending') {
      return 'Pending';
    }
    return 'Maintenance';
  }

  showDropDown(event: any, id: string) {
    this.selectedItemEvent = event;
    Object.keys(this.showOptionsDropdown).forEach(key => {
      this.showOptionsDropdown[key] = false;
    })
    this.selectedService = this.serviceList.find(e => e._id == id);
    this.showOptionsDropdown[id] = true;
  }

  selectConnector(event, type) {
    this.form.get('connectors').get(type).setValue({
      _id: event.target.value
    })
    this.fetchTables(event.target.value);
  }

  fetchTables(id) {
    this.subscriptions['fetchTables'] = this.commonService.get('user', `/${this.commonService.app._id}/connector/${id}/utils/fetchTables`).subscribe(res => {
      this.tables = res;
    }, err => {
      this.commonService.errorToast(err, 'Unable to fetch user groups, please try again later');
    });
  }

  selectTables(event) {
    let data = this.form.get('connectors').get('data');
    let _id = data.value._id;
    data.setValue({
      _id: _id,
      options: {
        tableName: event
      }
    });
  }

  toggleSchemaType(schemaFree) {
    this.form.get('schemaFree').setValue(schemaFree);
    if (schemaFree) {
      this.form.get('connectors').reset();
      this.form.get('connectors').get('data').setValue({
        _id: this.mongoList[0]._id
      });
      this.form.get('connectors').get('file').setValue({});
    }
    else {
      this.form.get('connectors').get('data').setValue({
        _id: this.defaultDC
      })
      this.form.get('connectors').get('file').setValue({
        _id: this.defaultFC
      })
    }
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
      top = this.selectedItemEvent.clientY - 170
    }
    return {
      top: top + 'px',
      right: '50px'
    };
  }

  get records() {
    let records = this.commonPipe.transform(this.serviceList, 'name', this.searchTerm);
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

  get isAppAdmin() {
    return this.commonService.isAppAdmin;
  }

  get isSuperAdmin() {
    return this.commonService.userDetails.isSuperAdmin;
  }

  get isExperimental() {
    return this.commonService.userDetails.experimentalFeatures;
  }

  get app() {
    return this.commonService.app._id;
  }

  get dataConnectors() {
    const typeList = this.form.get('schemaFree').value ? this.mongoList : this.connectorList
    const list = typeList?.filter(ele => ele.category === 'DB').sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    }) || []
    return list
  }

  get fileConnectors() {
    return this.connectorList?.filter(ele => ele.category === 'STORAGE').sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    }) || []
  }

  checkDefault(id) {
    const defaultIds = [this.commonService.appData['connectors']?.data?._id, this.commonService.appData['connectors']?.file?._id];
    return defaultIds.indexOf(id) > -1
  }
}
