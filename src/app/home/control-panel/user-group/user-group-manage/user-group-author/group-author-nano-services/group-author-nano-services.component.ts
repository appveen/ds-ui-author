import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-group-author-nano-services',
  templateUrl: './group-author-nano-services.component.html',
  styleUrls: ['./group-author-nano-services.component.scss']
})
export class GroupAuthorNanoServicesComponent implements OnInit {

  @Input() roles: Array<any>;
  @Output() rolesChange: EventEmitter<Array<any>>;

  @ViewChild('exceptionListModal', { static: false }) exceptionListModal: TemplateRef<HTMLElement>;
  toggleDropdown: any;
  nanoServiceList: Array<{ _id: string; name: string; hide?: boolean; selected?: boolean }>;
  exceptionList: Array<any>;
  subscriptions: any = {};
  showLazyLoader: boolean;
  exceptionListModalRef: NgbModalRef;
  searchTerm: string;
  selectedException: any;
  dropdownToggle: {
    [key: string]: boolean
  };
  designList: Array<any>;

  constructor(
    private commonService: CommonService,
    private appService: AppService
  ) {
    const self = this;
    self.dropdownToggle = {};
    self.roles = [];
    self.toggleDropdown = {};
    self.exceptionList = [];
    self.nanoServiceList = [];
    self.rolesChange = new EventEmitter();
    self.designList = [
      {
        label: 'Input/Output',
        segment: 'NSIO',
        entity: 'NS'
      },
      {
        label: 'URL',
        segment: 'NSURL',
        entity: 'NS'
      },
      {
        label: 'Headers',
        segment: 'NSH',
        entity: 'NS'
      }
    ];
  }

  ngOnInit() {
    const self = this;
    if (!self.roles) {
      self.roles = [];
    }
    const temp = self.roles.filter(r => r.entity.indexOf('NS_') > -1)
      .map(item => item.entity.split('_')[1])
      .filter((e, i, a) => a.indexOf(e) === i);
    self.exceptionList = temp.map(item => {
      const obj: any = {};
      obj._id = item;
      return obj;
    });
    self.getDataFormats();
  }

  get basicPermission() {
    const self = this;
    const viewIndex = self.roles.findIndex(r => r.id === 'PVNSB' && r.entity === ('NS' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    const manageIndex = self.roles.findIndex(r => (r.id === 'PMNSBC' || r.id === 'PMNSBU' || r.id === 'PMNSBD') && r.entity ===
        ('NS' + (self.selectedException ?
            ('_' + self.selectedException._id) : '')));
    if (manageIndex > -1) {
      return 'manage';
    }
    if (viewIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }

  set basicPermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNNSB' && r.entity === ('NS' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const viewIndex = self.roles.findIndex(r => r.id === 'PVNSB' && r.entity === ('NS' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }
    const createIndex = self.roles.findIndex(r => r.id === 'PMNSBC' && r.entity === ('NS' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (createIndex > -1) {
      self.roles.splice(createIndex, 1);
    }
    const editIndex = self.roles.findIndex(r => r.id === 'PMNSBU' && r.entity === ('NS' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (editIndex > -1) {
      self.roles.splice(editIndex, 1);
    }
    const deleteIndex = self.roles.findIndex(r => r.id === 'PMNSBD' && r.entity === ('NS' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (deleteIndex > -1) {
      self.roles.splice(deleteIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        self.roles.push(self.getPermissionObject(item, self.selectedException));
      });
    } else {
      self.roles.push(self.getPermissionObject(val, self.selectedException));
      if (val === 'PNNSB') {
        self.commonPermission = { id: 'PNNSB', type: 'B' };
        self.commonPermission = { id: 'PNNSIO', type: 'IO' };
        self.commonPermission = { id: 'PNNSURL', type: 'URL' };
        self.commonPermission = { id: 'PNNSH', type: 'H' };
      }
    }
  }

  set commonPermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNNSB' && r.entity === ('NS' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const manageIOIndex = self.roles.findIndex(r => r.id === 'PNNSIO' && r.entity === ('NS' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (manageIOIndex > -1) {
      self.roles.splice(manageIOIndex, 1);
    }
    const manageURLIndex = self.roles.findIndex(r => r.id === 'PNNSURL' && r.entity === ('NS' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (manageURLIndex > -1) {
      self.roles.splice(manageURLIndex, 1);
    }
    const manageHIndex = self.roles.findIndex(r => r.id === 'PNNSH' && r.entity === ('NS' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (manageHIndex > -1) {
      self.roles.splice(manageHIndex, 1);
    }
    if ((val.id.substring(0, 2) === 'PV' || val.id.substring(0, 2) === 'PM') && self.basicPermission === 'blocked') {
      self.basicPermission = 'PVNSB';
    }
    self.roles.push(self.getPermissionObject(val.id, self.selectedException));
  }

  getDPermissionLevel(segment: string, entity: string) {
    const self = this;
    const viewIndex = self.roles.findIndex(r => r.id === 'PV' + segment
        && r.entity === entity + (self.selectedException ? '_' + self.selectedException._id : ''));
    const manageIndex = self.roles.findIndex(r => r.id === 'PM' + segment && r.entity === entity +
        (self.selectedException ? '_' + self.selectedException._id : ''));
    if (manageIndex > -1) {
      return 'manage';
    }
    if (viewIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }

  changeDPermissionLevel(level: string, segment: string, entity: string) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PN' + segment && r.entity === entity +
        (self.selectedException ? '_' + self.selectedException._id : ''));
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const viewIndex = self.roles.findIndex(r => r.id === 'PV' + segment && r.entity === entity +
        (self.selectedException ? '_' + self.selectedException._id : ''));
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }
    const manageIndex = self.roles.findIndex(r => r.id === 'PM' + segment && r.entity === entity +
        (self.selectedException ? '_' + self.selectedException._id : ''));
    if (manageIndex > -1) {
      self.roles.splice(manageIndex, 1);
    }
    if ((level === 'V' || level === 'M') && self.basicPermission === 'blocked') {
      self.basicPermission = 'PVNSB';
    }
    self.roles.push(self.getPermissionObject('P' + level + segment, self.selectedException));
  }

  get createPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMNSBC' && r.entity === ('NS' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    return manageIndex > -1;
  }

  get editPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMNSBU' && r.entity === ('NS' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    return manageIndex > -1;
  }

  get deletePermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMNSBD' && r.entity === ('NS' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    return manageIndex > -1;
  }

  togglePermissionLevel(segment: string) {
    const self = this;
    if (!self.commonService.hasPermissionStartsWith('PMNS')) {
      return;
    }
    const blockedIndex = self.roles.findIndex(r => r.id === 'PMNS' + segment && r.entity === ('NS' +
        (self.selectedException ? ('_' + self.selectedException._id) : '')));
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    } else {
      self.roles.push(self.getPermissionObject('PMNS' + segment, self.selectedException));
    }
  }

  getSelectedPermission(service: any) {
    const self = this;
    if (self.roles.find(r => r.id === 'PMNS' && r.entity === ('NS_' + service._id))) {
      return 'Manage';
    } else if (self.roles.find(r => r.id === 'PVNS' && r.entity === ('NS_' + service._id))) {
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
      select: 'name, url',
      count: -1,
      filter: {
        app: self.commonService.app._id,
      }
    };
    if (self.subscriptions['getDataFormats']) {
      self.subscriptions['getDataFormats'].unsubscribe();
    }
    self.showLazyLoader = true;
    self.subscriptions['getDataFormats'] = self.commonService.get('partnerManager', `/${this.commonService.app._id}/nanoService`, options)
      .subscribe(res => {
        self.showLazyLoader = false;
        if (res.length > 0) {
          self.nanoServiceList = res;
          self.exceptionList.forEach(item => {
            const temp = self.nanoServiceList.find(e => e._id === item._id);
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
        const temp = self.nanoServiceList.filter(s => !s.hide && s.selected);
        if (temp && temp.length > 0) {
          temp.forEach(item => {
            item.hide = true;
            self.exceptionList.push(item);
            let globalPermissions = [];
            globalPermissions = self.appService
                .cloneObject(self.roles.filter(e => e.entity === ('NS' + (self.selectedException ?
                    ('_' + self.selectedException._id) : ''))));
            globalPermissions.forEach(itm => {
              itm['entity'] = 'NS_' + item._id;
              self.roles.push(itm);
            });
            self.selectedException = item;
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
      entity: 'NS' + (service ? '_' + service._id : ''),
      type: 'author'
    };
  }
  togglePermission(type: string, service?: any) {
    const self = this;
    const pvlIndex = self.roles.findIndex(r => r.id === 'PVNSB' && r.entity === 'NS' + (service ? ('_' + service._id) : ''));
    const pmlIndex = self.roles.findIndex(r => r.id === 'PMNS' && r.entity === 'NS' + (service ? ('_' + service._id) : ''));
    const pnlIndex = self.roles.findIndex(r => r.id === 'PNNS' && r.entity === 'NS' + (service ? ('_' + service._id) : ''));
    if (type === 'PMNS') {
      if (pvlIndex > pnlIndex) {
        self.removeRoleAtIndex(pvlIndex);
        self.removeRoleAtIndex(pnlIndex);
      } else {
        self.removeRoleAtIndex(pnlIndex);
        self.removeRoleAtIndex(pvlIndex);
      }
      self.roles.push(self.getPermissionObject('PMNS', service));
    } else if (type === 'PVNS') {
      if (pnlIndex > pmlIndex) {
        self.removeRoleAtIndex(pnlIndex);
        self.removeRoleAtIndex(pmlIndex);
      } else {
        self.removeRoleAtIndex(pmlIndex);
        self.removeRoleAtIndex(pnlIndex);
      }
      self.roles.push(self.getPermissionObject('PVNS', service));
    } else {
      if (pvlIndex > pmlIndex) {
        self.removeRoleAtIndex(pvlIndex);
        self.removeRoleAtIndex(pmlIndex);
      } else {
        self.removeRoleAtIndex(pmlIndex);
        self.removeRoleAtIndex(pvlIndex);
      }
      self.roles.push(self.getPermissionObject('PNNS', service));
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
      const temp = self.nanoServiceList.find(s => s._id === service._id);
      temp.hide = false;
      self.rolesChange.emit(self.roles);
    }
    if (!self.exceptionList.length) {
      self.selectedException = null;
    }
  }
  get globalPermissionType() {
    const self = this;
    if (self.roles.find(r => r.id === 'PMNS' && r.entity === 'NS')) {
      return 'Manage';
    } else if (self.roles.find(r => r.id === 'PVNS' && r.entity === 'NS')) {
      return 'View';
    } else {
      return 'Hide';
    }
  }

  get showException() {
    const self = this;
    if (self.nanoServiceList && self.nanoServiceList.length > 0) {
      return true;
    }
    return false;
  }
  get checkAll() {
    const self = this;
    const temp = self.nanoServiceList.filter(e => !e.hide);
    if (temp.length === 0) {
      return false;
    }
    return Math.min.apply(null, temp.map(e => e.selected));
  }

  set checkAll(val: any) {
    const self = this;
    self.nanoServiceList.forEach(e => {
      e.selected = val;
    });
  }

}
