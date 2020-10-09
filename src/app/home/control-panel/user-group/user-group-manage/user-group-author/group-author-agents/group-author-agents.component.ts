import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-group-author-agents',
  templateUrl: './group-author-agents.component.html',
  styleUrls: ['./group-author-agents.component.scss']
})
export class GroupAuthorAgentsComponent implements OnInit {

  @Input() roles: Array<any>;
  @Output() rolesChange: EventEmitter<Array<any>>;
  @ViewChild('exceptionListModal', { static: false }) exceptionListModal: TemplateRef<HTMLElement>;
  exceptionListModalRef: NgbModalRef;
  toggleDropdown: any;
  subscriptions: any = {};
  showLazyLoader: boolean;
  selectedException: any;
  exceptionList: Array<any>;
  viewAgentPwdList: Array<any>;
  powerSettingList: Array<any>;
  searchTerm: string;
  agentList: Array<{ _id: string; name: string; hide?: boolean; selected?: boolean }>;

  constructor(private commonService: CommonService,
              private appService: AppService) {
    const self = this;
    self.roles = [];
    self.toggleDropdown = {};
    self.rolesChange = new EventEmitter();
    self.exceptionList = [];
    self.agentList = [];
    self.viewAgentPwdList = [
      {
        label: 'View Password',
        segment: 'APW',
        entity: 'AGENT'
      }
    ];
    self.powerSettingList = [
      {
        label: 'Enable / Disable',
        segment: 'AEN',
        entity: 'AGENT'
      },
      {
        label: 'Stop',
        segment: 'AS',
        entity: 'AGENT'
      },
      {
        label: 'Delete',
        segment: 'ABD',
        entity: 'AGENT'
      },
      {
        label: 'Download',
        segment: 'ADL',
        entity: 'AGENT'
      },
      {
        label: 'Change Password',
        segment: 'APW',
        entity: 'AGENT'
      }
    ];
  }

  ngOnInit() {
    const self = this;
    if (!self.roles) {
      self.roles = [];
    }
    const temp = self.roles.filter(r => r.entity.indexOf('AGENT_') > -1)
        .map(item => item.entity.split('_')[1])
        .filter((e, i, a) => a.indexOf(e) === i);
    self.exceptionList = temp.map(item => {
      const obj: any = {};
      obj._id = item;
      return obj;
    });
    self.getAgentList();
  }

  getAgentList() {
    const self = this;
    const options: GetOptions = {
      select: 'name, url',
      count: -1,
      filter: {
        app: self.commonService.app._id,
      }
    };
    if (self.subscriptions['getAgentList']) {
      self.subscriptions['getAgentList'].unsubscribe();
    }
    self.subscriptions['getAgentList'] = self.commonService.get('partnerManager', '/agentRegistry', options)
        .subscribe(res => {
          self.showLazyLoader = false;
          if (res.length > 0) {
            self.agentList = res;
            self.exceptionList.forEach(item => {
              const temp = self.agentList.find(e => e._id === item._id);
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
          self.commonService.errorToast(err);
        });
  }

  getSelectedPermission(service: any) {
    const self = this;
    if (self.roles.find(r => r.id === 'PMA' && r.entity === ('AGENT' + service._id))) {
      return 'Manage';
    } else if (self.roles.find(r => r.id === 'PVA' && r.entity === ('AGENT' + service._id))) {
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
    const pvlIndex = self.roles.findIndex(r => r.id === 'PVA' && r.entity === 'AGENT' + (service ? ('_' + service._id) : ''));
    const pmlIndex = self.roles.findIndex(r => r.id === 'PMA' && r.entity === 'AGENT' + (service ? ('_' + service._id) : ''));
    const pnlIndex = self.roles.findIndex(r => r.id === 'PNA' && r.entity === 'AGENT' + (service ? ('_' + service._id) : ''));
    if (type === 'PMA') {
      if (pvlIndex > pnlIndex) {
        self.removeRoleAtIndex(pvlIndex);
        self.removeRoleAtIndex(pnlIndex);
      } else {
        self.removeRoleAtIndex(pnlIndex);
        self.removeRoleAtIndex(pvlIndex);
      }
      self.roles.push(self.getPermissionObject('PMA', service));
    } else if (type === 'PVA') {
      if (pnlIndex > pmlIndex) {
        self.removeRoleAtIndex(pnlIndex);
        self.removeRoleAtIndex(pmlIndex);
      } else {
        self.removeRoleAtIndex(pmlIndex);
        self.removeRoleAtIndex(pnlIndex);
      }
      self.roles.push(self.getPermissionObject('PVA', service));
    } else {
      if (pvlIndex > pmlIndex) {
        self.removeRoleAtIndex(pvlIndex);
        self.removeRoleAtIndex(pmlIndex);
      } else {
        self.removeRoleAtIndex(pmlIndex);
        self.removeRoleAtIndex(pvlIndex);
      }
      self.roles.push(self.getPermissionObject('PNA', service));
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
      entity: 'AGENT' + (service ? '_' + service._id : ''),
      type: 'author'
    };
  }

  get globalPermissionType() {
    const self = this;
    if (self.roles.find(r => r.id === 'PMA' && r.entity === 'AGENT')) {
      return 'Manage';
    } else if (self.roles.find(r => r.id === 'PVA' && r.entity === 'AGENT')) {
      return 'View';
    } else {
      return 'Hide';
    }
  }

  get basicPermission() {
    const self = this;
    const viewIndex = self.roles.findIndex(r => r.id === 'PVAB' && r.entity === ('AGENT' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    const manageIndex = self.roles.findIndex(r => (r.id === 'PMABC' || r.id === 'PMABU' || r.id === 'PMABD') && r.entity ===
        ('AGENT' + (self.selectedException ?
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
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNAB' && r.entity === ('AGENT' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const viewIndex = self.roles.findIndex(r => r.id === 'PVAB' && r.entity === ('AGENT' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }
    const createIndex = self.roles.findIndex(r => r.id === 'PMABC' && r.entity === ('AGENT' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (createIndex > -1) {
      self.roles.splice(createIndex, 1);
    }
    const editIndex = self.roles.findIndex(r => r.id === 'PMABU' && r.entity === ('AGENT' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (editIndex > -1) {
      self.roles.splice(editIndex, 1);
    }
    const deleteIndex = self.roles.findIndex(r => r.id === 'PMABD' && r.entity === ('AGENT' + (self.selectedException ?
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
      if (val === 'PNAB') {
        self.commonPermission = { id: 'PNAB', type: 'B' };
        self.commonPermission = { id: 'PNAEN', type: 'EN' };
        self.commonPermission = { id: 'PNADL', type: 'DL' };
        self.commonPermission = { id: 'PNAPW', type: 'PW' };
      }
    }
  }

  set commonPermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNAB' && r.entity === ('AGENT' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const manageEnableAgent = self.roles.findIndex(r => r.id === 'PNAEN' && r.entity === ('AGENT' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (manageEnableAgent > -1) {
      self.roles.splice(manageEnableAgent, 1);
    }
    const manageDownloadAgent = self.roles.findIndex(r => r.id === 'PNADL' && r.entity === ('AGENT' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (manageDownloadAgent > -1) {
      self.roles.splice(manageDownloadAgent, 1);
    }
    const manageAPwd = self.roles.findIndex(r => r.id === 'PNAPW' && r.entity === ('AGENT' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (manageAPwd > -1) {
      self.roles.splice(manageAPwd, 1);
    }
    if ((val.id.substring(0, 2) === 'PV' || val.id.substring(0, 2) === 'PM') && self.basicPermission === 'blocked') {
      self.basicPermission = 'PVAB';
    }
    self.roles.push(self.getPermissionObject(val.id, self.selectedException));
  }

  get createPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMABC' && r.entity === ('AGENT' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    return manageIndex > -1;
  }

  get editPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMABU' && r.entity === ('AGENT' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    return manageIndex > -1;
  }

  get deletePermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMABD' && r.entity === ('AGENT' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    return manageIndex > -1;
  }

  togglePermissionLevel(segment: string) {
    const self = this;
    if (!self.commonService.hasPermissionStartsWith('PMA')) {
      return;
    }
    const blockedIndex = self.roles.findIndex(r => r.id === 'PMA' + segment && r.entity === ('AGENT' +
        (self.selectedException ? ('_' + self.selectedException._id) : '')));
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    } else {
      self.roles.push(self.getPermissionObject('PMA' + segment, self.selectedException));
    }
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
      self.basicPermission = 'PVAB';
    }
    self.roles.push(self.getPermissionObject('P' + level + segment, self.selectedException));
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

  get checkAll() {
    const self = this;
    const temp = self.agentList.filter(e => !e.hide);
    if (temp.length === 0) {
      return false;
    }
    return Math.min.apply(null, temp.map(e => e.selected));
  }

  set checkAll(val: any) {
    const self = this;
    self.agentList.forEach(e => {
      e.selected = val;
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
        const temp = self.agentList.filter(s => !s.hide && s.selected);
        if (temp && temp.length > 0) {
          temp.forEach(item => {
            item.hide = true;
            self.exceptionList.push(item);
            let globalPermissions = [];
            globalPermissions = self.appService
                .cloneObject(self.roles.filter(e => e.entity === ('AGENT' + (self.selectedException ?
                    ('_' + self.selectedException._id) : ''))));
            globalPermissions.forEach(itm => {
              itm['entity'] = 'AGENT_' + item._id;
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

  removeException(exp) {
    const self = this;
    const index = self.exceptionList.findIndex(i => i._id === exp._id);
    if (index > -1) {
      self.exceptionList.splice(index, 1);
      self.roles = self.roles.filter(r => r.entity.indexOf(exp._id) === -1);
      const temp = self.agentList.find(s => s._id === exp._id);
      temp.hide = false;
      self.rolesChange.emit(self.roles);
    }
    if (!self.exceptionList.length) {
      self.selectedException = null;
    }
  }
}
