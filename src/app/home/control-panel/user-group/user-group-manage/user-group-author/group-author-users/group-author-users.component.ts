import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-group-author-users',
  templateUrl: './group-author-users.component.html',
  styleUrls: ['./group-author-users.component.scss']
})
export class GroupAuthorUsersComponent implements OnInit {

  @Input() roles: Array<any>;
  @Output() rolesChange: EventEmitter<Array<any>>;
  edit: any;
  managePermissions: Array<string>;
  viewPermissions: Array<string>;

  constructor(private commonService: CommonService) {
    this.rolesChange = new EventEmitter();
    this.edit = { status: true };
    this.managePermissions = ['PMUBC', 'PMUBU', 'PMUBD', 'PMUA', 'PMUG'];
    this.viewPermissions = ['PVUB'];
  }

  ngOnInit() {
  }

  togglePermissionLevel(segment: string) {
    const blockedIndex = this.roles.findIndex(r => r.id === 'PMUB' + segment && r.entity === 'USER');
    if (blockedIndex > -1) {
      this.roles.splice(blockedIndex, 1);
    } else {
      this.roles.push(this.getPermissionObject('PMUB' + segment, 'USER'));
    }
  }

  getPermissionObject(id: string, entity: any) {
    return {
      id: id,
      app: this.commonService.app._id,
      entity: entity,
      type: 'author'
    };
  }

  hasPermission(type: string) {
    return this.commonService.hasPermission(type);
  }

  changeAllPermissions(val: string) {
    if (val == 'manage') {
      _.remove(this.roles, (item) => item.id.startsWith('PMU') || item.id.startsWith('PVU'));
      this.managePermissions.forEach(item => {
        this.roles.push(this.getPermissionObject(item, 'USER'));
      });
    } else if (val == 'view') {
      _.remove(this.roles, (item) => item.id.startsWith('PMU') || item.id.startsWith('PVU'));
      this.viewPermissions.forEach(item => {
        this.roles.push(this.getPermissionObject(item, 'USER'));
      });
    } else if (val == 'blocked') {
      _.remove(this.roles, (item) => item.id.startsWith('PMU') || item.id.startsWith('PVU'));
    }
  }

  get globalPermission() {
    const perms = this.roles.map(e => e.id);
    if (_.intersection(this.managePermissions, perms).length === this.managePermissions.length) {
      return 'manage';
    } else if (_.intersection(this.viewPermissions, perms).length === this.viewPermissions.length) {
      return 'view';
    } else if (perms.length == 0) {
      return 'blocked';
    } else {
      return 'custom';
    }
  }

  get basicPermission() {
    const viewIndex = this.roles.findIndex(r => r.id === 'PVUB' && r.entity === 'USER');
    const manageIndex = this.roles.findIndex(r => (r.id === 'PMUBC'
      || r.id === 'PMUBU'
      || r.id === 'PMUBD'
      || r.id === 'PMUBCE') && r.entity === 'USER');
    if (manageIndex > -1) {
      return 'manage';
    }
    if (viewIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }

  set basicPermission(val: any) {
    const blockedIndex = this.roles.findIndex(r => r.id === 'PNUB' && r.entity === 'USER');
    if (blockedIndex > -1) {
      this.roles.splice(blockedIndex, 1);
    }
    const viewIndex = this.roles.findIndex(r => r.id === 'PVUB' && r.entity === 'USER');
    if (viewIndex > -1) {
      this.roles.splice(viewIndex, 1);
    }
    const createIndex = this.roles.findIndex(r => r.id === 'PMUBC' && r.entity === 'USER');
    if (createIndex > -1) {
      this.roles.splice(createIndex, 1);
    }
    const createExternalIndex = this.roles.findIndex(r => r.id === 'PMUBCE' && r.entity === 'USER');
    if (createExternalIndex > -1) {
      this.roles.splice(createExternalIndex, 1);
    }
    const editIndex = this.roles.findIndex(r => r.id === 'PMUBU' && r.entity === 'USER');
    if (editIndex > -1) {
      this.roles.splice(editIndex, 1);
    }
    const deleteIndex = this.roles.findIndex(r => r.id === 'PMUBD' && r.entity === 'USER');
    if (deleteIndex > -1) {
      this.roles.splice(deleteIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        this.roles.push(this.getPermissionObject(item, 'USER'));
      });
    } else {
      if (val === 'PNUB') {
        this.sessionPermission = 'PNUA';
        this.groupPermission = 'PNUG';
      }
      this.roles.push(this.getPermissionObject(val, 'USER'));
    }
  }

  get sessionPermission() {
    const manageIndex = this.roles.findIndex(r => r.id === 'PMUA');
    if (manageIndex > -1) {
      return 'manage';
    }
    return 'blocked';
  }

  set sessionPermission(val: any) {
    const blockedIndex = this.roles.findIndex(r => r.id === 'PNUA' && r.entity === 'USER');
    if (blockedIndex > -1) {
      this.roles.splice(blockedIndex, 1);
    }
    const manageIndex = this.roles.findIndex(r => r.id === 'PMUA' && r.entity === 'USER');
    if (manageIndex > -1) {
      this.roles.splice(manageIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        this.roles.push(this.getPermissionObject(item, 'USER'));
      });
    } else {
      if (val === 'PMUA' && this.basicPermission === 'blocked') {
        this.basicPermission = 'PVUB';
      }
      this.roles.push(this.getPermissionObject(val, 'USER'));
    }
  }

  get groupPermission() {
    const manageIndex = this.roles.findIndex(r => r.id === 'PMUG');
    if (manageIndex > -1) {
      return 'manage';
    }
    return 'blocked';
  }

  set groupPermission(val: any) {
    const blockedIndex = this.roles.findIndex(r => r.id === 'PNUG' && r.entity === 'USER');
    if (blockedIndex > -1) {
      this.roles.splice(blockedIndex, 1);
    }
    const manageIndex = this.roles.findIndex(r => r.id === 'PMUG' && r.entity === 'USER');
    if (manageIndex > -1) {
      this.roles.splice(manageIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        this.roles.push(this.getPermissionObject(item, 'USER'));
      });
    } else {
      if (val === 'PMUG' && this.basicPermission === 'blocked') {
        this.basicPermission = 'PVUB';
      }
      this.roles.push(this.getPermissionObject(val, 'USER'));
    }
  }

}
