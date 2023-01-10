import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

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
  edit: any;
  managePermissions: Array<string>;
  viewPermissions: Array<string>;
  constructor(private commonService: CommonService) {
    this.rolesChange = new EventEmitter();
    this.roles = [];
    this.dropdownToggle = {};
    this.managePermissions = ['PMGBC', 'PMGBU', 'PMGBD', 'PMGBD', 'PMGMBC', 'PMGMBD', 'PMGMUC', 'PMGMUD', 'PMGADS', 'PMGAL', 'PMGACON', 'PMGADF', 'PMGAF', 'PMGAA', 'PMGABM', 'PMGAU', 'PMGAB', 'PMGAG', 'PMGAIS', 'PMGCDS', 'PMGCI', 'PMGCBM'];
    this.viewPermissions = ['PVGB', 'PVGMB', 'PVGMU', 'PVGADS', 'PVGAL', 'PVGACON', 'PVGADF', 'PVGAF', 'PVGAA', 'PVGABM', 'PVGAU', 'PVGAB', 'PVGAG', 'PVGAIS', 'PVGCDS', 'PVGCI', 'PVGCBM'];
    this.authorModulesList = [
      {
        label: 'Connectors',
        segment: 'GACON',
        entity: 'GROUP'
      },
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
        label: 'Data Formats',
        segment: 'GADF',
        entity: 'GROUP'
      },
      {
        label: 'Functions',
        segment: 'GAF',
        entity: 'GROUP'
      },
      {
        label: 'Agents',
        segment: 'GAA',
        entity: 'GROUP'
      },
      // {
      //   label: 'Bookmarks',
      //   segment: 'GABM',
      //   entity: 'GROUP'
      // },
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
    this.appcenterModulesList = [
      {
        label: 'Data Service',
        segment: 'GCDS',
        entity: 'GROUP'
      },
      // {
      //   label: 'Interactions',
      //   segment: 'GCI',
      //   entity: 'GROUP'
      // },
      // {
      //   label: 'Bookmarks',
      //   segment: 'GCBM',
      //   entity: 'GROUP'
      // },
    ];
    this.edit = { status: true };
  }

  ngOnInit() {
  }

  getModulePermissionLevel(segment: string, entity: string) {
    const viewIndex = this.roles.findIndex(r => r.id === 'PV' + segment && r.entity === entity);
    const manageIndex = this.roles.findIndex(r => r.id === 'PM' + segment && r.entity === entity);
    if (manageIndex > -1) {
      return 'manage';
    }
    if (viewIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }

  changeModulePermissionLevel(level: string, segment: string, entity: string) {
    if (!this.hasPermission('PMGAG')) {
      return;
    }
    const blockedIndex = this.roles.findIndex(r => r.id === 'PN' + segment && r.entity === entity);
    if (blockedIndex > -1) {
      this.roles.splice(blockedIndex, 1);
    }
    const viewIndex = this.roles.findIndex(r => r.id === 'PV' + segment && r.entity === entity);
    if (viewIndex > -1) {
      this.roles.splice(viewIndex, 1);
    }
    const manageIndex = this.roles.findIndex(r => r.id === 'PM' + segment && r.entity === entity);
    if (manageIndex > -1) {
      this.roles.splice(manageIndex, 1);
    }
    if ((level === 'V' || level === 'M') && this.basicPermission === 'blocked') {
      this.basicPermission = 'PVGB';
    }
    this.roles.push(this.getPermissionObject('P' + level + segment, entity));
  }

  togglePermissionLevel(segment: string) {
    if (!this.hasPermission('PMGAG')) {
      return;
    }
    const blockedIndex = this.roles.findIndex(r => r.id === 'PMG' + segment && r.entity === 'GROUP');
    if (blockedIndex > -1) {
      this.roles.splice(blockedIndex, 1);
    } else {
      this.roles.push(this.getPermissionObject('PMG' + segment, 'GROUP'));
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
      _.remove(this.roles, (item) => item.entity == 'GROUP');
      this.managePermissions.forEach(item => {
        this.roles.push(this.getPermissionObject(item, 'GROUP'));
      });
    } else if (val == 'view') {
      _.remove(this.roles, (item) => item.entity == 'GROUP');
      this.viewPermissions.forEach(item => {
        this.roles.push(this.getPermissionObject(item, 'GROUP'));
      });
    } else if (val == 'blocked') {
      _.remove(this.roles, (item) => item.entity == 'GROUP');
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

  set basicPermission(val: any) {
    const blockedIndex = this.roles.findIndex(r => r.id === 'PNGB' && r.entity === 'GROUP');
    if (blockedIndex > -1) {
      this.roles.splice(blockedIndex, 1);
    }
    const viewIndex = this.roles.findIndex(r => r.id === 'PVGB' && r.entity === 'GROUP');
    if (viewIndex > -1) {
      this.roles.splice(viewIndex, 1);
    }
    const createIndex = this.roles.findIndex(r => r.id === 'PMGBC' && r.entity === 'GROUP');
    if (createIndex > -1) {
      this.roles.splice(createIndex, 1);
    }
    const editIndex = this.roles.findIndex(r => r.id === 'PMGBU' && r.entity === 'GROUP');
    if (editIndex > -1) {
      this.roles.splice(editIndex, 1);
    }
    const deleteIndex = this.roles.findIndex(r => r.id === 'PMGBD' && r.entity === 'GROUP');
    if (deleteIndex > -1) {
      this.roles.splice(deleteIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        this.roles.push(this.getPermissionObject(item, 'GROUP'));
      });
    } else {
      this.roles.push(this.getPermissionObject(val, 'GROUP'));
      if (val === 'PNGB') {
        this.membersPermission = 'PNGMU';
        this.botsPermission = 'PNGMB';
        this.authorModulesList.forEach(item => {
          this.changeModulePermissionLevel('N', item.segment, item.entity);
        });
        this.appcenterModulesList.forEach(item => {
          this.changeModulePermissionLevel('N', item.segment, item.entity);
        });
      }
    }
  }

  get basicPermission() {
    const viewIndex = this.roles.findIndex(r => r.id === 'PVGB' && r.entity === 'GROUP');
    const manageIndex = this.roles.findIndex(r => (r.id === 'PMGBC' || r.id === 'PMGBU' || r.id === 'PMGBD') && r.entity === 'GROUP');
    if (manageIndex > -1) {
      return 'manage';
    }
    if (viewIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }

  set membersPermission(val: any) {
    const blockedIndex = this.roles.findIndex(r => r.id === 'PNGMU' && r.entity === 'GROUP');
    if (blockedIndex > -1) {
      this.roles.splice(blockedIndex, 1);
    }
    const viewIndex = this.roles.findIndex(r => r.id === 'PVGMU' && r.entity === 'GROUP');
    if (viewIndex > -1) {
      this.roles.splice(viewIndex, 1);
    }
    const createIndex = this.roles.findIndex(r => r.id === 'PMGMUC' && r.entity === 'GROUP');
    if (createIndex > -1) {
      this.roles.splice(createIndex, 1);
    }
    const deleteIndex = this.roles.findIndex(r => r.id === 'PMGMUD' && r.entity === 'GROUP');
    if (deleteIndex > -1) {
      this.roles.splice(deleteIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        if ((item.substr(0, 2) === 'PM' || item.substr(0, 2) === 'PV') && this.basicPermission === 'blocked') {
          this.basicPermission = 'PVGB';
        }
        this.roles.push(this.getPermissionObject(item, 'GROUP'));
      });
    } else {
      if ((val.substr(0, 2) === 'PM' || val.substr(0, 2) === 'PV') && this.basicPermission === 'blocked') {
        this.basicPermission = 'PVGB';
      }
      this.roles.push(this.getPermissionObject(val, 'GROUP'));
    }
  }

  get membersPermission() {
    const viewIndex = this.roles.findIndex(r => r.id === 'PVGMU' && r.entity === 'GROUP');
    const manageIndex = this.roles.findIndex(r => (r.id === 'PMGMUC' || r.id === 'PMGMUD') && r.entity === 'GROUP');
    if (manageIndex > -1) {
      return 'manage';
    }
    if (viewIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }

  set botsPermission(val: any) {
    const blockedIndex = this.roles.findIndex(r => r.id === 'PNGMB' && r.entity === 'GROUP');
    if (blockedIndex > -1) {
      this.roles.splice(blockedIndex, 1);
    }
    const viewIndex = this.roles.findIndex(r => r.id === 'PVGMB' && r.entity === 'GROUP');
    if (viewIndex > -1) {
      this.roles.splice(viewIndex, 1);
    }
    const createIndex = this.roles.findIndex(r => r.id === 'PMGMBC' && r.entity === 'GROUP');
    if (createIndex > -1) {
      this.roles.splice(createIndex, 1);
    }
    const deleteIndex = this.roles.findIndex(r => r.id === 'PMGMBD' && r.entity === 'GROUP');
    if (deleteIndex > -1) {
      this.roles.splice(deleteIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        if ((item.substr(0, 2) === 'PM' || item.substr(0, 2) === 'PV') && this.basicPermission === 'blocked') {
          this.basicPermission = 'PVGB';
        }
        this.roles.push(this.getPermissionObject(item, 'GROUP'));
      });
    } else {
      if ((val.substr(0, 2) === 'PM' || val.substr(0, 2) === 'PV') && this.basicPermission === 'blocked') {
        this.basicPermission = 'PVGB';
      }
      this.roles.push(this.getPermissionObject(val, 'GROUP'));
    }
  }

  get botsPermission() {
    const viewIndex = this.roles.findIndex(r => r.id === 'PVGMB' && r.entity === 'GROUP');
    const manageIndex = this.roles.findIndex(r => (r.id === 'PMGMBC' || r.id === 'PMGMBD') && r.entity === 'GROUP');
    if (manageIndex > -1) {
      return 'manage';
    }
    if (viewIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }
}

export interface RoleModule {
  label?: string;
  segment?: string;
  entity?: string;
}
