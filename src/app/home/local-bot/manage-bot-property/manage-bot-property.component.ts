import {
  Component,
  OnInit,
  Input,
  ViewChild,
  TemplateRef,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormGroup, Validators, FormArray, FormBuilder } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AgGridAngular } from 'ag-grid-angular';
import { GridOptions, GridReadyEvent, RowNode } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { AgGridActionsRendererComponent } from 'src/app/utils/ag-grid-actions-renderer/ag-grid-actions-renderer.component';
import { AgGridSharedFloatingFilterComponent } from 'src/app/utils/ag-grid-shared-floating-filter/ag-grid-shared-floating-filter.component';

import { AppService } from 'src/app/utils/services/app.service';
import { CommonService } from 'src/app/utils/services/common.service';
import { LocalBotCellRendererComponent } from '../local-bot-cell-renderer/local-bot-cell-renderer.component';

@Component({
  selector: 'odp-manage-bot-property',
  templateUrl: './manage-bot-property.component.html',
  styleUrls: ['./manage-bot-property.component.scss'],
})
export class ManageBotPropertyComponent implements OnInit {
  @ViewChild('newAttributeModal', { static: false })
  newAttributeModal: TemplateRef<HTMLElement>;
  @ViewChild('editAttributeModal', { static: false })
  editAttributeModal: TemplateRef<HTMLElement>;
  @ViewChild('agGrid') agGrid: AgGridAngular;
  @Output() dataChange: EventEmitter<any>;
  @Output() editProperty: EventEmitter<any> = new EventEmitter();
  private _selecteBot;
  openDeleteModal: EventEmitter<any>;
  showLazyLoader: boolean;
  editAttributeForm: FormGroup;
  gridOptions: GridOptions;
  frameworkComponents: any;
  filterModel: any;
  filtering: boolean;
  @Output() onAdd: EventEmitter<any> = new EventEmitter();
  searchTerm: any;


  get selectedBot() {
    const self = this;
    return self._selecteBot;
  }
  @Input() set selectedBot(value) {
    const self = this;
    self._selecteBot = value;
    const arr = [];
    if (self.selectedBot && self.selectedBot.attributes) {
      Object.keys(self.selectedBot.attributes).forEach((key) => {
        if (self.selectedBot.attributes[key]) {
          arr.push({
            key,
            label: self.selectedBot.attributes[key].label,
            value: self.selectedBot.attributes[key].value,
            type: self.selectedBot.attributes[key].type,
          });
        }
      });
    }
    self.userAttributeList = arr;
  }
  additionalDetails: FormGroup;
  toggleFieldTypeSelector: any;
  newAttributeModalRef: NgbModalRef;
  editAttributeModalRef: NgbModalRef;
  editAttribute: any;
  userAttributeList: Array<any>;
  types: Array<any>;

  constructor(
    private ts: ToastrService,
    private fb: FormBuilder,
    private appService: AppService,
    public commonService: CommonService
  ) {
    const self = this;
    self.types = [
      { class: 'dsi-text', value: 'String', label: 'Text' },
      { class: 'dsi-number', value: 'Number', label: 'Number' },
      { class: 'dsi-boolean', value: 'Boolean', label: 'True/False' },
      { class: 'dsi-date', value: 'Date', label: 'Date' },
    ];
    self.toggleFieldTypeSelector = {};
    self.openDeleteModal = new EventEmitter();
    self.dataChange = new EventEmitter();
    self.additionalDetails = self.fb.group({
      extraInfo: self.fb.array([]),
    });
    self.editAttribute = {};
  }

  ngOnInit() {
    this.setupGrid();
  }

  setupGrid() {
    this.frameworkComponents = {
      customCellRenderer: LocalBotCellRendererComponent,
      actionCellRenderer: AgGridActionsRendererComponent,
    };

    const columnDefs = [
      {
        headerName: 'Label',
        field: 'label',
      },
      {
        headerName: 'Type',
        field: 'type',
      },
      {
        headerName: 'Value',
        field: 'value',
        filter: false,
      },
      ...(this.hasPermission('PMBBU')
        ? [
          {
            headerName: '',
            cellRenderer: 'actionCellRenderer',
            refData: {
              actionsButtons: 'Edit,Delete',
              actionCallbackFunction: 'onGridAction',
            },
          },
        ]
        : []),
    ];
    this.gridOptions = {

      columnDefs: columnDefs,
      context: this,
      rowData: this.userAttributeList,
      paginationPageSize: 30,
      cacheBlockSize: 30,
      floatingFilter: false,
      animateRows: true,
      rowHeight: 48,
      headerHeight: 48,
      frameworkComponents: this.frameworkComponents,
      suppressPaginationPanel: true,
      suppressCellSelection: true,

    };


  }

  gridTypesMapper(data: any[]) {
    return this.types.map((type) => ({ label: type.label, value: type.value }));
  }

  onGridReady(event: GridReadyEvent) {
    if (this.agGrid.api && this.agGrid.columnApi) {
      this.forceResizeColumns()
    }
  }

  private forceResizeColumns() {
    this.agGrid.api.sizeColumnsToFit();
    this.autoSizeAllColumns();
  }

  private autoSizeAllColumns() {
    const fixedSize = this.hasPermission('PMBBU') ? 94 : 0;
    if (!!this.agGrid.api && !!this.agGrid.columnApi) {
      setTimeout(() => {
        const container = document.querySelector('.grid-container');
        const availableWidth = !!container
          ? container.clientWidth - fixedSize
          : 730;
        const allColumns = this.agGrid.columnApi.getAllColumns() || [];
        allColumns.forEach((col) => {
          this.agGrid.columnApi.autoSizeColumn(col);
          if (
            col.getActualWidth() > 200 ||
            this.agGrid.api.getDisplayedRowCount() === 0
          ) {
            col.setActualWidth(200);
          }
        });
        const occupiedWidth = allColumns.reduce(
          (pv, cv) => pv + cv.getActualWidth(),
          -fixedSize
        );
        if (occupiedWidth < availableWidth) {
          this.agGrid.api.sizeColumnsToFit();
        }
      }, 2000);
    }
  }

  onGridAction(buttonName: string, rowNode: RowNode) {
    switch (buttonName) {
      case 'Edit':
        {
          this.openEditAttributeModal(rowNode.data);
        }
        break;
      case 'Delete':
        {
          this.deleteAdditionInfo(rowNode.data.key);
        }
        break;
    }
  }


  closeDeleteModal(data) {
    const self = this;
    if (data) {
      if (typeof data.attrName !== 'undefined') {
        self.showLazyLoader = true;

        delete self.selectedBot.attributes[data.attrName];
        self.commonService
          .put(
            'user',
            `/${this.commonService.app._id}/bot/${self.selectedBot._id}`,
            self.selectedBot
          )
          .subscribe(
            (res) => {
              self.showLazyLoader = false;

              self.dataChange.emit(res);

              self.ts.success('Attribute deleted successfully');
              self.resetAdditionDetailForm();
            },
            (err) => {
              self.showLazyLoader = false;

              self.ts.error(err.error.message);
              self.resetAdditionDetailForm();
            }
          );
      }
    }
  }
  removeField(index) {
    const self = this;
    (self.additionalDetails.get('extraInfo') as FormArray).removeAt(index);
  }
  private resetAdditionDetailForm() {
    const self = this;
    self.additionalDetails.reset();
    self.additionalDetails = self.fb.group({
      extraInfo: self.fb.array([]),
    });
  }
  openEditAttributeModal(item) {
    const self = this;
    this.editProperty.emit(item)

  }

  deleteAdditionInfo(attrName) {
    const self = this;
    const alertModal: any = {};
    alertModal.title = 'Delete Attribute';
    alertModal.message =
      'Are you sure you want to delete <span class="text-delete font-weight-bold">' +
      attrName +
      '</span> Attribute?';
    alertModal.attrName = attrName;
    self.openDeleteModal.emit(alertModal);
  }
  hasPermission(type: string): boolean {
    const self = this;
    return self.commonService.hasPermission(type);
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
      filtered = this.userAttributeList;
    }
    else {
      filtered = this.userAttributeList.filter(ele => ele.label.indexOf(event) > -1)
    }

    this.gridOptions.api.setRowData(filtered)

  }

  add() {
    this.onAdd.emit('Properties')
  }
}
