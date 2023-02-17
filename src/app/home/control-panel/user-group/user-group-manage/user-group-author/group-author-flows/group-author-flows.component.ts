import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-group-author-flows',
  templateUrl: './group-author-flows.component.html',
  styleUrls: ['./group-author-flows.component.scss']
})
export class GroupAuthorFlowsComponent implements OnInit {

  @Input() roles: Array<any>;
  @Output() rolesChange: EventEmitter<Array<any>>;
  edit: any;
  managePermissions: Array<string>;
  viewPermissions: Array<string>;

  constructor(private commonService: CommonService,
    private appService: AppService) {
    this.roles = [];
    this.rolesChange = new EventEmitter();
    this.edit = { status: true };
    this.managePermissions = ['PMIF', 'PMIFPD', 'PMIFPS'];
    this.viewPermissions = ['PVIF'];
  }

  ngOnInit() {
    if (!this.roles) {
      this.roles = [];
    }
  }


  getPermissionObject(type: string) {
    return {
      id: type,
      app: this.commonService.app._id,
      entity: 'FLOW',
      type: 'author'
    };
  }

  hasPermission(type: string) {
    return this.commonService.hasPermission(type);
  }

  changeAllPermissions(val: string) {
    if (val == 'manage') {
      _.remove(this.roles, (item) => item.entity == 'FLOW')
      this.managePermissions.forEach(item => {
        this.roles.push(this.getPermissionObject(item));
      });
    } else if (val == 'view') {
      _.remove(this.roles, (item) => item.entity == 'FLOW')
      this.viewPermissions.forEach(item => {
        this.roles.push(this.getPermissionObject(item));
      });
    } else if (val == 'blocked') {
      _.remove(this.roles, (item) => item.entity == 'FLOW')
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

  get permissionType() {
    if (this.roles.find(r => r.id === 'PMIF' && r.entity === 'FLOW')) {
      return 'manage';
    } else if (this.roles.find(r => r.id === 'PVIF' && r.entity === 'FLOW')) {
      return 'view';
    } else {
      return 'blocked';
    }
  }

  get powerPermissionDeploy() {
    const manageIndex = this.roles.findIndex(r => (
      r.id === 'PMIFPD') && r.entity === 'FLOW');
    if (manageIndex > -1) {
      return 'manage';
    }
    return 'blocked';
  }

  get powerPermissionsStartStop() {
    const manageIndex = this.roles.findIndex(r => (
      r.id === 'PMIFPS') && r.entity === 'FLOW');
    if (manageIndex > -1) {
      return 'manage';
    }
    return 'blocked';
  }

  set commonPermission(val: any) {
    const blockedIndex = this.roles.findIndex(r => r.id === 'PNIF' + val.type && r.entity === 'FLOW');
    if (blockedIndex > -1) {
      this.roles.splice(blockedIndex, 1);
    }
    const manageIndex = this.roles.findIndex(r => r.id === 'PMIF' + val.type && r.entity === 'FLOW');
    if (manageIndex > -1) {
      this.roles.splice(manageIndex, 1);
    }
    const viewIndex = this.roles.findIndex(r => r.id === 'PVIF' + val.type && r.entity === 'FLOW');
    if (viewIndex > -1) {
      this.roles.splice(viewIndex, 1);
    }
    this.roles.push(this.getPermissionObject(val.id));
  }
}
