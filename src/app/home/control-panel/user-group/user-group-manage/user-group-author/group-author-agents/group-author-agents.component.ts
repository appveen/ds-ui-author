import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-group-author-agents',
  templateUrl: './group-author-agents.component.html',
  styleUrls: ['./group-author-agents.component.scss']
})
export class GroupAuthorAgentsComponent implements OnInit {

  @Input() edit: any;
  @Input() roles: Array<any>;
  @Output() rolesChange: EventEmitter<Array<any>>;
  showLazyLoader: boolean;
  viewAgentPwdList: Array<any>;
  powerSettingList: Array<any>;
  managePermissions: Array<string>;
  viewPermissions: Array<string>;
  constructor(private commonService: CommonService) {
    this.edit = {
      status: true
    };
    this.roles = [];
    this.rolesChange = new EventEmitter();
    this.managePermissions = ['PMABC', 'PMABU', 'PMABD', 'PMAPW', 'PMAEN', 'PMAS', 'PMABD', 'PMADL'];
    this.viewPermissions = ['PVAB', 'PVAPW'];
    this.viewAgentPwdList = [
      {
        label: 'View Password',
        segment: 'APW',
        entity: 'AGENT'
      }
    ];
    this.powerSettingList = [
      {
        label: 'Enable / Disable',
        segment: 'AEN',
        entity: 'AGENT',
        description: 'Permission to Enable/Disable Agents'
      },
      {
        label: 'Stop',
        segment: 'AS',
        entity: 'AGENT',
        description: 'Permission to Stop Agents'
      },
      {
        label: 'Delete',
        segment: 'ABD',
        entity: 'AGENT',
        description: 'Permission to Delete Agents'
      },
      {
        label: 'Download',
        segment: 'ADL',
        entity: 'AGENT',
        description: 'Permission to Download Agents'
      },
      {
        label: 'Change Password',
        segment: 'APW',
        entity: 'AGENT',
        description: 'Permission to Change Password of Agents'
      }
    ];
  }

  ngOnInit() {
    if (!this.roles) {
      this.roles = [];
    }
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
    if (!this.hasPermission('PMGAA')) {
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
      this.basicPermission = 'PVAB';
    }
    this.roles.push(this.getPermissionObject('P' + level + segment, entity));
  }

  togglePermissionLevel(segment: string) {
    if (!this.hasPermission('PMGAA')) {
      return;
    }
    const blockedIndex = this.roles.findIndex(r => r.id === 'PMG' + segment && r.entity === 'AGENT');
    if (blockedIndex > -1) {
      this.roles.splice(blockedIndex, 1);
    } else {
      this.roles.push(this.getPermissionObject('PMG' + segment, 'AGENT'));
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
      _.remove(this.roles, (item) => item.entity == 'AGENT');
      this.managePermissions.forEach(item => {
        this.roles.push(this.getPermissionObject(item, 'AGENT'));
      });
    } else if (val == 'view') {
      _.remove(this.roles, (item) => item.entity == 'AGENT');
      this.viewPermissions.forEach(item => {
        this.roles.push(this.getPermissionObject(item, 'AGENT'));
      });
    } else if (val == 'blocked') {
      _.remove(this.roles, (item) => item.entity == 'AGENT');
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
    const blockedIndex = this.roles.findIndex(r => r.id === 'PNAB' && r.entity === 'AGENT');
    if (blockedIndex > -1) {
      this.roles.splice(blockedIndex, 1);
    }
    const viewIndex = this.roles.findIndex(r => r.id === 'PVAB' && r.entity === 'AGENT');
    if (viewIndex > -1) {
      this.roles.splice(viewIndex, 1);
    }
    const createIndex = this.roles.findIndex(r => r.id === 'PMABC' && r.entity === 'AGENT');
    if (createIndex > -1) {
      this.roles.splice(createIndex, 1);
    }
    const editIndex = this.roles.findIndex(r => r.id === 'PMABU' && r.entity === 'AGENT');
    if (editIndex > -1) {
      this.roles.splice(editIndex, 1);
    }
    const deleteIndex = this.roles.findIndex(r => r.id === 'PMABD' && r.entity === 'AGENT');
    if (deleteIndex > -1) {
      this.roles.splice(deleteIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        this.roles.push(this.getPermissionObject(item, 'AGENT'));
      });
    } else {
      this.roles.push(this.getPermissionObject(val, 'AGENT'));
      if (val === 'PNAB') {
        this.viewAgentPwdList.forEach(item => {
          this.changeModulePermissionLevel('N', item.segment, item.entity);
        });
        this.powerSettingList.forEach(item => {
          this.changeModulePermissionLevel('N', item.segment, item.entity);
        });
      }
    }
  }

  get basicPermission() {
    const viewIndex = this.roles.findIndex(r => r.id === 'PVAB' && r.entity === 'AGENT');
    const manageIndex = this.roles.findIndex(r => (r.id === 'PMABC' || r.id === 'PMABU' || r.id === 'PMABD') && r.entity === 'AGENT');
    if (manageIndex > -1) {
      return 'manage';
    }
    if (viewIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }
}
