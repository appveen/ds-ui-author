import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-group-author-bots',
  templateUrl: './group-author-bots.component.html',
  styleUrls: ['./group-author-bots.component.scss']
})
export class GroupAuthorBotsComponent implements OnInit {

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
    const blockedIndex = self.roles.findIndex(r => r.id === 'PMBB' + segment && r.entity === 'USER');
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    } else {
      self.roles.push(self.getPermissionObject('PMBB' + segment, 'USER'));
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

  get basicPermission() {
    const self = this;
    const viewIndex = self.roles.findIndex(r => r.id === 'PVBB' && r.entity === 'USER');
    const manageIndex = self.roles.findIndex(r => (r.id === 'PMBBC' || r.id === 'PMBBU' || r.id === 'PMBBD') && r.entity === 'USER');
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
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNBB' && r.entity === 'USER');
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const viewIndex = self.roles.findIndex(r => r.id === 'PVBB' && r.entity === 'USER');
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }
    const createIndex = self.roles.findIndex(r => r.id === 'PMBBC' && r.entity === 'USER');
    if (createIndex > -1) {
      self.roles.splice(createIndex, 1);
    }
    const editIndex = self.roles.findIndex(r => r.id === 'PMBBU' && r.entity === 'USER');
    if (editIndex > -1) {
      self.roles.splice(editIndex, 1);
    }
    const deleteIndex = self.roles.findIndex(r => r.id === 'PMBBD' && r.entity === 'USER');
    if (deleteIndex > -1) {
      self.roles.splice(deleteIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        self.roles.push(self.getPermissionObject(item, 'USER'));
      });
    } else {
      if (val === 'PNBB') {
        self.sessionPermission = 'PNBA';
        self.groupPermission = 'PNBG';
      }
      self.roles.push(self.getPermissionObject(val, 'USER'));
    }
  }

  get sessionPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMBA');
    if (manageIndex > -1) {
      return 'manage';
    }
    return 'blocked';
  }

  set sessionPermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNBA' && r.entity === 'USER');
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const manageIndex = self.roles.findIndex(r => r.id === 'PMBA' && r.entity === 'USER');
    if (manageIndex > -1) {
      self.roles.splice(manageIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        self.roles.push(self.getPermissionObject(item, 'USER'));
      });
    } else {
      if (val === 'PMBA' && self.basicPermission === 'blocked') {
        self.basicPermission = 'PVBB';
      }
      self.roles.push(self.getPermissionObject(val, 'USER'));
    }
  }

  get groupPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMBG');
    if (manageIndex > -1) {
      return 'manage';
    }
    return 'blocked';
  }

  set groupPermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNBG' && r.entity === 'USER');
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const manageIndex = self.roles.findIndex(r => r.id === 'PMBG' && r.entity === 'USER');
    if (manageIndex > -1) {
      self.roles.splice(manageIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        self.roles.push(self.getPermissionObject(item, 'USER'));
      });
    } else {
      if (val === 'PMBG' && self.basicPermission === 'blocked') {
        self.basicPermission = 'PVBB';
      }
      self.roles.push(self.getPermissionObject(val, 'USER'));
    }
  }

  get createPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMBBC' && r.entity === 'USER');
    if (manageIndex > -1) {
      return true;
    }
    return false;
  }

  get editPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMBBU' && r.entity === 'USER');
    if (manageIndex > -1) {
      return true;
    }
    return false;
  }

  get deletePermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMBBD' && r.entity === 'USER');
    if (manageIndex > -1) {
      return true;
    }
    return false;
  }
}
