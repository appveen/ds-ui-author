import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/utils/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { GridOptions, GridReadyEvent, RowNode } from 'ag-grid-community';
import { AgGridActionsRendererComponent } from '../../../utils/ag-grid-actions-renderer/ag-grid-actions-renderer.component';
import { LocalBotCellRendererComponent } from '../local-bot-cell-renderer/local-bot-cell-renderer.component';
import { AgGridAngular } from 'ag-grid-angular';
import { UserGridAppsRendererComponent } from '../../control-panel/user/user-grid-apps.component ';
import { UserToGroupModalComponent } from '../../control-panel/user/user-to-group-modal/user-to-group-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { E } from '@angular/cdk/keycodes';

@Component({
  selector: 'odp-manage-bot-group',
  templateUrl: './manage-bot-group.component.html',
  styleUrls: ['./manage-bot-group.component.scss']
})
export class ManageBotGroupComponent implements OnInit {
  @Input() selectedBot: any;
  @Input() userTeams: any;
  @Input() allTeams: any;
  openDeleteModal: EventEmitter<any>;
  @Output() dataChange: EventEmitter<any>;
  @Output() assign: EventEmitter<any> = new EventEmitter();
  @Output() onAdd: EventEmitter<any> = new EventEmitter();

  showLazyLoader: boolean;
  frameworkComponents: any;
  searchTerm: any;

  @ViewChild('agGrid') agGrid: AgGridAngular;
  gridOptions: GridOptions;
  constructor(
    public commonService: CommonService,
    private ts: ToastrService,
    private dialog: MatDialog,

  ) {
    const self = this;
    self.openDeleteModal = new EventEmitter();
    self.dataChange = new EventEmitter();
  }

  ngOnInit() {
    this.setupGrid();
  }

  setupGrid() {
    this.frameworkComponents = {
      customCellRenderer: LocalBotCellRendererComponent,
      actionCellRenderer: AgGridActionsRendererComponent,
      appCheckRenderer: UserGridAppsRendererComponent
    };

    const columnDefs = [
      {
        headerName: 'NAME',
        field: 'name',
        filter: false,
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
      {
        headerName: '',
        cellRenderer: 'actionCellRenderer',
        type: 'rightAligned',

        refData: {
          actionsButtons: 'Delete',
          actionCallbackFunction: 'onGridAction',
        },
      }]
    this.gridOptions = {

      columnDefs: columnDefs,
      context: this,
      rowData: this.userTeams,
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

  onGridAction(buttonName: string, rowNode: RowNode) {
    switch (buttonName) {
      case 'Delete':
        {
          this.removeGroupForUser(rowNode.data);
        }
        break;
    }
  }

  onGridReady(event: GridReadyEvent) {
    if (event.api) {
      event.api.sizeColumnsToFit()
    }
  }

  // private forceResizeColumns() {
  //   this.agGrid.api.sizeColumnsToFit();
  //   this.autoSizeAllColumns();
  // }

  // private autoSizeAllColumns() {
  //   const fixedSize = this.hasPermission('PMBBU') ? 94 : 0;
  //   if (!!this.agGrid.api && !!this.agGrid.columnApi) {
  //     setTimeout(() => {
  //       const container = document.querySelector('.grid-container');
  //       const availableWidth = !!container
  //         ? container.clientWidth - fixedSize
  //         : 730;
  //       const allColumns = this.agGrid.columnApi.getAllColumns() || [];
  //       allColumns.forEach((col) => {
  //         this.agGrid.columnApi.autoSizeColumn(col);
  //         if (
  //           col.getActualWidth() > 200 ||
  //           this.agGrid.api.getDisplayedRowCount() === 0
  //         ) {
  //           col.setActualWidth(200);
  //         }
  //       });
  //       const occupiedWidth = allColumns.reduce(
  //         (pv, cv) => pv + cv.getActualWidth(),
  //         -fixedSize
  //       );
  //       if (occupiedWidth < availableWidth) {
  //         this.agGrid.api.sizeColumnsToFit();
  //       }
  //     }, 2000);
  //   }
  // }

  removeGroupForUser(data) {
    const self = this;
    const teamName = data.name;
    const teamId = data._id;
    const alertModal: any = {};
    alertModal.title = `Remove Group ${teamName}`;
    alertModal.message = `Are you sure you want to remove group <span class="text-delete font-weight-bold">
        ${teamName}</span> for user <span class="text-delete font-weight-bold">${self.selectedBot.basicDetails.name}</span>?`;
    alertModal.removeGroupForUser = true;
    alertModal.teamName = teamName;
    alertModal.teamId = teamId;
    alertModal.btnText = 'Remove';
    self.openDeleteModal.emit(alertModal);

  }
  closeDeleteModal(data) {
    const self = this;
    const teamIds = [data.teamId];
    self.showLazyLoader = true;
    self.commonService.put('user', `/${this.commonService.app._id}/user/utils/removeFromGroups/${self.selectedBot._id}`, { groups: teamIds })
      .subscribe(() => {
        self.showLazyLoader = false
        self.dataChange.emit();
        if (this.agGrid.api) {
          this.agGrid.api.refreshCells()
        }
        self.ts.success(`${data.teamName} Group has been removed for user ${self.selectedBot.basicDetails.name}`);
      }, err => {
        self.ts.error(err.error.message);
      });
  }
  hasPermission(type: string): boolean {
    const self = this;
    return self.commonService.hasPermission(type);
  }

  openGroupModal() {
    const dialogRef = this.dialog.open(UserToGroupModalComponent, {
      width: '60vw',
      height: '65vh',
      data: {
        groupList: this.allTeams,
        userGroups: this.userTeams,
        user: this.selectedBot,
      },
    });

    dialogRef.afterClosed().subscribe((apiHit) => {
      if (apiHit) {
        this.assign.emit();
        if (this.agGrid.api) {
          this.agGrid.api.refreshCells()
        }
      }
    });
  }

  enterToSelect(event) {
    this.searchTerm = event;
    let filtered;
    if (this.searchTerm === '' || this.searchTerm === 'reset') {
      filtered = this.userTeams
    } else {
      filtered = this.userTeams.filter(ele => ele.name.indexOf(event) > -1)


    }
    this.gridOptions.api.setRowData(filtered)

  }

  add() {
    this.onAdd.emit('Groups')
  }

}
