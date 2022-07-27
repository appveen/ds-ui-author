import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AgGridAngular } from 'ag-grid-angular';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  IDatasource,
  IGetRowsParams,
} from 'ag-grid-community';
import { UserGridAppsRendererComponent } from '../user-grid-apps.component ';
import * as _ from 'lodash';
import { CommonService } from '../../../../utils/services/common.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-user-to-group-modal',
  templateUrl: './user-to-group-modal.component.html',
  styleUrls: ['./user-to-group-modal.component.scss'],
})
export class UserToGroupModalComponent implements OnInit {
  gridApi: GridApi;
  gridOptions: GridOptions;
  dataSource: IDatasource;
  frameworkComponents: any;
  context: any;
  userGroups: any;
  groupList: any;
  selectedGroups: any;

  constructor(
    private commonService: CommonService,
    private ts: ToastrService,
    private dialogRef: MatDialogRef<UserToGroupModalComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}
  ngOnInit(): void {
    this.frameworkComponents = {
      appCheckRenderer: UserGridAppsRendererComponent,
    };

    this.groupList = this.data.groupList;
    this.userGroups = this.data.userGroups;
    this.configureGridSettings();
  }
  onGridReady(event) {
    this.gridApi = event.api;
    // this.setupGrid();
  }
  configureGridSettings() {
    const list = _.differenceBy(this.groupList, this.userGroups, '_id');
    const groupColumnDefs = [
      {
        headerName: '',
        field: '',
        width: 50,
        headerCheckboxSelection: true,
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: false,
      },
      {
        headerName: 'NAME',
        field: 'name',
        width: 300,
      },
      {
        headerName: 'MEMBERS',
        field: 'users',
        width: 150,
        valueFormatter: (params) => {
          return params?.value?.length || 0;
        },
      },
      {
        headerName: 'AUHTOR',
        field: 'roles',
        cellRenderer: 'appCheckRenderer',
        cellRendererParams: {
          checkApp: 'author',
        },
      },
      {
        headerName: 'APPCENTER',
        field: 'roles',
        cellRenderer: 'appCheckRenderer',
        cellRendererParams: {
          checkApp: 'author',
        },
      },
    ];

    this.gridOptions = {
      paginationPageSize: 30,
      cacheBlockSize: 30,
      floatingFilter: false,
      // datasource: this.dataSource,
      rowData: list,
      columnDefs: groupColumnDefs,
      animateRows: true,
      rowHeight: 48,
      headerHeight: 48,
      frameworkComponents: this.frameworkComponents,
      suppressPaginationPanel: true,
      context: this.context,
      rowSelection: 'multiple',

      onSelectionChanged: (event) => this.onSelectionChanged(event),

      // onCellValueChanged: this.onCellValueChanged,
    };
  }

  onSelectionChanged(data) {
    this.selectedGroups = this.gridApi.getSelectedRows();
  }

  addGroups() {
    const ids = this.selectedGroups.map((ele) => {
      return ele._id;
    });
    console.log(ids);
    this.commonService
      .put(
        'user',
        `/${this.commonService.app._id}/user/utils/addToGroups/${this.data.user._id}`,
        { groups: ids, app: this.commonService.app._id }
      )
      .subscribe(
        () => {
          this.ts.success('User has been added to groups successfully');
          // this.getUserTeam();
          this.closeDialog(true);
        },
        (err) => {
          this.commonService.errorToast(err);
        }
      );
  }
  closeDialog(add = false) {
    this.dialogRef.close(add);
  }
}
