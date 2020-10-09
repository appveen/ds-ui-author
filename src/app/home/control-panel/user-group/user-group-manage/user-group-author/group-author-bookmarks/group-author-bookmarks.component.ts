import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-group-author-bookmarks',
  templateUrl: './group-author-bookmarks.component.html',
  styleUrls: ['./group-author-bookmarks.component.scss']
})
export class GroupAuthorBookmarksComponent implements OnInit {

  @Input() roles: Array<any>;
  @Output() rolesChange: EventEmitter<Array<any>>;
  toggleDropdown: any;
  subscriptions: any = {};
  showLazyLoader: boolean;

  constructor(private commonService: CommonService) {
    const self = this;
    self.roles = [];
    self.toggleDropdown = {};
    self.rolesChange = new EventEmitter();
  }

  ngOnInit() {
    const self = this;
    if (!self.roles) {
      self.roles = [];
    }
  }
  getSelectedPermission(service: any) {
    const self = this;
    if (self.roles.find(r => r.id === 'PMBM' && r.entity === ('BM' + service._id))) {
      return 'Manage';
    } else if (self.roles.find(r => r.id === 'PVBM' && r.entity === ('BM' + service._id))) {
      return 'View';
    } else {
      return 'Hide';
    }
  }
  hasPermission(type: string) {
    const self = this;
    return self.commonService.hasPermission(type);
  }



  togglePermission(type: string, service?: any) {
    const self = this;
    const pvlIndex = self.roles.findIndex(r => r.id === 'PVBM' && r.entity === 'BM' + (service ? ('_' + service._id) : ''));
    const pmlIndex = self.roles.findIndex(r => r.id === 'PMBM' && r.entity === 'BM' + (service ? ('_' + service._id) : ''));
    const pnlIndex = self.roles.findIndex(r => r.id === 'PNBM' && r.entity === 'BM' + (service ? ('_' + service._id) : ''));
    if (type === 'PMBM') {
      if (pvlIndex > pnlIndex) {
        self.removeRoleAtIndex(pvlIndex);
        self.removeRoleAtIndex(pnlIndex);
      } else {
        self.removeRoleAtIndex(pnlIndex);
        self.removeRoleAtIndex(pvlIndex);
      }
      self.roles.push(self.getPermissionObject('PMBM', service));
    } else if (type === 'PVBM') {
      if (pnlIndex > pmlIndex) {
        self.removeRoleAtIndex(pnlIndex);
        self.removeRoleAtIndex(pmlIndex);
      } else {
        self.removeRoleAtIndex(pmlIndex);
        self.removeRoleAtIndex(pnlIndex);
      }
      self.roles.push(self.getPermissionObject('PVBM', service));
    } else {
      if (pvlIndex > pmlIndex) {
        self.removeRoleAtIndex(pvlIndex);
        self.removeRoleAtIndex(pmlIndex);
      } else {
        self.removeRoleAtIndex(pmlIndex);
        self.removeRoleAtIndex(pvlIndex);
      }
      self.roles.push(self.getPermissionObject('PNBM', service));
    }
  }
  removeRoleAtIndex(index: number) {
    const self = this;
    if (index > -1) {
      self.roles.splice(index, 1);
    }
  }
  getPermissionObject(type: string, service: any) {
    const self = this;
    return {
      id: type,
      app: self.commonService.app._id,
      entity: 'BM' + (service ? '_' + service._id : ''),
      type: 'author'
    };
  }
  get globalPermissionType() {
    const self = this;
    if (self.roles.find(r => r.id === 'PMBM' && r.entity === 'BM')) {
      return 'Manage';
    } else if (self.roles.find(r => r.id === 'PVBM' && r.entity === 'BM')) {
      return 'View';
    } else {
      return 'Hide';
    }
  }

}
