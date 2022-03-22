import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-group-author-data-formats',
  templateUrl: './group-author-data-formats.component.html',
  styleUrls: ['./group-author-data-formats.component.scss']
})
export class GroupAuthorDataFormatsComponent implements OnInit {

  @Input() roles: Array<any>;
  @Output() rolesChange: EventEmitter<Array<any>>;

  @ViewChild('exceptionListModal', { static: false }) exceptionListModal: TemplateRef<HTMLElement>;
  toggleDropdown: any;
  dataFormatList: Array<{ _id: string; name: string; hide?: boolean; selected?: boolean }>;
  exceptionList: Array<any>;
  subscriptions: any = {};
  showLazyLoader: boolean;
  exceptionListModalRef: NgbModalRef;
  searchTerm: string;
  constructor(
    private commonService: CommonService,
  ) {
    const self = this;
    self.roles = [];
    self.toggleDropdown = {};
    self.exceptionList = [];
    self.dataFormatList = [];
    self.rolesChange = new EventEmitter();
  }
  static DataFormatAttrCount(dsDefinition): number {
    // Parse lib definition and return attribute count
    return dsDefinition?.definition?.length || 0;
  }

  ngOnInit() {
    const self = this;
    if (!self.roles) {
      self.roles = [];
    }
    const temp = self.roles.filter(r => r.entity.indexOf('DF_') > -1)
      .map(item => item.entity.split('_')[1])
      .filter((e, i, a) => a.indexOf(e) === i);
    self.exceptionList = temp.map(item => {
      const obj: any = {};
      obj._id = item;
      return obj;
    });
    self.getDataFormats();
  }

  getSelectedPermission(service: any) {
    const self = this;
    if (self.roles.find(r => r.id === 'PMDF' && r.entity === ('DF_' + service._id))) {
      return 'Manage';
    } else if (self.roles.find(r => r.id === 'PVDF' && r.entity === ('DF_' + service._id))) {
      return 'View';
    } else {
      return 'Hide';
    }
  }
  hasPermission(type: string) {
    const self = this;
    return self.commonService.hasPermission(type);
  }

  getDataFormats() {
    const self = this;
    const options: GetOptions = {
      select: 'name, definition',
      count: -1,
      filter: {
        app: self.commonService.app._id,
      }
    };
    if (self.subscriptions['getDataFormats']) {
      self.subscriptions['getDataFormats'].unsubscribe();
    }
    self.showLazyLoader = true;
    self.subscriptions['getDataFormats'] = self.commonService.get('partnerManager', `/${this.commonService.app._id}/dataFormat`, options)
      .subscribe(res => {
        self.showLazyLoader = false;
        if (res.length > 0) {
          self.dataFormatList = res;
          self.dataFormatList.forEach(_lib => {
            _lib['attribute'] = GroupAuthorDataFormatsComponent.DataFormatAttrCount(_lib['definition']);
          });
          self.exceptionList.forEach(item => {
            const temp = self.dataFormatList.find(e => e._id === item._id);
            if (temp) {
              temp.hide = true;
              item.name = temp.name;
            } else {
              item.name = 'ERROR';
            }
          });
        }
      }, err => {
        self.showLazyLoader = false;
        self.commonService.errorToast(err, 'We are unable to fetch partners, please try again later');
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
        const temp = self.dataFormatList.filter(s => !s.hide && s.selected);
        if (temp && temp.length > 0) {
          temp.forEach(item => {
            item.hide = true;
            self.exceptionList.push(item);
            self.roles.push(self.getPermissionObject('PNDF', item));
          });
        }
      }
      self.checkAll = false;
    }, dismiss => {
      self.checkAll = false;
    });
  }
  getPermissionObject(type: string, service: any) {
    const self = this;
    return {
      id: type,
      app: self.commonService.app._id,
      entity: 'DF' + (service ? '_' + service._id : ''),
      type: 'author'
    };
  }
  togglePermission(type: string, service?: any) {
    const self = this;
    const pvlIndex = self.roles.findIndex(r => r.id === 'PVDF' && r.entity === 'DF' + (service ? ('_' + service._id) : ''));
    const pmlIndex = self.roles.findIndex(r => r.id === 'PMDF' && r.entity === 'DF' + (service ? ('_' + service._id) : ''));
    const pnlIndex = self.roles.findIndex(r => r.id === 'PNDF' && r.entity === 'DF' + (service ? ('_' + service._id) : ''));
    if (type === 'PMDF') {
      if (pvlIndex > pnlIndex) {
        self.removeRoleAtIndex(pvlIndex);
        self.removeRoleAtIndex(pnlIndex);
      } else {
        self.removeRoleAtIndex(pnlIndex);
        self.removeRoleAtIndex(pvlIndex);
      }
      self.roles.push(self.getPermissionObject('PMDF', service));
    } else if (type === 'PVDF') {
      if (pnlIndex > pmlIndex) {
        self.removeRoleAtIndex(pnlIndex);
        self.removeRoleAtIndex(pmlIndex);
      } else {
        self.removeRoleAtIndex(pmlIndex);
        self.removeRoleAtIndex(pnlIndex);
      }
      self.roles.push(self.getPermissionObject('PVDF', service));
    } else {
      if (pvlIndex > pmlIndex) {
        self.removeRoleAtIndex(pvlIndex);
        self.removeRoleAtIndex(pmlIndex);
      } else {
        self.removeRoleAtIndex(pmlIndex);
        self.removeRoleAtIndex(pvlIndex);
      }
      self.roles.push(self.getPermissionObject('PNDF', service));
    }
  }
  removeRoleAtIndex(index: number) {
    const self = this;
    if (index > -1) {
      self.roles.splice(index, 1);
    }
  }
  removeException(service: any) {
    const self = this;
    const index = self.exceptionList.findIndex(i => i._id === service._id);
    if (index > -1) {
      self.exceptionList.splice(index, 1);
      self.roles = self.roles.filter(r => r.entity.indexOf(service._id) === -1);
      const temp = self.dataFormatList.find(s => s._id === service._id);
      temp.hide = false;
      self.rolesChange.emit(self.roles);
    }
  }

  get globalPermissionType() {
    const self = this;
    if (self.roles.find(r => r.id === 'PMDF' && r.entity === 'DF')) {
      return 'Manage';
    } else if (self.roles.find(r => r.id === 'PVDF' && r.entity === 'DF')) {
      return 'View';
    } else {
      return 'Hide';
    }
  }

  get showException() {
    const self = this;
    if (self.dataFormatList && self.dataFormatList.length > 0) {
      return true;
    }
    return false;
  }
  get checkAll() {
    const self = this;
    const temp = self.dataFormatList.filter(e => !e.hide);
    if (temp.length === 0) {
      return false;
    }
    return Math.min.apply(null, temp.map(e => e.selected));
  }

  set checkAll(val: any) {
    const self = this;
    self.dataFormatList.forEach(e => {
      e.selected = val;
    });
  }

}
