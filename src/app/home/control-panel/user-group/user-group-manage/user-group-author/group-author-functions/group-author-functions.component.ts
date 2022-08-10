import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-group-author-functions',
  templateUrl: './group-author-functions.component.html',
  styleUrls: ['./group-author-functions.component.scss']
})
export class GroupAuthorFunctionsComponent implements OnInit {

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
    this.managePermissions = ['PMF', 'PMFPD', 'PMFPS'];
    this.viewPermissions = ['PVF'];
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
      entity: 'FAAS',
      type: 'author'
    };
  }

  hasPermission(type: string) {
    return this.commonService.hasPermission(type);
  }

  changeAllPermissions(val: string) {
    if (val == 'manage') {
      _.remove(this.roles, (item) => item.entity == 'FAAS')
      this.managePermissions.forEach(item => {
        this.roles.push(this.getPermissionObject(item));
      });
    } else if (val == 'view') {
      _.remove(this.roles, (item) => item.entity == 'FAAS')
      this.viewPermissions.forEach(item => {
        this.roles.push(this.getPermissionObject(item));
      });
    } else if (val == 'blocked') {
      _.remove(this.roles, (item) => item.entity == 'FAAS')
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
    if (this.roles.find(r => r.id === 'PMF' && r.entity === 'FAAS')) {
      return 'manage';
    } else if (this.roles.find(r => r.id === 'PVF' && r.entity === 'FAAS')) {
      return 'view';
    } else {
      return 'blocked';
    }
  }

  get powerPermissionDeploy() {
    const manageIndex = this.roles.findIndex(r => (
      r.id === 'PMFPD') && r.entity === 'FAAS');
    if (manageIndex > -1) {
      return 'manage';
    }
    return 'blocked';
  }

  get powerPermissionsStartStop() {
    const manageIndex = this.roles.findIndex(r => (
      r.id === 'PMFPS') && r.entity === 'FAAS');
    if (manageIndex > -1) {
      return 'manage';
    }
    return 'blocked';
  }

  set commonPermission(val: any) {
    const blockedIndex = this.roles.findIndex(r => r.id === 'PNF' + val.type && r.entity === 'FAAS');
    if (blockedIndex > -1) {
      this.roles.splice(blockedIndex, 1);
    }
    const manageIndex = this.roles.findIndex(r => r.id === 'PMF' + val.type && r.entity === 'FAAS');
    if (manageIndex > -1) {
      this.roles.splice(manageIndex, 1);
    }
    const viewIndex = this.roles.findIndex(r => r.id === 'PVF' + val.type && r.entity === 'FAAS');
    if (viewIndex > -1) {
      this.roles.splice(viewIndex, 1);
    }
    this.roles.push(this.getPermissionObject(val.id));
  }
}
