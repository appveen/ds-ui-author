import { Component, OnInit, Input, ViewChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridOptions, GridReadyEvent, RowNode } from 'ag-grid-community';

import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { AgGridSharedFloatingFilterComponent } from 'src/app/utils/ag-grid-shared-floating-filter/ag-grid-shared-floating-filter.component';
import { AgGridActionsRendererComponent } from 'src/app/utils/ag-grid-actions-renderer/ag-grid-actions-renderer.component';
import { LocalBotCellRendererComponent } from '../local-bot-cell-renderer/local-bot-cell-renderer.component';
import * as moment from 'moment';
import { I } from '@angular/cdk/keycodes';

@Component({
  selector: 'odp-manage-bot-key',
  templateUrl: './manage-bot-key.component.html',
  styleUrls: ['./manage-bot-key.component.scss']
})
export class ManageBotKeyComponent implements OnInit {
  @ViewChild('newKeyModal', { static: false }) newKeyModal: TemplateRef<HTMLElement>;
  @ViewChild('agGrid') agGrid: AgGridAngular;
  @Input() selectedBot: any;
  @Output() dataChange: EventEmitter<any>;
  @Output() editKey: EventEmitter<any> = new EventEmitter();
  @Output() onAdd: EventEmitter<any> = new EventEmitter();
  openDeleteBotKeyModal: EventEmitter<any>;
  editKeyModalRef: NgbModalRef
  showLazyLoader: boolean;
  keyForm: FormGroup
  gridOptions: GridOptions;
  frameworkComponents: any;
  filterModel: any;
  filtering: boolean;
  gridApi: GridApi;
  searchTerm: string;
  action: any;
  constructor(
    private fb: FormBuilder,
    public commonService: CommonService,
    private appService: AppService,
    private ts: ToastrService
  ) {
    const self = this;
    self.dataChange = new EventEmitter();
    self.keyForm = self.fb.group({
      label: [null, [Validators.required, Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9\\s-_]+')]],
      expires: [null, [Validators.required, Validators.min(1)]]
    });
    self.openDeleteBotKeyModal = new EventEmitter();
  }

  ngOnInit() {
    this.setupGrid();
  }

  setupGrid() {
    this.frameworkComponents = {
      customCellRenderer: LocalBotCellRendererComponent,
      actionCellRenderer: AgGridActionsRendererComponent
    };
    const columnDefs = [
      {
        headerName: 'KEY NAME',
        field: 'label',
        width: 150,

      },
      {
        headerName: 'EXPIRY (IN DAYS)',
        width: 150,
        field: 'expires',
        cellRenderer: (params) => {
          if (!params.data.isActive) {
            return `<div style="color: #FF9052">Deactivated</div>`
          }
          else {
            return `<div>${params.value / (24 * 60)}</div>`
          }
        }
      },

      {
        headerName: 'KEY',
        field: 'keyValue',
        width: 250,
        cellRenderer: 'customCellRenderer',
        colSpan: (params) => {
          if (params.data && params.data.isNew) {
            return 2
          }
          else {
            return 1
          }
        },
        refData: {
          namespace: 'keys'
        }
      },
      {
        headerName: 'LAST LOGIN AT',
        field: 'lastLogin',
        width: 250,
        valueFormatter: (params) => {
          if (params.value) {
            return this.formatLastLogin(params.value)
          }
          else {
            return '-'
          }
        }
      },
      ...(this.hasPermission('PMBBU') || this.hasPermission('PMBA')
        ? [
          {
            headerName: '',
            cellRenderer: 'actionCellRenderer',
            type: 'rightAligned',
            refData: {
              actionButtonsMapperFn: 'actionButtonsMapperFn',
              actionCallbackFunction: 'onGridAction'
            }
          }
        ]
        : [])
    ];
    this.gridOptions = {

      columnDefs: columnDefs,
      context: this,
      rowData: this.selectedBot.botKeys,
      paginationPageSize: 30,
      cacheBlockSize: 30,
      floatingFilter: false,
      animateRows: true,
      rowHeight: 48,
      headerHeight: 48,
      frameworkComponents: this.frameworkComponents,
      suppressCellSelection: true,
      suppressPaginationPanel: true,

    };
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    if (this.gridApi) {
      this.gridApi.sizeColumnsToFit()
    }
  }

  // private forceResizeColumns() {
  //   this.agGrid.api.sizeColumnsToFit();
  //   this.autoSizeAllColumns();
  // }

  // private autoSizeAllColumns() {
  //   const fixedSize = (this.hasPermission('PMBBU') ? 94 : 0) + (this.hasPermission('PMBA') ? 164 : 0);
  //   if (!!this.agGrid.api && !!this.agGrid.columnApi) {
  //     setTimeout(() => {
  //       const container = document.querySelector('.grid-container');
  //       const availableWidth = !!container ? container.clientWidth - fixedSize : 730;
  //       const allColumns = this.agGrid.columnApi.getAllColumns() || [];
  //       allColumns.forEach(col => {
  //         this.agGrid.columnApi.autoSizeColumn(col);
  //         if (col.getActualWidth() > 200 || this.agGrid.api.getDisplayedRowCount() === 0) {
  //           col.setActualWidth(200);
  //         }
  //       });
  //       const occupiedWidth = allColumns.reduce((pv, cv) => pv + cv.getActualWidth(), -fixedSize);
  //       if (occupiedWidth < availableWidth) {
  //         this.agGrid.api.sizeColumnsToFit();
  //       }
  //     }, 2000);
  //   }
  // }

  actionButtonsMapperFn(data: any) {
    const buttons = [];
    if (this.hasPermission('PMBA')) {
      buttons.push('End Session');
      buttons.push(data.isActive ? 'Deactivate' : 'Activate')
    }
    if (this.hasPermission('PMBBU')) {
      buttons.push('Edit');
      buttons.push('Delete');
    }

    return buttons;
  }

  onGridAction(buttonName: string, rowNode: RowNode) {
    switch (buttonName) {
      case 'Edit':
        {
          this.editBotKey(rowNode.data);
        }
        break;
      case 'End Session':
        {
          this.action = 'End Session';
          this.confirmEndSession(rowNode.data);
        }
        break;
      case 'Delete':
        {
          this.action = 'Delete'
          this.deleteBotKey(rowNode.data);
        }
        break;
      case 'Activate':
        {
          this.action = 'Reactivate';
          this.confirmReactivate(rowNode.data)
        }
        break;
      case 'Deactivate':
        {
          this.action = 'Deactivate';
          this.confirmDeactivate(rowNode.data);
        }
        break;
    }
  }

  onFilterChanged(event) {
    this.filtering = true;
    this.filterModel = this.agGrid?.api?.getFilterModel();
    setTimeout(() => {
      this.filtering = false;
    }, 1000);
  }

  editBotKey(key: any) {
    const self = this;
    this.editKey.emit(key);
    // self.keyForm.get('label').patchValue(key.label)
    // self.keyForm.get('expires').patchValue(key.expires / 1440)
    // self.editKeyModalRef = self.commonService.modal(self.newKeyModal, { size: 'sm' });
    // self.editKeyModalRef.result.then(close => {
    //   if (close) {
    //     const payload = self.keyForm.value;
    //     payload.expires = payload.expires * 1440;
    //     payload.keyId = key._id;
    //     self.showLazyLoader = true;

    //     self.commonService.put('user', `/${this.commonService.app._id}/bot/utils/botKey/${self.selectedBot._id}`, payload)
    //       .subscribe((res) => {
    //         self.showLazyLoader = false;
    //         self.selectedBot = res;
    //         self.dataChange.emit(res);
    //         if (this.gridApi) {
    //           this.gridApi.redrawRows()
    //         }
    //       }, err => {
    //         self.commonService.errorToast(err, 'Oops, something went wrong. Please try again later.');
    //       });
    //   } else {
    //     self.showLazyLoader = false;
    //     self.keyForm.reset();
    //   }
    // }, dismiss => {
    //   self.keyForm.reset();
    // });
  }

  getDate(key) {
    if (key.createdAt) {
      const time = new Date(key.createdAt).getTime();
      return new Date(time + key.expires * 60000);
    }
    else {
      return '-';
    }
  }

  copyKey(key) {
    const self = this;
    self.appService.copyToClipboard(key.keyValue);
    self.ts.success('Key copied successfully');
  }

  endSession(key: any) {
    const self = this;
    const payload = { keyId: key._id }
    self.showLazyLoader = true;

    self.commonService.delete('user', `/${this.commonService.app._id}/bot/utils/botKey/session/${self.selectedBot._id}`, payload)
      .subscribe((res) => {
        self.showLazyLoader = false;
        self.ts.success("Session ended");
        if (this.gridApi) {
          this.gridApi.redrawRows()
        }
      }, err => {
        self.showLazyLoader = false;
        self.commonService.errorToast(err, 'Oops, something went wrong. Please try again later.');
      });
  }

  deactivateKey(key) {
    const self = this;
    const payload = key
    payload.isActive = !key.isActive;
    payload.keyId = key._id;
    self.showLazyLoader = true;

    self.commonService.put('user', `/${this.commonService.app._id}/bot/utils/botKey/${self.selectedBot._id}`, payload)
      .subscribe((res) => {
        self.showLazyLoader = false;
        self.selectedBot = res;
        self.dataChange.emit(res);
        if (this.gridApi) {
          this.gridApi.redrawRows()
        }
      }, err => {
        self.showLazyLoader = false;
        self.commonService.errorToast(err, 'Oops, something went wrong. Please try again later.');
      });
  }


  deleteBotKey(key) {
    const self = this;
    const alertModal: any = {};
    alertModal.statusChange = false;
    alertModal.title = 'Delete Bot Key';
    alertModal.message = 'Are you sure you want to delete the bot key?';
    alertModal._id = key._id
    self.openDeleteBotKeyModal.emit(alertModal);
  }

  confirmDeactivate(key) {
    const self = this;
    const alertModal: any = {};
    alertModal.statusChange = false;
    alertModal.title = 'Deactivate Key';
    alertModal.message = 'Would you like to deactivate the key selected, It will stop all the action being performed unitl the key reactivated';
    alertModal._id = key._id;
    alertModal.key = key;
    alertModal.btnText = 'Deactivate'
    self.openDeleteBotKeyModal.emit(alertModal);
  }
  confirmReactivate(key) {
    const self = this;
    const alertModal: any = {};
    alertModal.statusChange = false;
    alertModal.usePrimaryButton = true;
    alertModal.title = 'Reactivate Key';
    alertModal.message = 'Would you like to reactivate the key selected, It will start  performing all the functions attached to it.';
    alertModal._id = key._id;
    alertModal.key = key;
    alertModal.btnText = 'Reactivate'
    self.openDeleteBotKeyModal.emit(alertModal);
  }
  confirmEndSession(key) {
    const self = this;
    const alertModal: any = {};
    alertModal.statusChange = false;
    alertModal.title = 'End Session';
    alertModal.message = 'Would you like to end the session of the key selected.';
    alertModal._id = key._id;
    alertModal.key = key;
    alertModal.btnText = 'End Session'
    self.openDeleteBotKeyModal.emit(alertModal);
  }


  closeDeleteBotKeyModal(event) {
    if (event.data) {
      if (event.action === 'Delete') {
        const self = this;
        const payload = { keyId: event.data._id }
        self.showLazyLoader = true;

        self.commonService.delete('user', `/${this.commonService.app._id}/bot/utils/botKey/${self.selectedBot._id}`, payload)
          .subscribe((res) => {
            self.showLazyLoader = false;
            self.selectedBot = res;
            self.dataChange.emit(res);
            if (this.gridApi) {
              this.gridApi.redrawRows()
            }
          }, err => {
            self.showLazyLoader = false;
            self.commonService.errorToast(err, 'Oops, something went wrong. Please try again later.');
          });
      }
      if (event.action === 'Deactivate' || event.action === 'Reactivate') {
        this.deactivateKey(event.data.key)
      }
      if (event.action === 'End Session') {
        this.endSession(event.data.key)
      }
    }
  }
  hasPermission(type: string): boolean {
    const self = this;
    return self.commonService.hasPermission(type);
  }

  formatLastLogin(timestamp) {
    if (timestamp) {
      return moment(timestamp).utc().format('hh:mm A , DD/MM/YYYY' + '(UTC)');
    }
  }

  refreshCell() {
    if (this.agGrid.api) {
      this.agGrid.api.redrawRows()
    }
  }

  enterToSelect(event) {
    this.searchTerm = event;
    let filtered;
    if (event === '' || event === 'reset') {
      filtered = this.selectedBot.botKeys;
    }
    else {
      filtered = this.selectedBot.botKeys.filter(ele => ele.label.indexOf(event) > -1)
    }

    this.gridOptions.api.setRowData(filtered)

  }

  add() {
    this.onAdd.emit('Keys')
  }
}
