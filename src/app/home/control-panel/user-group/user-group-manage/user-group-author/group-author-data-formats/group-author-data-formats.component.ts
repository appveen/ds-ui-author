import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-group-author-data-formats',
  templateUrl: './group-author-data-formats.component.html',
  styleUrls: ['./group-author-data-formats.component.scss']
})
export class GroupAuthorDataFormatsComponent implements OnInit {

  @Input() roles: Array<any>;
  @Output() rolesChange: EventEmitter<Array<any>>;


  constructor(
    private commonService: CommonService,
  ) {
    this.roles = [];
    this.rolesChange = new EventEmitter();
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
      entity: 'DF',
      type: 'author'
    };
  }

  set permissionType(val: any) {
    const blockedIndex = this.roles.findIndex(r => r.id === 'PNDF' && r.entity === 'DF');
    if (blockedIndex > -1) {
      this.roles.splice(blockedIndex, 1);
    }
    const manageIndex = this.roles.findIndex(r => r.id === 'PMDF' && r.entity === 'DF');
    if (manageIndex > -1) {
      this.roles.splice(manageIndex, 1);
    }
    const viewIndex = this.roles.findIndex(r => r.id === 'PVDF' && r.entity === 'DF');
    if (viewIndex > -1) {
      this.roles.splice(viewIndex, 1);
    }
    this.roles.push(this.getPermissionObject(val));
  }

  get permissionType() {
    if (this.roles.find(r => r.id === 'PMDF' && r.entity === 'DF')) {
      return 'manage';
    } else if (this.roles.find(r => r.id === 'PVDF' && r.entity === 'DF')) {
      return 'view';
    } else {
      return 'blocked';
    }
  }

}
