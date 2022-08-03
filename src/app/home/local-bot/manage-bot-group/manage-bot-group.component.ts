import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AgGridAngular } from 'ag-grid-angular';
import { GridOptions } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/utils/services/common.service';
import { UserToGroupModalComponent } from '../../control-panel/user/user-to-group-modal/user-to-group-modal.component';

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

  }

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
