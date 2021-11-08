import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-group-author-functions',
  templateUrl: './group-author-functions.component.html',
  styleUrls: ['./group-author-functions.component.scss']
})
export class GroupAuthorFunctionsComponent implements OnInit, OnDestroy {

  @Input() roles: Array<any>;
  @Output() rolesChange: EventEmitter<Array<any>>;
  toggleDropdown: any;
  subscriptions: any;
  searchTerm: string;
  functionsList: Array<{ _id: string; name: string; hide?: boolean; selected?: boolean }>;

  constructor(private commonService: CommonService,
    private appService: AppService) {
    const self = this;
    self.toggleDropdown = {};
    self.subscriptions = {};
    self.roles = [];
    self.rolesChange = new EventEmitter();
  }

  static faasAttrCount(libDefinition): number {
    // Parse lib definition and return attribute count
    return libDefinition?.definition?.length || 0;
  }

  ngOnInit() {
    const self = this;
    if (!self.roles) {
      self.roles = [];
    }
    const temp = self.roles.filter(r => r.entity.indexOf('FAAS_') > -1)
      .map(item => item.entity.split('_')[1])
      .filter((e, i, a) => a.indexOf(e) === i);
    self.getFunctionsList();
  }

  getFunctionsList() {
    const self = this;
    const options: GetOptions = {
      select: 'name, definition',
      count: -1,
      filter: {
        app: self.commonService.app._id,
      }
    };
    self.commonService.get('partnerManager', '/faas', options).subscribe(res => {
      self.functionsList = res;
      self.functionsList.forEach(_lib => {
        _lib['attribute'] = GroupAuthorFunctionsComponent.faasAttrCount(_lib['definition']);
      });
    });
  }

  togglePermission(type: string, service?: any) {
    const self = this;
    const pvlIndex = self.roles.findIndex(r => r.id === 'PVF' && r.entity === 'FAAS' + (service ? ('_' + service._id) : ''));
    const pmlIndex = self.roles.findIndex(r => r.id === 'PMF' && r.entity === 'FAAS' + (service ? ('_' + service._id) : ''));
    const pnlIndex = self.roles.findIndex(r => r.id === 'PNF' && r.entity === 'FAAS' + (service ? ('_' + service._id) : ''));
    if (type === 'PMF') {
      if (pvlIndex > pnlIndex) {
        self.removeRoleAtIndex(pvlIndex);
        self.removeRoleAtIndex(pnlIndex);
      } else {
        self.removeRoleAtIndex(pnlIndex);
        self.removeRoleAtIndex(pvlIndex);
      }
      self.roles.push(self.getPermissionObject('PMF'));
    } else if (type === 'PVF') {
      if (pnlIndex > pmlIndex) {
        self.removeRoleAtIndex(pnlIndex);
        self.removeRoleAtIndex(pmlIndex);
      } else {
        self.removeRoleAtIndex(pmlIndex);
        self.removeRoleAtIndex(pnlIndex);
      }
      self.roles.push(self.getPermissionObject('PVF'));
    } else {
      if (pvlIndex > pmlIndex) {
        self.removeRoleAtIndex(pvlIndex);
        self.removeRoleAtIndex(pmlIndex);
      } else {
        self.removeRoleAtIndex(pmlIndex);
        self.removeRoleAtIndex(pvlIndex);
      }
      self.roles.push(self.getPermissionObject('PNF'));
    }
  }

  removeRoleAtIndex(index: number) {
    const self = this;
    if (index > -1) {
      self.roles.splice(index, 1);
    }
  }

  getSelectedPermission(service: any) {
    const self = this;
    if (self.roles.find(r => r.id === 'PMF' && r.entity === ('FAAS_' + service._id))) {
      return 'Manage';
    } else if (self.roles.find(r => r.id === 'PVF' && r.entity === ('FAAS_' + service._id))) {
      return 'View';
    } else {
      return 'Hide';
    }
  }

  getPermissionObject(type: string, service?: any) {
    const self = this;
    return {
      id: type,
      app: self.commonService.app._id,
      entity: 'FAAS' + (service ? '_' + service._id : ''),
      type: 'author'
    };
  }

  hasPermission(type: string) {
    const self = this;
    return self.commonService.hasPermission(type);
  }
  ngOnDestroy() {
    const self = this;
  }

  get faasPermissionType() {
    const self = this;
    if (self.roles.find(r => r.id === 'PMF' && r.entity === 'FAAS')) {
      return 'Manage';
    } else if (self.roles.find(r => r.id === 'PVF' && r.entity === 'FAAS')) {
      return 'View';
    } else {
      return 'Hide';
    }
  }

  get showException() {
    const self = this;
    if (self.functionsList && self.functionsList.length > 0) {
      return true;
    }
    return false;
  }

  get powerPermissionDeploy() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => (
      r.id === 'PMFPD') && r.entity === 'FAAS');
    if (manageIndex > -1) {
      return 'manage';
    }
    return 'blocked';
  }

  get powerPermissionsStartStop() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => (
      r.id === 'PMFPS') && r.entity === 'FAAS');
    if (manageIndex > -1) {
      return 'manage';
    }
    return 'blocked';
  }

  get checkAll() {
    const self = this;
    const temp = self.functionsList.filter(e => !e.hide);
    if (temp.length === 0) {
      return false;
    }
    return Math.min.apply(null, temp.map(e => e.selected));
  }

  set checkAll(val: any) {
    const self = this;
    self.functionsList.forEach(e => {
      e.selected = val;
    });
  }


  // Common setPermission for Power settings,Definition,Experience and Role
  set commonPermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNF' + val.type && r.entity === 'FAAS');
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const manageIndex = self.roles.findIndex(r => r.id === 'PMF' + val.type && r.entity === 'FAAS');
    if (manageIndex > -1) {
      self.roles.splice(manageIndex, 1);
    }
    const viewIndex = self.roles.findIndex(r => r.id === 'PVF' + val.type && r.entity === 'FAAS');
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }
    self.roles.push(self.getPermissionObject(val.id));
  }
}
