import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-group-author-users',
  templateUrl: './group-author-users.component.html',
  styleUrls: ['./group-author-users.component.scss']
})
export class GroupAuthorUsersComponent implements OnInit {

  @Input() roles: Array<any>;
  @Output() rolesChange: EventEmitter<Array<any>>;
  dropdownToggle: {
    [key: string]: boolean;
  };
  constructor(private commonService: CommonService) {
    const self = this;
    self.rolesChange = new EventEmitter();
    self.dropdownToggle = {};
  }

  ngOnInit() {
    const self = this;
  }

  togglePermissionLevel(segment: string) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PMUB' + segment && r.entity === 'USER');
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    } else {
      self.roles.push(self.getPermissionObject('PMUB' + segment, 'USER'));
    }
  }

  getPermissionObject(id: string, entity: any) {
    const self = this;
    return {
      id: id,
      app: self.commonService.app._id,
      entity: entity,
      type: 'author'
    };
  }

  showHelp() {
    const self = this;

  }

  hasPermission(type: string) {
    const self = this;
    return self.commonService.hasPermission(type);
  }

  get authType() {
    const self = this;
    if (self.commonService.userDetails.auth && self.commonService.userDetails.auth.authType) {
      return self.commonService.userDetails.auth.authType;
    }
    return 'local';
  }

  get basicPermission() {
    const self = this;
    const viewIndex = self.roles.findIndex(r => r.id === 'PVUB' && r.entity === 'USER');
    const manageIndex = self.roles.findIndex(r => (r.id === 'PMUBC'
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
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNUB' && r.entity === 'USER');
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const viewIndex = self.roles.findIndex(r => r.id === 'PVUB' && r.entity === 'USER');
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }
    const createIndex = self.roles.findIndex(r => r.id === 'PMUBC' && r.entity === 'USER');
    if (createIndex > -1) {
      self.roles.splice(createIndex, 1);
    }
    const createExternalIndex = self.roles.findIndex(r => r.id === 'PMUBCE' && r.entity === 'USER');
    if (createExternalIndex > -1) {
      self.roles.splice(createExternalIndex, 1);
    }
    const editIndex = self.roles.findIndex(r => r.id === 'PMUBU' && r.entity === 'USER');
    if (editIndex > -1) {
      self.roles.splice(editIndex, 1);
    }
    const deleteIndex = self.roles.findIndex(r => r.id === 'PMUBD' && r.entity === 'USER');
    if (deleteIndex > -1) {
      self.roles.splice(deleteIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        self.roles.push(self.getPermissionObject(item, 'USER'));
      });
    } else {
      if (val === 'PNUB') {
        self.sessionPermission = 'PNUA';
        self.groupPermission = 'PNUG';
      }
      self.roles.push(self.getPermissionObject(val, 'USER'));
    }
  }

  get sessionPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMUA');
    if (manageIndex > -1) {
      return 'manage';
    }
    return 'blocked';
  }

  set sessionPermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNUA' && r.entity === 'USER');
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const manageIndex = self.roles.findIndex(r => r.id === 'PMUA' && r.entity === 'USER');
    if (manageIndex > -1) {
      self.roles.splice(manageIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        self.roles.push(self.getPermissionObject(item, 'USER'));
      });
    } else {
      if (val === 'PMUA' && self.basicPermission === 'blocked') {
        self.basicPermission = 'PVUB';
      }
      self.roles.push(self.getPermissionObject(val, 'USER'));
    }
  }

  get groupPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMUG');
    if (manageIndex > -1) {
      return 'manage';
    }
    return 'blocked';
  }

  set groupPermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNUG' && r.entity === 'USER');
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const manageIndex = self.roles.findIndex(r => r.id === 'PMUG' && r.entity === 'USER');
    if (manageIndex > -1) {
      self.roles.splice(manageIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        self.roles.push(self.getPermissionObject(item, 'USER'));
      });
    } else {
      if (val === 'PMUG' && self.basicPermission === 'blocked') {
        self.basicPermission = 'PVUB';
      }
      self.roles.push(self.getPermissionObject(val, 'USER'));
    }
  }

  get createPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMUBC' && r.entity === 'USER');
    if (manageIndex > -1) {
      return true;
    }
    return false;
  }

  get createExternalPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMUBCE' && r.entity === 'USER');
    if (manageIndex > -1) {
      return true;
    }
    return false;
  }

  get editPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMUBU' && r.entity === 'USER');
    if (manageIndex > -1) {
      return true;
    }
    return false;
  }

  get deletePermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMUBD' && r.entity === 'USER');
    if (manageIndex > -1) {
      return true;
    }
    return false;
  }

}
