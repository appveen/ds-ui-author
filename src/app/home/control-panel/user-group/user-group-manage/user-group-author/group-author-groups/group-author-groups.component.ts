import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-group-author-groups',
  templateUrl: './group-author-groups.component.html',
  styleUrls: ['./group-author-groups.component.scss']
})
export class GroupAuthorGroupsComponent implements OnInit {

  @Input() roles: Array<any>;
  @Output() rolesChange: EventEmitter<Array<any>>;
  dropdownToggle: {
    [key: string]: boolean
  };
  authorModulesList: Array<RoleModule>;
  appcenterModulesList: Array<RoleModule>;
  constructor(private commonService: CommonService) {
    const self = this;
    self.rolesChange = new EventEmitter();
    self.roles = [];
    self.dropdownToggle = {};
    self.authorModulesList = [
      {
        label: 'Data Service',
        segment: 'GADS',
        entity: 'GROUP'
      },
      {
        label: 'Library',
        segment: 'GAL',
        entity: 'GROUP'
      },
      {
        label: 'Partners',
        segment: 'GAP',
        entity: 'GROUP'
      },
      {
        label: 'Data Formats',
        segment: 'GADF',
        entity: 'GROUP'
      },
      {
        label: 'Nano Service',
        segment: 'GANS',
        entity: 'GROUP'
      },
      {
        label: 'Agents',
        segment: 'GAA',
        entity: 'GROUP'
      },
      {
        label: 'Bookmarks',
        segment: 'GABM',
        entity: 'GROUP'
      },
      {
        label: 'Users',
        segment: 'GAU',
        entity: 'GROUP'
      },
      {
        label: 'Bots',
        segment: 'GAB',
        entity: 'GROUP'
      },
      {
        label: 'Groups',
        segment: 'GAG',
        entity: 'GROUP'
      },
      {
        label: 'Insignts',
        segment: 'GAIS',
        entity: 'GROUP'
      }
    ];
    self.appcenterModulesList = [
      {
        label: 'Data Service',
        segment: 'GCDS',
        entity: 'GROUP'
      },
      {
        label: 'Interactions',
        segment: 'GCI',
        entity: 'GROUP'
      },
      {
        label: 'Bookmarks',
        segment: 'GCBM',
        entity: 'GROUP'
      },
    ];
  }

  ngOnInit() {
    const self = this;
  }

  getModulePermissionLevel(segment: string, entity: string) {
    const self = this;
    const viewIndex = self.roles.findIndex(r => r.id === 'PV' + segment && r.entity === entity);
    const manageIndex = self.roles.findIndex(r => r.id === 'PM' + segment && r.entity === entity);
    if (manageIndex > -1) {
      return 'manage';
    }
    if (viewIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }

  changeModulePermissionLevel(level: string, segment: string, entity: string) {
    const self = this;
    if (!self.hasPermission('PMGAG')) {
      return;
    }
    const blockedIndex = self.roles.findIndex(r => r.id === 'PN' + segment && r.entity === entity);
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const viewIndex = self.roles.findIndex(r => r.id === 'PV' + segment && r.entity === entity);
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }
    const manageIndex = self.roles.findIndex(r => r.id === 'PM' + segment && r.entity === entity);
    if (manageIndex > -1) {
      self.roles.splice(manageIndex, 1);
    }
    if ((level === 'V' || level === 'M') && self.basicPermission === 'blocked') {
      self.basicPermission = 'PVGB';
    }
    self.roles.push(self.getPermissionObject('P' + level + segment, entity));
  }

  togglePermissionLevel(segment: string) {
    const self = this;
    if (!self.hasPermission('PMGAG')) {
      return;
    }
    const blockedIndex = self.roles.findIndex(r => r.id === 'PMG' + segment && r.entity === 'GROUP');
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    } else {
      self.roles.push(self.getPermissionObject('PMG' + segment, 'GROUP'));
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

  set basicPermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNGB' && r.entity === 'GROUP');
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const viewIndex = self.roles.findIndex(r => r.id === 'PVGB' && r.entity === 'GROUP');
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }
    const createIndex = self.roles.findIndex(r => r.id === 'PMGBC' && r.entity === 'GROUP');
    if (createIndex > -1) {
      self.roles.splice(createIndex, 1);
    }
    const editIndex = self.roles.findIndex(r => r.id === 'PMGBU' && r.entity === 'GROUP');
    if (editIndex > -1) {
      self.roles.splice(editIndex, 1);
    }
    const deleteIndex = self.roles.findIndex(r => r.id === 'PMGBD' && r.entity === 'GROUP');
    if (deleteIndex > -1) {
      self.roles.splice(deleteIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        self.roles.push(self.getPermissionObject(item, 'GROUP'));
      });
    } else {
      self.roles.push(self.getPermissionObject(val, 'GROUP'));
      if (val === 'PNGB') {
        self.membersPermission = 'PNGMU';
        self.botsPermission = 'PNGMB';
        self.authorModulesList.forEach(item => {
          self.changeModulePermissionLevel('N', item.segment, item.entity);
        });
        self.appcenterModulesList.forEach(item => {
          self.changeModulePermissionLevel('N', item.segment, item.entity);
        });
      }
    }
  }

  get basicPermission() {
    const self = this;
    const viewIndex = self.roles.findIndex(r => r.id === 'PVGB' && r.entity === 'GROUP');
    const manageIndex = self.roles.findIndex(r => (r.id === 'PMGBC' || r.id === 'PMGBU' || r.id === 'PMGBD') && r.entity === 'GROUP');
    if (manageIndex > -1) {
      return 'manage';
    }
    if (viewIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }

  set membersPermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNGMU' && r.entity === 'GROUP');
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const viewIndex = self.roles.findIndex(r => r.id === 'PVGMU' && r.entity === 'GROUP');
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }
    const createIndex = self.roles.findIndex(r => r.id === 'PMGMUC' && r.entity === 'GROUP');
    if (createIndex > -1) {
      self.roles.splice(createIndex, 1);
    }
    const deleteIndex = self.roles.findIndex(r => r.id === 'PMGMUD' && r.entity === 'GROUP');
    if (deleteIndex > -1) {
      self.roles.splice(deleteIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        if ((item.substr(0, 2) === 'PM' || item.substr(0, 2) === 'PV') && self.basicPermission === 'blocked') {
          self.basicPermission = 'PVGB';
        }
        self.roles.push(self.getPermissionObject(item, 'GROUP'));
      });
    } else {
      if ((val.substr(0, 2) === 'PM' || val.substr(0, 2) === 'PV') && self.basicPermission === 'blocked') {
        self.basicPermission = 'PVGB';
      }
      self.roles.push(self.getPermissionObject(val, 'GROUP'));
    }
  }

  get membersPermission() {
    const self = this;
    const viewIndex = self.roles.findIndex(r => r.id === 'PVGMU' && r.entity === 'GROUP');
    const manageIndex = self.roles.findIndex(r => (r.id === 'PMGMUC' || r.id === 'PMGMUD') && r.entity === 'GROUP');
    if (manageIndex > -1) {
      return 'manage';
    }
    if (viewIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }

  get membersCreatePermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMGMUC' && r.entity === 'GROUP');
    if (manageIndex > -1) {
      return true;
    }
    return false;
  }

  get membersDeletePermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMGMUD' && r.entity === 'GROUP');
    if (manageIndex > -1) {
      return true;
    }
    return false;
  }

  set botsPermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNGMB' && r.entity === 'GROUP');
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const viewIndex = self.roles.findIndex(r => r.id === 'PVGMB' && r.entity === 'GROUP');
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }
    const createIndex = self.roles.findIndex(r => r.id === 'PMGMBC' && r.entity === 'GROUP');
    if (createIndex > -1) {
      self.roles.splice(createIndex, 1);
    }
    const deleteIndex = self.roles.findIndex(r => r.id === 'PMGMBD' && r.entity === 'GROUP');
    if (deleteIndex > -1) {
      self.roles.splice(deleteIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        if ((item.substr(0, 2) === 'PM' || item.substr(0, 2) === 'PV') && self.basicPermission === 'blocked') {
          self.basicPermission = 'PVGB';
        }
        self.roles.push(self.getPermissionObject(item, 'GROUP'));
      });
    } else {
      if ((val.substr(0, 2) === 'PM' || val.substr(0, 2) === 'PV') && self.basicPermission === 'blocked') {
        self.basicPermission = 'PVGB';
      }
      self.roles.push(self.getPermissionObject(val, 'GROUP'));
    }
  }

  get botsPermission() {
    const self = this;
    const viewIndex = self.roles.findIndex(r => r.id === 'PVGMB' && r.entity === 'GROUP');
    const manageIndex = self.roles.findIndex(r => (r.id === 'PMGMBC' || r.id === 'PMGMBD') && r.entity === 'GROUP');
    if (manageIndex > -1) {
      return 'manage';
    }
    if (viewIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }

  get botsCreatePermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMGMBC' && r.entity === 'GROUP');
    if (manageIndex > -1) {
      return true;
    }
    return false;
  }

  get botsDeletePermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMGMBD' && r.entity === 'GROUP');
    if (manageIndex > -1) {
      return true;
    }
    return false;
  }

  get createPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMGBC' && r.entity === 'GROUP');
    if (manageIndex > -1) {
      return true;
    }
    return false;
  }

  get editPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMGBU' && r.entity === 'GROUP');
    if (manageIndex > -1) {
      return true;
    }
    return false;
  }

  get deletePermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMGBD' && r.entity === 'GROUP');
    if (manageIndex > -1) {
      return true;
    }
    return false;
  }

  get authType() {
    const self = this;
    if (self.commonService.userDetails.auth && self.commonService.userDetails.auth.authType) {
      return self.commonService.userDetails.auth.authType;
    }
    return 'local';
  }
}

export interface RoleModule {
  label?: string;
  segment?: string;
  entity?: string;
}
