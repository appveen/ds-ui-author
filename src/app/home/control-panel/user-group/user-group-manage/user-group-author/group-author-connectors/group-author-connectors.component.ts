import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-group-author-connectors',
  templateUrl: './group-author-connectors.component.html',
  styleUrls: ['./group-author-connectors.component.scss']
})
export class GroupAuthorConnectorsComponent implements OnInit {

  @Input() roles: Array<any>;
  @Output() rolesChange: EventEmitter<Array<any>>;
  edit: any;

  constructor(
    private commonService: CommonService,
  ) {
    this.roles = [];
    this.rolesChange = new EventEmitter();
    this.edit = { status: true };
  }

  ngOnInit() {
    if (!this.roles) {
      this.roles = [];
    }
  }

  hasPermission(type: string) {
    return this.commonService.hasPermission(type);
  }

  getPermissionObject(type: string,) {
    return {
      id: type,
      app: this.commonService.app._id,
      entity: 'CON',
      type: 'author'
    };
  }

  set permissionType(val: any) {
    const blockedIndex = this.roles.findIndex(r => r.id === 'PNCON' && r.entity === 'CON');
    if (blockedIndex > -1) {
      this.roles.splice(blockedIndex, 1);
    }
    const manageIndex = this.roles.findIndex(r => r.id === 'PMCON' && r.entity === 'CON');
    if (manageIndex > -1) {
      this.roles.splice(manageIndex, 1);
    }
    const viewIndex = this.roles.findIndex(r => r.id === 'PVCON' && r.entity === 'CON');
    if (viewIndex > -1) {
      this.roles.splice(viewIndex, 1);
    }
    this.roles.push(this.getPermissionObject(val));
  }

  get permissionType() {
    if (this.roles.find(r => r.id === 'PMCON' && r.entity === 'CON')) {
      return 'manage';
    } else if (this.roles.find(r => r.id === 'PVCON' && r.entity === 'CON')) {
      return 'view';
    } else {
      return 'blocked';
    }
  }

}
