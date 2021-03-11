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
  @ViewChild('exceptionListModal', { static: false }) exceptionListModal: TemplateRef<HTMLElement>;
  exceptionList: Array<any>;
  toggleDropdown: any;
  subscriptions: any;
  searchTerm: string;
  libraryList: Array<{ _id: string; name: string; hide?: boolean; selected?: boolean }>;
  exceptionListModalRef: NgbModalRef;

  constructor(private commonService: CommonService,
    private appService: AppService) {
    const self = this;
    self.exceptionList = [];
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
    self.exceptionList = temp.map(item => {
      const obj: any = {};
      obj._id = item;
      return obj;
    });
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
    self.commonService.get('serviceManager', '/globalSchema', options).subscribe(res => {
      self.libraryList = res;
      self.libraryList.forEach(_lib => {
        _lib['attribute'] = GroupAuthorLibraryComponent.libAttrCount(_lib['definition']);
      });
      self.exceptionList.forEach(item => {
        const temp = self.libraryList.find(e => e._id === item._id);
        if (temp) {
          temp.hide = true;
          item.name = temp.name;
        } else {
          item.name = 'ERROR';
        }
      });
    });
  }

  openExceptionModal() {
    const self = this;
    self.exceptionListModalRef = self.commonService.modal(self.exceptionListModal, {
      centered: true,
      windowClass: 'service-exception-modal'
    });
    self.exceptionListModalRef.result.then(close => {
      if (close) {
        const temp = self.libraryList.filter(s => !s.hide && s.selected);
        if (temp && temp.length > 0) {
          temp.forEach(item => {
            item.hide = true;
            self.exceptionList.push(item);
            self.roles.push(self.getPermissionObject('PNL', item));
          });
        }
      }
      self.checkAll = false;
    }, dismiss => {
      self.checkAll = false;
    });
  }

  removeException(service: any) {
    const self = this;
    const index = self.exceptionList.findIndex(i => i._id === service._id);
    if (index > -1) {
      self.exceptionList.splice(index, 1);
      self.roles = self.roles.filter(r => r.entity.indexOf(service._id) === -1);
      const temp = self.libraryList.find(s => s._id === service._id);
      temp.hide = false;
      self.rolesChange.emit(self.roles);
    }
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
    if (self.exceptionListModalRef) {
      self.exceptionListModalRef.close();
    }
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
