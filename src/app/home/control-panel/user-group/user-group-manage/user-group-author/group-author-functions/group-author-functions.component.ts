import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-group-author-functions',
  templateUrl: './group-author-functions.component.html',
  styleUrls: ['./group-author-functions.component.scss']
})
export class GroupAuthorFunctionsComponent implements OnInit, OnDestroy {

  @Input() roles: Array<any>;
  @Output() rolesChange: EventEmitter<Array<any>>;

  constructor(private commonService: CommonService,
    private appService: AppService) {
    this.roles = [];
    this.rolesChange = new EventEmitter();
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
  ngOnDestroy() {
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
