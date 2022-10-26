import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-group-author-library',
  templateUrl: './group-author-library.component.html',
  styleUrls: ['./group-author-library.component.scss']
})
export class GroupAuthorLibraryComponent implements OnInit, OnDestroy {

  @Input() roles: Array<any>;
  @Output() rolesChange: EventEmitter<Array<any>>;
  toggleDropdown: any;
  subscriptions: any;
  searchTerm: string;
  libraryList: Array<{ _id: string; name: string; hide?: boolean; selected?: boolean }>;

  constructor(private commonService: CommonService,
    private appService: AppService) {
    const self = this;
    self.toggleDropdown = {};
    self.subscriptions = {};
    self.roles = [];
    self.rolesChange = new EventEmitter();
  }

  static libAttrCount(libDefinition): number {
    // Parse lib definition and return attribute count
    return libDefinition?.definition?.length || 0;
  }

  ngOnInit() {
    const self = this;
    if (!self.roles) {
      self.roles = [];
    }
    const temp = self.roles.filter(r => r.entity.indexOf('GS_') > -1)
      .map(item => item.entity.split('_')[1])
      .filter((e, i, a) => a.indexOf(e) === i);
    self.getLibraryList();
  }

  getLibraryList() {
    const self = this;
    const options: GetOptions = {
      select: 'name, definition',
      count: -1,
      filter: {
        app: self.commonService.app._id,
      }
    };
    self.commonService.get('serviceManager', `/${this.commonService.app._id}/globalSchema`, options).subscribe(res => {
      self.libraryList = res;
      self.libraryList.forEach(_lib => {
        _lib['attribute'] = GroupAuthorLibraryComponent.libAttrCount(_lib['definition']);
      });
    });
  }

  togglePermission(type: string, service?: any) {
    const self = this;
    const pvlIndex = self.roles.findIndex(r => r.id === 'PVL' && r.entity === 'GS' + (service ? ('_' + service._id) : ''));
    const pmlIndex = self.roles.findIndex(r => r.id === 'PML' && r.entity === 'GS' + (service ? ('_' + service._id) : ''));
    const pnlIndex = self.roles.findIndex(r => r.id === 'PNL' && r.entity === 'GS' + (service ? ('_' + service._id) : ''));
    if (type === 'PML') {
      if (pvlIndex > pnlIndex) {
        self.removeRoleAtIndex(pvlIndex);
        self.removeRoleAtIndex(pnlIndex);
      } else {
        self.removeRoleAtIndex(pnlIndex);
        self.removeRoleAtIndex(pvlIndex);
      }
      self.roles.push(self.getPermissionObject('PML', service));
    } else if (type === 'PVL') {
      if (pnlIndex > pmlIndex) {
        self.removeRoleAtIndex(pnlIndex);
        self.removeRoleAtIndex(pmlIndex);
      } else {
        self.removeRoleAtIndex(pmlIndex);
        self.removeRoleAtIndex(pnlIndex);
      }
      self.roles.push(self.getPermissionObject('PVL', service));
    } else {
      if (pvlIndex > pmlIndex) {
        self.removeRoleAtIndex(pvlIndex);
        self.removeRoleAtIndex(pmlIndex);
      } else {
        self.removeRoleAtIndex(pmlIndex);
        self.removeRoleAtIndex(pvlIndex);
      }
      self.roles.push(self.getPermissionObject('PNL', service));
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
    if (self.roles.find(r => r.id === 'PML' && r.entity === ('GS_' + service._id))) {
      return 'Manage';
    } else if (self.roles.find(r => r.id === 'PVL' && r.entity === ('GS_' + service._id))) {
      return 'View';
    } else {
      return 'Hide';
    }
  }

  getPermissionObject(type: string, service: any) {
    const self = this;
    return {
      id: type,
      app: self.commonService.app._id,
      entity: 'GS' + (service ? '_' + service._id : ''),
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

  get globalPermissionType() {
    const self = this;
    if (self.roles.find(r => r.id === 'PML' && r.entity === 'GS')) {
      return 'Manage';
    } else if (self.roles.find(r => r.id === 'PVL' && r.entity === 'GS')) {
      return 'View';
    } else {
      return 'Hide';
    }
  }

  get showException() {
    const self = this;
    if (self.libraryList && self.libraryList.length > 0) {
      return true;
    }
    return false;
  }

  get checkAll() {
    const self = this;
    const temp = self.libraryList.filter(e => !e.hide);
    if (temp.length === 0) {
      return false;
    }
    return Math.min.apply(null, temp.map(e => e.selected));
  }

  set checkAll(val: any) {
    const self = this;
    self.libraryList.forEach(e => {
      e.selected = val;
    });
  }

}
