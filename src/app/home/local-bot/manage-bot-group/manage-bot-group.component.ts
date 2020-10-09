import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CommonService } from 'src/app/utils/services/common.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'odp-manage-bot-group',
  templateUrl: './manage-bot-group.component.html',
  styleUrls: ['./manage-bot-group.component.scss']
})
export class ManageBotGroupComponent implements OnInit {
  @Input() selectedBot: any;
  @Input() userTeams: any;
  openDeleteModal: EventEmitter<any>;
  @Output() dataChange: EventEmitter<any>;
  showLazyLoader: boolean;
  constructor(
    public commonService: CommonService,
    private ts: ToastrService


  ) {
    const self = this;
    self.openDeleteModal = new EventEmitter();
    self.dataChange = new EventEmitter();
  }

  ngOnInit() {
  }

  removeGroupForUser(teamName, teamId) {
    const self = this;

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
    self.commonService.put('user', `/usr/${self.selectedBot._id}/removeFromGroups`, { groups: teamIds })
      .subscribe(() => {
        self.showLazyLoader = false
        self.dataChange.emit();
        self.ts.success(`${data.teamName} Group has been removed for user ${self.selectedBot.basicDetails.name}`);
      }, err => {
        self.ts.error(err.error.message);
      });
  }
  hasPermission(type: string): boolean {
    const self = this;
    return self.commonService.hasPermission(type);
  }
}
