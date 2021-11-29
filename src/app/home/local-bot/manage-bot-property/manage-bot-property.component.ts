import { Component, OnInit, Input, ViewChild, TemplateRef, EventEmitter, Output } from '@angular/core';
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
  styleUrls: ['./manage-bot-property.component.scss']
})
export class ManageBotPropertyComponent implements OnInit {
  @ViewChild('newAttributeModal', { static: false }) newAttributeModal: TemplateRef<HTMLElement>;
  @ViewChild('editAttributeModal', { static: false }) editAttributeModal: TemplateRef<HTMLElement>;
  @ViewChild('agGrid') agGrid: AgGridAngular;
  @Output() dataChange: EventEmitter<any>;
  private _selecteBot;
  openDeleteModal: EventEmitter<any>;
  showLazyLoader: boolean;
  editAttributeForm: FormGroup;
  gridOptions: GridOptions;
  frameworkComponents: any;
  filterModel: any;
  filtering: boolean;

  get selectedBot() {
    const self = this;
    return self._selecteBot;
  }
  @Input() set selectedBot(value) {
    const self = this;
    self._selecteBot = value;
    const arr = [];
    if (self.selectedBot && self.selectedBot.attributes) {
      Object.keys(self.selectedBot.attributes).forEach(key => {
        if (self.selectedBot.attributes[key]) {
          arr.push({
            key,
            label: self.selectedBot.attributes[key].label,
            value: self.selectedBot.attributes[key].value,
            type: self.selectedBot.attributes[key].type
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
      { class: 'odp-abc', value: 'String', label: 'Text' },
      { class: 'odp-123', value: 'Number', label: 'Number' },
      { class: 'odp-boolean', value: 'Boolean', label: 'True/False' },
      { class: 'odp-calendar', value: 'Date', label: 'Date' }
    ];
    self.toggleFieldTypeSelector = {};
    self.openDeleteModal = new EventEmitter();
    self.dataChange = new EventEmitter();
    self.additionalDetails = self.fb.group({
      extraInfo: self.fb.array([])
    });
    self.editAttribute = {};
  }

  ngOnInit() {
    this.setupGrid();
  }

  setupGrid() {
    this.frameworkComponents = {
      customCellRenderer: LocalBotCellRendererComponent,
      actionCellRenderer: AgGridActionsRendererComponent
    };
    this.gridOptions = {
      defaultColDef: {
        cellRenderer: 'customCellRenderer',
        headerClass: 'hide-filter-icon',
        resizable: true,
        sortable: true,
        filter: 'agTextColumnFilter',
        suppressMenu: true,
        floatingFilter: true,
        floatingFilterComponentFramework: AgGridSharedFloatingFilterComponent,
        filterParams: {
          caseSensitive: true,
          suppressAndOrCondition: true,
          suppressFilterButton: true
        }
      },
      columnDefs: [
        {
          headerName: 'Label',
          field: 'label',
          refData: {
            filterType: 'text',
            namespace: 'properties'
          }
        },
        {
          headerName: 'Type',
          field: 'type',
          refData: {
            filterType: 'list_of_values',
            mapperFunction: 'gridTypesMapper',
            namespace: 'properties'
          }
        },
        {
          headerName: 'Value',
          field: 'value',
          filter: false,
          refData: {
            namespace: 'properties'
          }
        },
        ...(this.hasPermission('PMBBU')
          ? [
            {
              headerName: 'Actions',
              pinned: 'right',
              cellRenderer: 'actionCellRenderer',
              sortable: false,
              filter: false,
              minWidth: 94,
              maxWidth: 94,
              refData: {
                actionsButtons: 'Edit,Delete',
                actionCallbackFunction: 'onGridAction'
              }
            }
          ]
          : [])
      ],
      context: this,
      animateRows: true,
      onGridReady: this.onGridReady.bind(this),
      onRowDataChanged: this.autoSizeAllColumns.bind(this),
      onGridSizeChanged: this.forceResizeColumns.bind(this),
    };
  }

  gridTypesMapper(data: any[]) {
    return this.types.map(type => ({ label: type.label, value: type.value }));
  }

  private onGridReady(event: GridReadyEvent) {
    this.forceResizeColumns();
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
        const availableWidth = !!container ? container.clientWidth - fixedSize : 730;
        const allColumns = this.agGrid.columnApi.getAllColumns();
        allColumns.forEach(col => {
          this.agGrid.columnApi.autoSizeColumn(col);
          if (col.getActualWidth() > 200 || this.agGrid.api.getDisplayedRowCount() === 0) {
            col.setActualWidth(200);
          }
        });
        const occupiedWidth = allColumns.reduce((pv, cv) => pv + cv.getActualWidth(), -fixedSize);
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

  onFilterChanged(event) {
    this.filtering = true;
    this.filterModel = this.agGrid?.api?.getFilterModel();
    setTimeout(() => {
      this.filtering = false;
    }, 1000);
  }

  get userAttributes() {
    const self = this;
    return (self.additionalDetails.get('extraInfo') as FormArray).controls;
  }


  // To add new additional information for user
  addNewDetail() {
    const self = this;
    const newData = self.getAttributesFormGroup();
    (self.additionalDetails.get('extraInfo') as FormArray).push(newData);

  }

  getAttributesFormGroup() {
    return this.fb.group({
      label: ['', [Validators.required, Validators.maxLength(30)]],
      key: ['', [Validators.required]],
      type: ['String', [Validators.required]],
      value: ['', [Validators.required]]
    });
  }

  getLabelError(i) {
    const self = this;
    return self.additionalDetails.get(['extraInfo', i, 'label']).touched
      && self.additionalDetails.get(['extraInfo', i, 'label']).dirty
      && self.additionalDetails.get(['extraInfo', i, 'label']).hasError('required');
  }

  getValError(formGroup: FormGroup) {
    return formGroup.get('value').touched && formGroup.get('value').dirty && formGroup.get('value').hasError('required');
  }

  setKey(i) {
    const self = this;
    const val = self.additionalDetails.get(['extraInfo', i, 'label']).value;
    self.additionalDetails.get(['extraInfo', i, 'key']).patchValue(self.appService.toCamelCase(val));
  }

  newField(event) {
    const self = this;
    if (event.key === 'Enter') {
      self.addNewDetail();
    }
  }
  setUserAttributeType(type: any, index: number) {
    const self = this;
    self.toggleFieldTypeSelector[index] = false;
    self.additionalDetails.get(['extraInfo', index, 'type']).patchValue(type.value);
    if (type.value === 'Boolean') {
      self.additionalDetails.get(['extraInfo', index, 'value']).patchValue(false);
    } else {
      self.additionalDetails.get(['extraInfo', index, 'value']).patchValue(null);
    }
  }


  addExtraDetails() {
    const self = this;
    let empty = false;
    self.userAttributes.forEach((control) => {
      const label = control.get('label').value;
      const val = control.get('value').value;
      empty = label === '' || val === '';
    });
    if (empty) {
      self.ts.warning('Please check the form fields, looks like few fields are empty');
    } else {
      self.newAttributeModalRef.close();
      self.userAttributes.forEach((data) => {
        const payload = data.value;
        const detailKey = payload.key;
        delete payload.key;
        if (!self.selectedBot.attributes) {
          self.selectedBot.attributes = {};
        }
        self.selectedBot.attributes[detailKey] = payload;
      });
      self.showLazyLoader = true;

      self.commonService.put('user', `/usr/${self.selectedBot._id}?app=${this.commonService.app._id}`, self.selectedBot)
        .subscribe(() => {
          self.showLazyLoader = false;

          self.ts.success('Added custom Details successfully');
          self.resetAdditionDetailForm();
        }, (err) => {
          self.showLazyLoader = false;

          self.ts.error(err.error.message);
          self.resetAdditionDetailForm();
        });
    }
  }

  closeDeleteModal(data) {
    const self = this;
    if (data) {
      if (typeof data.attrName !== 'undefined') {
        self.showLazyLoader = true;

        delete self.selectedBot.attributes[data.attrName];
        self.commonService.put('user', '/usr/' + self.selectedBot._id + '?app=' + this.commonService.app._id, self.selectedBot)
          .subscribe((res) => {
            self.showLazyLoader = false;

            self.dataChange.emit(res);

            self.ts.success('Attribute deleted successfully');
            self.resetAdditionDetailForm();

          }, (err) => {
            self.showLazyLoader = false;

            self.ts.error(err.error.message);
            self.resetAdditionDetailForm();
          });
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
      extraInfo: self.fb.array([])
    });
  }
  openEditAttributeModal(item) {
    const self = this;
    if (!self.editAttributeForm) {
      self.editAttributeForm = this.getAttributesFormGroup();
    }
    self.editAttributeForm.patchValue(self.appService.cloneObject(item));
    self.editAttributeForm.get('key').disable();
    delete self.selectedBot.attributes[item.key];
    self.editAttributeModalRef = self.commonService.modal(self.editAttributeModal);
    self.editAttributeModalRef.result.then(close => {
      if (close) {
        const key = self.editAttributeForm.get('key').value;
        self.showLazyLoader = true;
        self.selectedBot.attributes[key] = self.editAttributeForm.value;
        self.commonService.put('user', `/usr/${self.selectedBot._id}?app=${this.commonService.app._id}`, self.selectedBot)
          .subscribe((res) => {
            self.showLazyLoader = false;
            self.dataChange.emit(res);
            self.ts.success('Custom Details Saved Successfully');
            self.editAttributeForm.reset();
          }, (err) => {
            self.showLazyLoader = false;
            self.ts.error(err.error.message);
            self.editAttributeForm.reset();
          });
      } else {
        const key = item.key;
        self.selectedBot.attributes[key] = item;
      }
    }, dismiss => {
      self.editAttributeForm.reset();
    });
  }

  deleteAdditionInfo(attrName) {
    const self = this;
    const alertModal: any = {};
    alertModal.title = 'Delete Attribute';
    alertModal.message = 'Are you sure you want to delete <span class="text-delete font-weight-bold">'
      + attrName + '</span> Attribute?';
    alertModal.attrName = attrName;
    self.openDeleteModal.emit(alertModal);
  }
  hasPermission(type: string): boolean {
    const self = this;
    return self.commonService.hasPermission(type);
  }
}
