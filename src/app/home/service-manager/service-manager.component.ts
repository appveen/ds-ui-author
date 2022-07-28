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
import { AgGridAngular } from 'ag-grid-angular';

import {
  CommonService,
  GetOptions,
} from 'src/app/utils/services/common.service';
import { environment } from 'src/environments/environment';
import { AppService } from 'src/app/utils/services/app.service';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { GridApi, GridOptions, IDatasource } from 'ag-grid-community';
import { DsGridStatusComponent } from './ds-grid-status/ds-grid-status.component'
import { DsGridActionsComponent } from './ds-grid-actions/ds-grid-actions.component'
@Component({
  selector: 'odp-service-manager',
  templateUrl: './service-manager.component.html',
  styleUrls: ['./service-manager.component.scss'],
})
export class ServiceManagerComponent implements OnInit, OnDestroy {
  @ViewChild('agGrid') agGrid: AgGridAngular;
  gridApi: GridApi;
  gridOptions: GridOptions;
  dataSource: IDatasource;
  context: any;
  @ViewChild('alertModalTemplate', { static: false })
  alertModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('newServiceModal', { static: false })
  newServiceModal: TemplateRef<HTMLElement>;
  @ViewChild('cloneServiceModal', { static: false })
  cloneServiceModal: TemplateRef<HTMLElement>;
  @ViewChild('yamlModalTemplate', { static: false })
  yamlModalTemplate: TemplateRef<HTMLElement>;
  app: string;
  selectedRowEvent: any;
  selectedRowIndex: any;
  showContextMenu: boolean;
  serviceSearchForm: FormGroup;
  serviceList: Array<any> = [];
  service: GetOptions;
  alertModal: {
    statusChange?: boolean;
    title: string;
    message: string;
    index: number;
  };
  showLazyLoader = true;
  changeAppSubscription: any;
  showCardMenu: any = {};
  showCardDraft: any = {};
  subscriptions: any = {};
  showAddButton: boolean;
  breadcrumbPaths: Array<Breadcrumb>;
  openDeleteModal: EventEmitter<any>;
  form: FormGroup;
  cloneForm: FormGroup;
  alertModalTemplateRef: NgbModalRef;
  newServiceModalRef: NgbModalRef;
  cloneServiceModalRef: NgbModalRef;
  yamlModalTemplateRef: NgbModalRef;
  cloneData: any;
  easterEggEnabled: boolean;
  serviceRecordCounts: Array<any>;
  serviceYaml: any;
  deploymentYaml: any;
  toggleImportWizard: boolean;
  frameworkComponents: any;
  constructor(
    public commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private fb: FormBuilder,
    private ts: ToastrService
  ) {
    const self = this;
    this.context = { componentParent: this };
    self.serviceSearchForm = self.fb.group({
      searchTerm: ['', [Validators.required]],
      searchField: ['name', [Validators.required]],
    });
    self.alertModal = {
      statusChange: false,
      title: '',
      message: '',
      index: -1,
    };
    self.breadcrumbPaths = [
      {
        active: true,
        label: 'Data Services',
        url: null,
      },
    ];
    this.frameworkComponents = {
      statusRenderer: DsGridStatusComponent,
      actionRenderer: DsGridActionsComponent
    };
    self.commonService.setBreadcrumbs(self.breadcrumbPaths);
    self.openDeleteModal = new EventEmitter();
    self.form = self.fb.group({
      name: [
        null,
        [
          Validators.required,
          Validators.maxLength(40),
          Validators.pattern(/\w+/),
        ],
      ],
      description: [
        null,
        [Validators.maxLength(240), Validators.pattern(/\w+/)],
      ],
    });
    self.cloneForm = self.fb.group({
      name: [
        null,
        [
          Validators.required,
          Validators.maxLength(40),
          Validators.pattern(/\w+/),
        ],
      ],
      description: [
        null,
        [Validators.maxLength(240), Validators.pattern(/\w+/)],
      ],
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
      setTimeout(() => {
        Object.keys(this.showCardMenu).forEach((key) => {
          this.showCardMenu[key] = true;
        });
      }, 200);
      setTimeout(() => {
        Object.keys(this.showCardMenu).forEach((key) => {
          this.showCardMenu[key] = false;
        });
      }, 3000);
    };
  }

  ngOnInit() {
    const self = this;
    self.app = self.commonService.app._id;
    self.showLazyLoader = true;
    // self.listenForEasterEgg();
    self.resetSearch();
    self.getServices();
    self.commonService.apiCalls.componentLoading = false;
    self.subscriptions['entity.delete'] =
      self.commonService.entity.delete.subscribe((data) => {
        const index = self.serviceList.findIndex((s) => {
          if (s._id === data._id) {
            return s;
          }
        });
        self.ts.success('Deleted ' + self.serviceList[index].name + '.');
        if (index > -1) {
          self.serviceList.splice(index, 1);
        }
      });
    self.subscriptions['entity.status'] =
      self.commonService.entity.status.subscribe((data) => {
        const index = self.serviceList.findIndex((s) => {
          if (s._id === data._id) {
            return s;
          }
        });
        if (index === -1) {
          return;
        }
        if (data.message === 'Undeployed') {
          self.ts.success('Stopped ' + self.serviceList[index].name + '.');
        } else if (data.message === 'Deployed') {
          self.ts.success('Started ' + self.serviceList[index].name + '.');
        } else if (data.message === 'Pending') {
          self.serviceList[index].status = 'Pending';
        }
        self.getLatestRecord(self.serviceList[index], index);
      });
    self.subscriptions['entity.new'] = self.commonService.entity.new.subscribe(
      (data) => {
        const index = self.serviceList.findIndex((s) => {
          if (s._id === data._id) {
            return s;
          }
        });
        if (index > -1) {
          self.serviceList[index].status = 'Active';
        } else {
          self.commonService
            .get(
              'serviceManager',
              `/${this.commonService.app._id}/service/` + data._id,
              { filter: { app: this.commonService.app._id } }
            )
            .subscribe(
              (service) => {
                // self.setServiceDetails(service);
                // self.serviceList.push(service);
              },
              (err) => {
                self.commonService.errorToast(err);
              }
            );
        }
      }
    );

    self.changeAppSubscription = self.commonService.appChange.subscribe(
      (_app) => {
        self.app = self.commonService.app._id;
        self.showLazyLoader = true;
        self.commonService.apiCalls.componentLoading = false;
        self.serviceList = [];
        self.resetSearch();
        self.getServices();
      }
    );
    // self.form.get('name').valueChanges.subscribe(_val => {
    //     self.form.controls.api.patchValue('/' + _.camelCase(_val));
    //     self.form.get(['definition', 0, '_id', 'prefix']).patchValue(_.toUpper(_.camelCase(_val.substring(0, 3))));
    //     self.form.get(['definition', 0, '_id', 'counter']).patchValue(1001);
    // });
  }

  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach((e) => {
      self.subscriptions[e].unsubscribe();
    });
    if (self.alertModalTemplateRef) {
      self.alertModalTemplateRef.close();
    }
    if (self.newServiceModalRef) {
      self.newServiceModalRef.close();
    }
    if (self.cloneServiceModalRef) {
      self.cloneServiceModalRef.close();
    }
  }

  clickContextMenu(event, selectedRowIndex) {
    const self = this;
    self.selectedRowEvent = event;
    self.selectedRowIndex = selectedRowIndex
    self.showContextMenu = true;
  }
  closeContextMenu() {
    const self = this;
    self.showContextMenu = false;
  }

  getPosition() {
    const self = this;
    let position = {};
    let top = 145;

    if (self.selectedRowEvent) {
      position = {
        top: self.selectedRowEvent.y - top + 'px',
        left: self.selectedRowEvent.x - 240 + 'px'
      };
    }
    return position;
  }

  onGridReady(event) {
    this.gridApi = event.api;
    this.forceResizeColumns();
    // this.setupGrid();
  }

  private forceResizeColumns() {
    this.agGrid.api.sizeColumnsToFit();
    this.autoSizeAllColumns();
  }

  private autoSizeAllColumns() {
    if (!!this.agGrid.api && !!this.agGrid.columnApi) {
      setTimeout(() => {
        const container = document.querySelector('.grid-container');
        const availableWidth = !!container ? container.clientWidth - 170 : 1350;
        const allColumns = this.agGrid.columnApi.getAllColumns();
        allColumns.forEach(col => {
          this.agGrid.columnApi.autoSizeColumn(col);
          if (col.getActualWidth() > 200 || this.agGrid.api.getDisplayedRowCount() === 0) {
            col.setActualWidth(200);
          }
        });
        const occupiedWidth = allColumns.reduce((pv, cv) => pv + cv.getActualWidth(), -170);
        if (occupiedWidth < availableWidth) {
          this.agGrid.api.sizeColumnsToFit();
        }
      }, 2000);
    }
  }


  configureGridSettings() {
    // const list = _.differenceBy(this.groupList, this.userGroups, '_id');
    const groupColumnDefs = [
      {
        headerName: '',
        field: '',
        width: 40,
        headerCheckboxSelection: true,
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: false,
      },
      {
        headerName: 'SERVICE NAME',
        field: 'name',
        cellStyle: { 'font-weight': 500, 'font-style': 'normal', color: '#181818' }
      },
      {
        headerName: 'RECORDS',
        field: '_records',
      },
      {
        headerName: 'ATTRIBUTES',
        field: '_attributes',
      },
      {
        headerName: 'REFERENCES',
        field: '_references',
      },
      {
        headerName: 'HOOKS',
        field: '_webHooks',
      },
      // {
      //   headerName: 'STATUS',
      //   field: 'status',
      //   cellRenderer: 'statusRenderer',
      // },
      {
        headerName: '',
        field: 'status',
        cellRenderer: 'actionRenderer',
      }
    ];

    this.gridOptions = {
      paginationPageSize: 30,
      cacheBlockSize: 30,
      floatingFilter: false,
      // datasource: this.dataSource,
      rowData: this.serviceList,
      columnDefs: groupColumnDefs,
      animateRows: true,
      rowHeight: 56,
      headerHeight: 38,
      frameworkComponents: this.frameworkComponents,
      suppressPaginationPanel: true,
      context: this.context,
      rowSelection: 'multiple',
      onRowDoubleClicked: this.onRowDoubleClick.bind(this)
      // onSelectionChanged: (event) => this.onSelectionChanged(event),
      // onCellValueChanged: this.onCellValueChanged,
    };
  }

  private onRowDoubleClick(row: any) {
    const self = this;
    console.log(row)
    self.router.navigate(['/app', self.app, 'sb', row.data._id]);

  }


  get isAppAdmin() {
    const self = this;
    return self.commonService.isAppAdmin;
  }

  get isSuperAdmin() {
    const self = this;
    return self.commonService.userDetails.isSuperAdmin;
  }

  newService() {
    const self = this;
    self.newServiceModalRef = self.commonService.modal(self.newServiceModal, {
      size: 'sm',
    });
    self.newServiceModalRef.result.then(
      (close) => {
        if (close && self.form.valid) {
          self.triggerServiceCreate();
        }
        self.form.reset();
      },
      (dismiss) => {
        self.form.reset();
      }
    );
  }

  discardDraft(id: string) {
    const self = this;
    const service = self.serviceList.find((e) => e._id === id);
    const serviceIndex = self.serviceList.findIndex((e) => e._id === id);
    self.alertModal = {
      title: 'Discard Draft',
      message: 'Are you sure you want to discard draft version?',
      index: 1,
    };
    self.alertModalTemplateRef = self.commonService.modal(
      self.alertModalTemplate,
      { size: 'sm' }
    );
    self.alertModalTemplateRef.result.then(
      (close) => {
        if (close) {
          let request;
          if (service.status === 'Draft') {
            request = self.commonService.delete(
              'serviceManager',
              `/${this.commonService.app._id}/service/` + id
            );
          } else {
            request = self.commonService.delete(
              'serviceManager',
              `/${this.commonService.app._id}/service/utils/${id}/draftDelete`
            );
          }
          request.subscribe(
            (res) => {
              Object.keys(self.showCardDraft).forEach((key) => {
                self.showCardDraft[key] = false;
              });
              self.ts.success('Draft Deleted.');
              if (service.status !== 'Draft') {
                self.router.navigate([
                  '/app/',
                  self.commonService.app._id,
                  'sb',
                  id,
                ]);
              } else {
                if (serviceIndex > -1) {
                  self.serviceList.splice(serviceIndex, 1);
                }
              }
            },
            (err) => {
              self.commonService.errorToast(err);
            }
          );
        }
      },
      (dismiss) => { }
    );
  }

  triggerServiceCreate() {
    const self = this;
    const payload = self.form.value;
    payload.app = self.commonService.app._id;
    self.showLazyLoader = true;
    payload.versionValidity = self.commonService.app.serviceVersionValidity;
    if (!self.hasPermission('PMDSSDH', 'SM')) {
      delete payload.versionValidity;
    }
    self.commonService
      .post('serviceManager', `/${this.commonService.app._id}/service`, payload)
      .subscribe(
        (res) => {
          self.ts.success('Service Created.');
          self.appService.editServiceId = res._id;
          self.showLazyLoader = false;

          self.router.navigate([
            '/app/',
            self.commonService.app._id,
            'sb',
            res._id,
          ]);
        },
        (err) => {
          self.showLazyLoader = false;
          self.commonService.errorToast(err);
        }
      );
  }

  editService(index: number) {
    const self = this;
    if (
      (self.serviceList[index].status === 'Draft' ||
        self.serviceList[index].draftVersion) &&
      !self.showCardDraft[index]
    ) {
      self.showCardDraft[index] = true;
      return;
    }
    self.appService.editServiceId = self.serviceList[index]._id;
    self.router.navigate([
      '/app/',
      self.commonService.app._id,
      'sb',
      self.appService.editServiceId,
    ]);
  }

  repairService(index: number) {
    const self = this;
    const url =
      `/${this.commonService.app._id}/service/utils/` +
      self.serviceList[index]._id +
      '/repair';
    self.subscriptions['updateservice'] = self.commonService
      .put('serviceManager', url, null)
      .subscribe(
        (d) => {
          self.ts.info('Repairing data service...');
          self.serviceList[index].status = 'Pending';
        },
        (err) => {
          self.commonService.errorToast(err);
        }
      );
  }

  getYamls(index: number) {
    const self = this;
    const url = `/${this.commonService.app._id}/service/utils/${self.serviceList[index]._id}/yamls`;
    self.subscriptions['updateservice'] = self.commonService
      .get('serviceManager', url, null)
      .subscribe(
        (data) => {
          this.serviceYaml = data.service;
          this.deploymentYaml = data.deployment;
          this.yamlModalTemplateRef = this.commonService.modal(
            this.yamlModalTemplate
          );
          this.yamlModalTemplateRef.result.then(
            (close) => {
              this.serviceYaml = null;
              this.deploymentYaml = null;
            },
            (dismiss) => {
              this.serviceYaml = null;
              this.deploymentYaml = null;
            }
          );
        },
        (err) => {
          self.commonService.errorToast(err);
        }
      );
  }

  cloneService(index: number) {
    const self = this;
    self.cloneData = self.serviceList[index];
    self.cloneForm.get('name').patchValue(self.cloneData.name + ' Copy');
    self.cloneForm.get('description').patchValue(self.cloneData.description);
    self.cloneServiceModalRef = self.commonService.modal(
      self.cloneServiceModal,
      { size: 'sm' }
    );
    self.cloneServiceModalRef.result.then(
      (close) => {
        self.cloneData = null;
        self.cloneForm.reset({ desTab: true });
      },
      (dismiss) => {
        self.cloneData = null;
        self.cloneForm.reset({ desTab: true });
      }
    );
    // self.appService.cloneServiceId = self.serviceList[index]._id;
  }

  triggerClone() {
    const self = this;
    const payload = self.cloneForm.value;
    payload.app = self.commonService.app._id;
    if (payload.desTab) {
      payload.definition = self.cloneData.definition;
    }
    payload.schemaFree = self.cloneData.schemaFree;
    if (payload.rolTab) {
      payload.role = self.cloneData.role;
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
      payload.wizard = self.cloneData.wizard;
      payload.stateModel = self.cloneData.stateModel;
      payload.workflowConfig = self.cloneData.workflowConfig;
      if (payload.workflowConfig && payload.workflowConfig.makerCheckers) {
        this.appService.fixPermissionIdsInWF(
          payload.workflowConfig.makerCheckers
        );
      }
    }
    if (payload.setTab) {
      payload.tags = self.cloneData.tags;
      payload.versionValidity = self.cloneData.versionValidity;
      payload.headers = self.cloneData.headers;
      payload.enableSearchIndex = self.cloneData.enableSearchIndex;
    }
    if (payload.intTab) {
      payload.preHooks = self.cloneData.preHooks;
      payload.webHooks = self.cloneData.webHooks;
      payload.workflowHooks = self.cloneData.workflowHooks;
    }
    delete payload.desTab;
    delete payload.intTab;
    delete payload.expTab;
    delete payload.rolTab;
    delete payload.setTab;
    self.commonService
      .post('serviceManager', `/${this.commonService.app._id}/service`, payload)
      .subscribe(
        (res) => {
          self.ts.success('Service Cloned.');
          self.appService.editServiceId = res._id;
          self.cloneServiceModalRef.close(false);
          self.router.navigate([
            '/app/',
            self.commonService.app._id,
            'sb',
            res._id,
          ]);
        },
        (err) => {
          self.commonService.errorToast(err);
        }
      );
  }

  loadMore(event) {
    const self = this;
    if (event.target.scrollTop >= 244) {
      self.showAddButton = true;
    } else {
      self.showAddButton = false;
    }
    if (
      event.target.scrollTop + event.target.offsetHeight ===
      event.target.children[0].offsetHeight
    ) {
      self.service.page = self.service.page + 1;
      self.showLazyLoader = true;
      self.getServices();
    }
  }

  resetSearch() {
    const self = this;
    self.serviceList = [];
    self.service = {
      page: 1,
      count: -1,
      select: null,
      filter: { app: this.commonService.app._id },
    };
  }

  getServices() {
    const self = this;
    if (self.subscriptions['getservice']) {
      self.subscriptions['getservice'].unsubscribe();
    }
    self.showLazyLoader = true;
    self.subscriptions['getservice'] = self.commonService
      .get(
        'serviceManager',
        `/${this.commonService.app._id}/service`,
        self.service
      )
      .subscribe(
        (res) => {
          self.showLazyLoader = false;
          if (res.length > 0) {
            const len = self.serviceList.length;
            res.forEach((service, i) => {
              self.showCardMenu[len + i] = false;
              // if (service.definition || service.webHook || service.status === 'Draft') {
              self.setServiceDetails(service);
              // service['docapi'] = `${environment.url.doc}/?q=/api/a/sm/service/${service._id}/swagger/${service.app}${service.api}?app=${this.commonService.app._id}`;
              service.docapi = `${environment.url.doc}/?q=/api/a/sm/${service.app}/service/utils/${service._id}/swagger/${service.app}${service.api}`;
              service._records = 0;
              self.serviceList.push(service);
              // }
            });
            if (self.commonService.userDetails.verifyDeploymentUser) {
              self.getServicesWithDraftData();
            }
            self._getAllServiceRecords(res.map((e) => e._id)).subscribe(
              (counts: any) => {
                if (counts && counts.length > 0) {
                  this.serviceRecordCounts = counts;
                  this.serviceRecordCounts.forEach((item) => {
                    const temp = self.serviceList.find(
                      (e) => e._id === item._id
                    );
                    if (temp) {
                      temp._records = item.count;
                    }
                  });
                }
              },
              (err) => {
                self.commonService.errorToast(
                  err,
                  'We are unable to fetch Data Service documents count, please try again later'
                );
              }
            );
            self.configureGridSettings();
          }
        },
        (err) => {
          self.commonService.errorToast(
            err,
            'We are unable to fetch records, please try again later'
          );
        }
      );
  }

  getServicesWithDraftData() {
    const self = this;
    if (self.subscriptions['getDraftservice']) {
      self.subscriptions['getDraftservice'].unsubscribe();
    }
    self.showLazyLoader = true;
    self.subscriptions['getDraftservice'] = self.commonService
      .get(
        'serviceManager',
        `/${this.commonService.app._id}/service` + '?draft=true',
        self.service
      )
      .subscribe((res) => {
        self.showLazyLoader = false;
        res.forEach((item) => {
          const index = self.serviceList.findIndex((e) => e._id === item._id);
          self.serviceList[index]._metadata.lastUpdatedBy =
            item._metadata.lastUpdatedBy;
        });
      });
  }
  openDocs(index) {
    const self = this;
    const docsAPI = self.serviceList[index].docapi;
    window.open(docsAPI, '_blank');
  }

  setServiceDetails(service) {
    const self = this;
    if (service.status === 'Undeployed') {
      service.status = 'Stopped';
    }
    if (service.definition) {
      service._attributes = service.definition.length - 1;
    } else {
      service._attributes = service.attributeCount;
    }
    service._references =
      service.relatedSchemas && service.relatedSchemas.incoming
        ? service.relatedSchemas.incoming.length
        : 0;
    service._preHooks = service.preHooks ? service.preHooks.length : 0;
    service._webHooks = service.webHooks
      ? service.webHooks.length + service._preHooks
      : 0 + service._preHooks;
    // service.docapi = `${environment.url.doc}/?q=/api/a/sm/service/${service._id}/swagger/${service.app}${service.api}?app=${this.commonService.app._id}`;
    service.docapi = `${environment.url.doc}/?q=/api/a/sm/${service.app}/service/utils/${service._id}/swagger/${service.app}${service.api}`;
  }

  _getServiceRecords(service) {
    const self = this;
    self.subscriptions['getservicerecord_' + service._id] = self.commonService
      .get(
        'serviceManager',
        `/${this.commonService.app._id}/service/utils/count/${service._id}`,
        { filter: { app: this.commonService.app._id } }
      )
      .subscribe(
        (res) => {
          service._records = res;
        },
        (err) => {
          service._records = 0;
        }
      );
  }

  _getAllServiceRecords(serviceIds: Array<string>) {
    const self = this;
    return self.commonService.get(
      'serviceManager',
      `/${this.commonService.app._id}/service/utils/all/count`,
      {
        serviceIds: serviceIds.join(','),
        filter: { app: this.commonService.app._id },
      }
    );
  }

  _getUpTime(lastUpdated) {
    lastUpdated = new Date(lastUpdated);
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const d = new Date(diff);
    let msg = '';
    msg += d.getUTCHours() ? d.getUTCHours() + 'h ' : '';
    msg += d.getUTCMinutes() ? d.getUTCMinutes() + 'm ' : '';
    msg += d.getUTCSeconds() ? d.getUTCSeconds() + 's' : '';
    return msg;
  }

  _getNoOfRecords(service) {
    const self = this;
    const url = service.api + '/utils/count';
    self.subscriptions['getnoofrecord'] = self.commonService
      .get('apis', url)
      .subscribe(
        (res) => {
          service._records = res;
        },
        (err) => {
          service._records = 0;
        }
      );
  }

  search(value) {
    const self = this;
    if (!value || !value.trim()) {
      return;
    }
    if (!self.service.filter) {
      self.service.filter = {};
    }
    self.service.filter.name = '/' + value.trim() + '/';
    self.serviceList = [];
    self.getServices();
  }

  deleteService(index) {
    const self = this;
    self.alertModal.statusChange = false;
    self.alertModal.title = 'Delete Data Service?';
    self.alertModal.message =
      'Are you sure you want to delete this data service? This action will delete ' +
      'the design, settings and integration configuration for <span class="font-weight-bold text-delete">' +
      self.serviceList[index].name +
      '</span>. It is highly recommended that you take a backup of your data before doing this, as the delete cannot be be undone.';
    self.alertModal.index = index;
    self.openDeleteModal.emit(self.alertModal);
  }

  closeDeleteModal(data) {
    const self = this;
    if (data) {
      const url =
        `/${this.commonService.app._id}/service/` +
        self.serviceList[data.index]._id;
      self.showLazyLoader = true;
      self.subscriptions['deleteservice'] = self.commonService
        .delete('serviceManager', url)
        .subscribe(
          (d) => {
            self.showLazyLoader = false;
            self.ts.info(d.message ? d.message : 'Deleting data service...');
            self.serviceList[data.index].status = 'Working';
          },
          (err) => {
            self.showLazyLoader = false;
            self.commonService.errorToast(
              err,
              'Oops, something went wrong. Please try again later.'
            );
          }
        );
    }
  }

  toggleServiceStatus(index: number) {
    const self = this;
    self.alertModal.statusChange = true;

    if (self.serviceList[index].status === 'Active') {
      self.alertModal.title = 'Stop ' + self.serviceList[index].name + '?';
      self.alertModal.message =
        'Are you sure you want to stop this data service? Once stopped, "' +
        self.serviceList[index].name +
        '" will no longer appear in the App Center. This action will also stop the API.';
    } else {
      self.alertModal.title = 'Start ' + self.serviceList[index].name + '?';
      self.alertModal.message =
        'Are you sure you want to start this data service? Once started, "' +
        self.serviceList[index].name +
        '" will appear in the App Center for users to work with. This action will also start the API.';
    }
    self.alertModalTemplateRef = self.commonService.modal(
      self.alertModalTemplate
    );
    self.alertModalTemplateRef.result.then(
      (close) => {
        if (close) {
          let url =
            `/${this.commonService.app._id}/service/utils/` +
            self.serviceList[index]._id +
            '/start';
          if (self.serviceList[index].status === 'Active') {
            url =
              `/${this.commonService.app._id}/service/utils/` +
              self.serviceList[index]._id +
              '/stop';
          }
          self.subscriptions['updateservice'] = self.commonService
            .put('serviceManager', url, { app: this.commonService.app._id })
            .subscribe(
              (d) => {
                if (self.serviceList[index].status === 'Active') {
                  self.ts.info('Stopping data service...');
                } else {
                  self.ts.info('Starting data service...');
                }
                self.serviceList[index].status = 'Pending';
              },
              (err) => {
                self.commonService.errorToast(err);
              }
            );
        }
      },
      (dismiss) => { }
    );
  }

  deployService(index: number) {
    const self = this;
    self.alertModal.statusChange = true;
    if (
      self.serviceList[index].status === 'Draft' ||
      self.serviceList[index].draftVersion
    ) {
      self.alertModal.title = 'Deploy ' + self.serviceList[index].name + '?';
      self.alertModal.message =
        'Are you sure you want to Deploy this data service? Once Deployed, "' +
        self.serviceList[index].name +
        '" will be running the latest version.';
    } else {
      return;
    }
    self.alertModalTemplateRef = self.commonService.modal(
      self.alertModalTemplate
    );
    self.alertModalTemplateRef.result.then(
      (close) => {
        if (close) {
          const url =
            `/${this.commonService.app._id}/service/utils/` +
            self.serviceList[index]._id +
            '/deploy';
          self.subscriptions['updateservice'] = self.commonService
            .put('serviceManager', url, { app: this.commonService.app._id })
            .subscribe(
              (d) => {
                self.ts.info('Deploying data service...');
                self.serviceList[index].status = 'Pending';
              },
              (err) => {
                self.commonService.errorToast(err);
              }
            );
        }
      },
      (dismiss) => { }
    );
  }

  showDeploy(index: number) {
    const self = this;
    const srvc = self.serviceList[index];
    if (srvc.status === 'Draft' || srvc.draftVersion) {
      return true;
    }
    return false;
  }

  isDeploy(index) {
    const self = this;
    return self.showDeploy(index) && self.canDeployService(self.serviceList[index]) && self.serviceList[index].type != 'internal'
  }


  isStartStopService(index) {
    const self = this;
    return self.canStartStopService(self.serviceList[index]._id) &&
      self.serviceList[index].type != 'internal'
  }


  hasPermissionForService(id: string) {
    const self = this;
    if (
      self.commonService.isAppAdmin ||
      self.commonService.userDetails.isSuperAdmin
    ) {
      return true;
    } else {
      if (
        self.commonService.hasPermissionStartsWith('PMDS', 'SM') ||
        self.commonService.hasPermissionStartsWith('PVDS', 'SM')
      ) {
        return true;
      } else {
        return false;
      }
    }
  }

  canCloneService(id: string) {
    const self = this;
    if (
      self.commonService.isAppAdmin ||
      self.commonService.userDetails.isSuperAdmin
    ) {
      return true;
    } else {
      return (
        self.commonService.hasPermission('PMDSD', 'SM') &&
        self.commonService.hasPermission('PMDSBC', 'SM')
      );
    }
  }

  canCloneTab(tab: string, id: string) {
    const self = this;
    if (
      self.commonService.isAppAdmin ||
      self.commonService.userDetails.isSuperAdmin
    ) {
      return true;
    } else {
      return (
        self.commonService.hasPermission('PMDS' + tab, 'SM') &&
        self.commonService.hasPermission('PMDSBC', 'SM')
      );
    }
  }

  canEditService(id: string) {
    const self = this;
    if (
      self.commonService.isAppAdmin ||
      self.commonService.userDetails.isSuperAdmin
    ) {
      return true;
    } else {
      const list2 = self.commonService.getEntityPermissions('SM');
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
    const self = this;
    if (
      self.commonService.isAppAdmin ||
      self.commonService.userDetails.isSuperAdmin
    ) {
      return true;
    } else {
      return self.commonService.hasPermission('PMDSBD', 'SM');
    }
  }

  canDeployService(service) {
    const self = this;
    if (self.commonService.userDetails.isSuperAdmin) {
      return true;
    } else if (
      self.commonService.isAppAdmin &&
      !self.commonService.userDetails.verifyDeploymentUser
    ) {
      return true;
    } else if (
      self.commonService.userDetails.verifyDeploymentUser &&
      self.commonService.userDetails._id === service._metadata.lastUpdatedBy
    ) {
      return false;
    } else {
      return self.commonService.hasPermission('PMDSPD', 'SM');
    }
  }

  canStartStopService(id: string) {
    const self = this;
    const temp = self.serviceList.find((e) => e._id === id);
    if (temp.status !== 'Stopped' && temp.status !== 'Active') {
      return false;
    }
    if (
      self.commonService.isAppAdmin ||
      self.commonService.userDetails.isSuperAdmin
    ) {
      return true;
    } else {
      return self.commonService.hasPermission('PMDSPS', 'SM');
    }
  }

  hasCreatePermission(entity: string) {
    const self = this;
    return self.commonService.hasPermission('PMDSBC', entity);
  }

  getTooltipText(status: string) {
    if (status === 'Active') {
      return 'Running';
    }
    if (status === 'Stopped') {
      return 'Stopped';
    }
    if (status === 'Maintenance') {
      return 'Under maintenance';
    }
    if (status === 'Pending') {
      return 'Pending';
    }
    if (status === 'Draft') {
      return 'Draft';
    }
  }

  autoAdjust(ele: HTMLElement) {
    if (!ele.classList.contains('active')) {
      const hideOffset = ele.clientHeight - 32;
      ele.style.bottom = '-' + hideOffset + 'px';
    } else {
      ele.style.bottom = '0px';
    }
  }
  getLatestRecord(service, index) {
    const self = this;
    const indx = self.serviceList.findIndex((s) => {
      if (s._id === service._id) {
        return s;
      }
    });
    if (indx > -1) {
      self.subscriptions['getservicerecord_' + service._id] = self.commonService
        .get(
          'serviceManager',
          `/${this.commonService.app._id}/service/` + service._id,
          { filter: { app: this.commonService.app._id } }
        )
        .subscribe(
          (res) => {
            self.setServiceDetails(res);
            self.serviceList.splice(index, 1, res);
            this.serviceRecordCounts.forEach((item) => {
              const temp = self.serviceList.find((e) => e._id === item._id);
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

  hasPermission(type: string, entity?: string) {
    const self = this;
    return self.commonService.hasPermission(type, entity);
  }

  transactionDoc() {
    const docsAPI = `${environment.url.doc}/?q=/api/a/common/txn`;
    window.open(docsAPI, '_blank');
  }

  get dummyRows() {
    const arr = new Array(15);
    arr.fill(1);
    return arr;
  }
}
