import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'odp-group-author-partners',
  templateUrl: './group-author-partners.component.html',
  styleUrls: ['./group-author-partners.component.scss']
})
export class GroupAuthorPartnersComponent implements OnInit, OnDestroy {

  @ViewChild('exceptionListModal', { static: false }) exceptionListModal: TemplateRef<HTMLElement>;
  @ViewChild('flowFGAModal', { static: false }) flowFGAModal: TemplateRef<HTMLElement>;
  @Input() roles: Array<any>;
  @Output() rolesChange: EventEmitter<Array<any>>;
  exceptionListModalRef: NgbModalRef;
  flowFGAModalRef: NgbModalRef;
  toggleDropdown: any;
  dataServiceTabs: Array<{ type: string; name: string; }>;
  partersList: Array<any>;
  flowList: Array<any>;
  subscriptions: any;
  exceptionList: Array<any>;
  flowExceptionList: Array<any>;
  searchTerm: string;
  selectedException: any;
  selectedFlowException: any;
  dropdownToggle: {
    [key: string]: boolean
  };
  flowDropdownToggle: {
    [key: string]: boolean
  };
  flowExceptionForPartner: any;
  addException: boolean;
  searchText: string;
  flowExceptionsSaved: boolean;
  flowExceptionPlaceHolder: Array<any>;
  flowListPlaceHolder: Array<any>;

  constructor(
    private commonService: CommonService,
    private appService: AppService
  ) {
    const self = this;
    self.rolesChange = new EventEmitter();
    self.toggleDropdown = {};
    self.flowDropdownToggle = {};
    self.roles = [];
    self.exceptionList = [];
    self.flowExceptionList = [];
    self.subscriptions = {};
    self.partersList = [];
    self.flowList = [];
    self.dropdownToggle = {};
    self.dataServiceTabs = [
      {
        type: 'P',
        name: 'All Tabs',
      },
      {
        type: 'PF',
        name: 'Integration Flows',
      },
      {
        type: 'PP',
        name: 'Profiles'
      },
      {
        type: 'PH',
        name: 'Properties'
      },
      {
        type: 'PS',
        name: 'Settings'
      },
      {
        type: 'PM',
        name: 'Settings'
      }
    ];
    self.flowExceptionForPartner = {};
    self.addException = false;
    self.flowExceptionsSaved = false;
    self.flowExceptionPlaceHolder = [];
    self.flowListPlaceHolder = [];
  }

  ngOnInit() {
    const self = this;
    if (!self.roles) {
      self.roles = [];
    }
    const temp = self.roles.filter(r => r.entity.indexOf('PM_') > -1)
      .map(item => item.entity.split('_')[1])
      .filter((e, i, a) => a.indexOf(e) === i);
    const flowExceptions = self.roles.filter(r => r.entity.indexOf('FLOW_') > -1)
      .map(item => item.entity.split('_')[1])
      .filter((e, i, a) => a.indexOf(e) === i);
    self.exceptionList = temp.map(item => {
      const obj: any = {};
      obj._id = item;
      return obj;
    });
    self.flowExceptionList = flowExceptions.map(item => {
      const obj: any = {};
      obj._id = item;
      return obj;
    });
    self.getPartnersList();
  }

  getPartnersList() {
    const self = this;
    const options: GetOptions = {
      select: 'name flows',
      count: -1,
      filter: {
        app: self.commonService.app._id,
      }
    };
    self.subscriptions['partnersList'] = self.commonService.get('partnerManager', `/${this.commonService.app._id}/partner`, options).subscribe(res => {
      self.partersList = res.filter(e => e);
      self.partersList.forEach(_srvc => {
        _srvc['attribute'] = _srvc.flows.length;
      });
      self.exceptionList.forEach(item => {
        const temp = self.partersList.find(e => e._id === item._id);
        if (temp) {
          temp.hide = true;
          item.name = temp.name;
        } else {
          item.name = 'ERROR';
        }
      });
    });
  }

  /*removeRoleAtIndex(index: number) {
    const self = this;
    if (index > -1) {
      self.roles.splice(index, 1);
    }
  }*/

  getPermissionObject(id: string, service: any, flow?: boolean) {
    const self = this;
    if (id === null || id.length === 0 || service === null || (service && Object.keys(service).length === 0)) {
      return {};
    }
    return {
      id,
      app: self.commonService.app._id,
      entity: flow ? 'FLOW' + (service ? '_' + service._id : '') : 'PM' + (service ? '_' + service._id : ''),
      type: 'author'
    };
  }

  openFlowFGAModal(exp) {
    const self = this;
    self.flowExceptionForPartner = exp;
    self.flowFGAModalRef = self.commonService.modal(self.flowFGAModal, {
      windowClass: 'flow-modal-class'
    });
    self.fetchFlowList();
    self.flowFGAModalRef.result.then(close => {
      if (close) {
        self.flowExceptionsSaved = true;
      } else {
        self.flowExceptionsSaved = false;
        self.discardFlowExceptionChngs();
      }
    }, dismiss => { });
  }

  openExceptionModal() {
    const self = this;
    self.exceptionListModalRef = self.commonService.modal(self.exceptionListModal, {
      centered: true,
      windowClass: 'service-exception-modal'
    });
    self.exceptionListModalRef.result.then(close => {
      if (close) {
        const temp = self.partersList.filter(s => !s.hide && s.selected);
        if (temp && temp.length > 0) {
          temp.forEach(item => {
            item.hide = true;
            self.exceptionList.push(item);
            let globalPermissions = [];
            globalPermissions = self.appService.cloneObject(self.roles.filter(e => e.entity === ('PM' + (self.selectedException ?
              ('_' + self.selectedException._id) : ''))));
            globalPermissions.forEach(itm => {
              itm['entity'] = 'PM_' + item._id;
              self.roles.push(itm);
            });
          });
        }
      }
      self.checkAll = false;
    }, dismiss => {
      self.checkAll = false;
    });
  }

  fetchFlowList() {
    const self = this;
    if (self.flowExceptionList.length > 0) {
      self.selectedFlowException = self.flowExceptionList[0];
    }
    self.roles.forEach(role => {
      if (role.entity.substr(0, 4) === 'FLOW') {
        self.flowExceptionPlaceHolder.push(role);
      }
    });
    const options: GetOptions = {
      select: 'name flows',
      count: -1,
      filter: {
        app: self.commonService.app._id,
        _id: self.selectedException._id
      }
    };
    self.subscriptions['partnersList'] = self.commonService.get('partnerManager', `/${this.commonService.app._id}/partner`, options).subscribe(res => {
      if (res[0].flows.length > 0) {
        res[0].flows.forEach(e => {
          self.fetchFlowForPartner(e).subscribe(flw => {
            if (self.flowExceptionList.length > 0) {
              self.flowExceptionList.forEach(expFlw => {
                if (expFlw._id === flw._id) {
                  expFlw.name = flw.name;
                  expFlw.partner = flw.partner;
                } else {
                  self.flowList.push(flw);
                }
              });
            } else {
              self.flowList.push(flw);
            }
            self.flowListPlaceHolder = [...self.flowExceptionList];
          });
        });
      }
    });
  }

  fetchFlowForPartner(flowId): Observable<any> {
    const self = this;
    return self.commonService.get('partnerManager', `/${this.commonService.app._id}/flow/${flowId}`, { select: 'name partner' });
  }

  discardFlowExceptionChngs() {
    const self = this;
    if (!self.flowExceptionsSaved) {
      const temp = [];
      self.roles.forEach((role, i) => {
        if (role.entity.substr(0, 4) === 'FLOW') {
          temp.push(i);
        }
      });
      temp.forEach(index => {
        self.roles.splice(index, 1);
      });
    }
    self.roles = [...self.roles, ...self.flowExceptionPlaceHolder];
    self.flowExceptionList = [...self.flowListPlaceHolder];
  }

  addFlowException(flow) {
    const self = this;
    const index = self.flowList.findIndex(e => e._id === flow._id);
    self.flowExceptionList.push(flow); // {'_id': 'FLOW123', 'name': 'FLOW 1', partner: 'PTR2005'}
    self.selectedFlowException = flow;
    self.flowList.splice(index, 1);
    ['MD', 'MB', 'MS'].forEach(item => {
      self.roles.push({
        id: 'PNPF' + item,
        app: self.commonService.app._id,
        entity: `FLOW_${flow._id}`,
        type: 'author'
      });
    });
  }

  hasPermission(type: string) {
    const self = this;
    return self.commonService.hasPermission(type);
  }

  removeException(service: any, flowExp?: boolean) {
    const self = this;
    if (!flowExp) {
      const index = self.exceptionList.findIndex(i => i._id === service._id);
      if (index > -1) {
        self.exceptionList.splice(index, 1);
        self.roles = self.roles.filter(r => r.entity.indexOf(service._id) === -1);
        const temp = self.partersList.find(s => s._id === service._id);
        temp.hide = false;
        self.rolesChange.emit(self.roles);
      }
    } else if (flowExp) {
      const index = self.flowExceptionList.findIndex(i => i._id === service._id);
      if (index > -1) {
        self.flowExceptionList.splice(index, 1);
        self.flowList.push(service);
        self.roles = self.roles.filter(r => r.entity.indexOf(service._id) === -1);
        self.rolesChange.emit(self.roles);
      }
    }
  }

  get showException() {
    const self = this;
    if (self.partersList && self.partersList.length > 0) {
      return true;
    }
    return false;
  }

  get checkAll() {
    const self = this;
    const temp = self.partersList.filter(e => !e.hide);
    if (temp.length === 0) {
      return false;
    }
    return Math.min.apply(null, temp.map(e => e.selected));
  }

  set checkAll(val: any) {
    const self = this;
    self.partersList.forEach(e => {
      e.selected = val;
    });
  }

  togglePermissionLevel(segment: string, flow?: boolean) {
    const self = this;
    if (!self.hasPermission('PMGADS')) {
      return;
    }
    let blockedIndex = -1;
    if (!flow) {
      blockedIndex = self.roles.findIndex(r => r.id === 'PMP' + segment && r.entity === ('PM' +
        (self.selectedException ? ('_' + self.selectedException._id) : '')));
    } else if (flow) {
      blockedIndex = self.roles.findIndex(r => r.id === 'PMPFM' + segment && r.entity === ('PM' +
        (self.selectedException ? ('_' + self.selectedException._id) : '')));
    }
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    } else {
      self.roles.push(self.getPermissionObject((flow ? 'PMPFM' : 'PMP') + segment, self.selectedException));
    }
  }

  set basicPermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNPB' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const viewIndex = self.roles.findIndex(r => r.id === 'PVPB' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }
    const createIndex = self.roles.findIndex(r => r.id === 'PMPBC' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (createIndex > -1) {
      self.roles.splice(createIndex, 1);
    }
    const editIndex = self.roles.findIndex(r => r.id === 'PMPBU' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (editIndex > -1) {
      self.roles.splice(editIndex, 1);
    }
    const deleteIndex = self.roles.findIndex(r => r.id === 'PMPBD' && r.entity === ('PM' + (self.selectedException ?
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
      if (val === 'PNPB') {
        self.commonPermission = { id: 'PNPFPD', type: 'FPD' };
        self.commonPermission = { id: 'PNPFPS', type: 'FPS' };
        self.commonPermission = { id: 'PNPFM', type: 'FM' };
        self.commonPermission = { id: 'PNPH', type: 'H' };
        self.commonPermission = { id: 'PNPM', type: 'M' };

      }
    }
  }

  set profilePermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNPP' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const viewIndex = self.roles.findIndex(r => r.id === 'PVPP' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }
    const createIndex = self.roles.findIndex(r => r.id === 'PMPPC' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (createIndex > -1) {
      self.roles.splice(createIndex, 1);
    }

    const deleteIndex = self.roles.findIndex(r => r.id === 'PMPPD' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (deleteIndex > -1) {
      self.roles.splice(deleteIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        self.roles.push(self.getPermissionObject(item, self.selectedException));
      });
      if (self.basicPermission === 'blocked') {
        self.basicPermission = 'PVPB';
      }
    } else {
      if ((val.substring(0, 2) === 'PV' || val.substring(0, 2) === 'PM') && self.basicPermission === 'blocked') {
        self.basicPermission = 'PVPB';
      }
      self.roles.push(self.getPermissionObject(val, self.selectedException));
    }

  }
  // Common setPermission for Power settings,Definition,Experience and Role
  set commonPermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNP' + val.type && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const manageIndex = self.roles.findIndex(r => r.id === 'PMP' + val.type && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (manageIndex > -1) {
      self.roles.splice(manageIndex, 1);
    }
    const viewIndex = self.roles.findIndex(r => r.id === 'PVP' + val.type && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }
    if ((val.id.substring(0, 2) === 'PV' || val.id.substring(0, 2) === 'PM') && self.basicPermission === 'blocked') {
      self.basicPermission = 'PVPB';
    }
    if ((val.id === 'PMPFPD' || val.id === 'PMPFPS') && self.flowPermission === 'blocked') {
      self.commonPermission = { id: 'PVPFM', type: 'FM' };
    }
    if (val.id === 'PNPFM') {
      self.commonPermission = { id: 'PNPFPD', type: 'FPD' };
      self.commonPermission = { id: 'PNPFPS', type: 'FPS' };
    }
    self.roles.push(self.getPermissionObject(val.id, self.selectedException));
  }

  set commonFlowPermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNPFM' +
      val.type && r.entity === ('FLOW' + (self.selectedFlowException ?
        ('_' + self.selectedFlowException._id) : '')));
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const manageIndex = self.roles.findIndex(r => r.id === 'PMPFM' +
      val.type && r.entity === ('FLOW' + (self.selectedFlowException ? ('_' + self.selectedFlowException._id) : '')));
    if (manageIndex > -1) {
      self.roles.splice(manageIndex, 1);
    }
    const viewIndex = self.roles.findIndex(r => r.id === 'PVPFMB' +
      val.type && r.entity === ('FLOW' + (self.selectedFlowException ?
        ('_' + self.selectedFlowException._id) : '')));
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }
    if ((val.id.substring(0, 2) === 'PM' || val.id.substring(0, 2) === 'FLOW') && self.basicFlowExpPermission === 'blocked') {
      self.basicPermission = 'PVPB';
      self.basicFlowExpPermission = 'PVPFMB';
    }
    self.roles.push(self.getPermissionObject(`${val.id + val.type}`, self.selectedFlowException, true));
  }

  get powerPermissionDeploy() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => (
      r.id === 'PMPFPD') && r.entity === ('PM' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (manageIndex > -1) {
      return 'manage';
    }
    return 'blocked';
  }

  get powerPermissionsStartStop() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => (
      r.id === 'PMPFPS') && r.entity === ('PM' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (manageIndex > -1) {
      return 'manage';
    }
    return 'blocked';
  }

  get ManagementPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => (
      r.id === 'PMPM') && r.entity === ('PM' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (manageIndex > -1) {
      return 'manage';
    }
    return 'blocked';
  }

  get basicPermission() {
    const self = this;
    const viewIndex = self.roles.findIndex(r => r.id === 'PVPB' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    const manageIndex = self.roles.findIndex(r => (r.id === 'PMPBC' || r.id === 'PMPBU' || r.id === 'PMPBD')
      && r.entity === ('PM' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (manageIndex > -1) {
      return 'manage';
    }
    if (viewIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }

  get profilePermission() {
    const self = this;
    const viewIndex = self.roles.findIndex(r => r.id === 'PVPP' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    const manageIndex = self.roles.findIndex(r => (r.id === 'PMPPC' || r.id === 'PMPPD') && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (manageIndex > -1) {
      return 'manage';
    }
    if (viewIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }

  get createPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMPBC' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (manageIndex > -1) {
      return true;
    }
    return false;
  }

  get editPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMPBU' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (manageIndex > -1) {
      return true;
    }
    return false;
  }

  get deletePermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMPBD' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (manageIndex > -1) {
      return true;
    }
    return false;
  }

  get flowPermissionDeploy() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => (
      r.id === 'PMPFPD') && r.entity === ('FLOW' + (self.selectedFlowException ?
        ('_' + self.selectedFlowException._id) : '')));
    if (manageIndex > -1) {
      return 'manage';
    }
    return 'blocked';
  }

  get flowPermissionsStartStop() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => (
      r.id === 'PMPFPS') && r.entity === ('FLOW' + (self.selectedFlowException ?
        ('_' + self.selectedFlowException._id) : '')));
    if (manageIndex > -1) {
      return 'manage';
    }
    return 'blocked';
  }

  get basicFlowExpPermission() {
    const self = this;
    const viewIndex = self.roles.findIndex(r => r.id === 'PVPFMB' && r.entity === ('FLOW' + (self.selectedFlowException ?
      ('_' + self.selectedFlowException._id) : '')));
    const manageIndex = self.roles.findIndex(r => (r.id === 'PMPFMBC' || r.id === 'PMPFMBU' || r.id === 'PMPFMBD')
      && r.entity === ('FLOW' + (self.selectedFlowException ?
        ('_' + self.selectedFlowException._id) : '')));
    if (manageIndex > -1) {
      return 'manage';
    }
    if (viewIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }

  set basicFlowExpPermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNPFMB' && r.entity === ('FLOW' + (self.selectedFlowException ?
      ('_' + self.selectedFlowException._id) : '')));
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const viewIndex = self.roles.findIndex(r => r.id === 'PVPFMB' && r.entity === ('FLOW' + (self.selectedFlowException ?
      ('_' + self.selectedFlowException._id) : '')));
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }
    const createIndex = self.roles.findIndex(r => r.id === 'PMPFMBC' && r.entity === ('FLOW' + (self.selectedFlowException ?
      ('_' + self.selectedFlowException._id) : '')));
    if (createIndex > -1) {
      self.roles.splice(createIndex, 1);
    }
    const editIndex = self.roles.findIndex(r => r.id === 'PMPFMBU' && r.entity === ('FLOW' + (self.selectedFlowException ?
      ('_' + self.selectedFlowException._id) : '')));
    if (editIndex > -1) {
      self.roles.splice(editIndex, 1);
    }
    const deleteIndex = self.roles.findIndex(r => r.id === 'PMPFMBD' && r.entity === ('FLOW' + (self.selectedFlowException ?
      ('_' + self.selectedFlowException._id) : '')));
    if (deleteIndex > -1) {
      self.roles.splice(deleteIndex, 1);
    }
    if (Array.isArray(val)) {
      val.forEach(item => {
        self.roles.push(self.getPermissionObject(item, self.selectedFlowException, true));
      });
    } else {
      self.roles.push(self.getPermissionObject(val, self.selectedFlowException, true));
      /*if (val === 'PNPB') {
        self.commonPermission = { id: 'PNPFPD', type: 'FPD' };
        self.commonPermission = { id: 'PNPFPS', type: 'FPS' };
        self.commonPermission = { id: 'PNPFM', type: 'FM' };
        self.commonPermission = { id: 'PNPH', type: 'H' };

      }*/
    }
  }

  get createFlowPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMPFMBC' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    return manageIndex > -1;
  }

  get editFlowPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMPFMBU' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    return manageIndex > -1;
  }

  get deleteFlowPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMPFMBD' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    return manageIndex > -1;
  }

  get createProfilePermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMPPC' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    return manageIndex > -1;
  }

  get deleteProfilePermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PMPPD' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    return manageIndex > -1;
  }

  get flowPermission() {
    const self = this;
    const viewIndex = self.roles.findIndex(r => (
      r.id === 'PVPFMB') && r.entity === ('PM' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    const createIndex = self.roles.findIndex(r => (
      r.id === 'PMPFMBC') && r.entity === ('PM' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    const updateIndex = self.roles.findIndex(r => (
      r.id === 'PMPFMBU') && r.entity === ('PM' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    const deleteIndex = self.roles.findIndex(r => (
      r.id === 'PMPFMBD') && r.entity === ('PM' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (createIndex > -1 || updateIndex > -1 || deleteIndex > -1) {
      return 'manage';
    }
    if (viewIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }

  set flowPermission(val: any) {
    const self = this;
    const blockedFlowIndex = self.roles.findIndex(r => r.id === 'PNPFM' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (blockedFlowIndex > -1) {
      self.roles.splice(blockedFlowIndex, 1);
    }
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNPFMB' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }
    const viewIndex = self.roles.findIndex(r => r.id === 'PVPFMB' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }
    const createIndex = self.roles.findIndex(r => r.id === 'PMPFMBC' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (createIndex > -1) {
      self.roles.splice(createIndex, 1);
    }
    const editIndex = self.roles.findIndex(r => r.id === 'PMPFMBU' && r.entity === ('PM' + (self.selectedException ?
      ('_' + self.selectedException._id) : '')));
    if (editIndex > -1) {
      self.roles.splice(editIndex, 1);
    }
    const deleteIndex = self.roles.findIndex(r => r.id === 'PMPFMBD' && r.entity === ('PM' + (self.selectedException ?
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
      /*if (val === 'PNPFMB') {
        self.commonFlowPermission = { id: 'PNNSB', type: 'B' };
        self.commonFlowPermission = { id: 'PNNSIO', type: 'IO' };
        self.commonFlowPermission = { id: 'PNNSURL', type: 'URL' };
        self.commonFlowPermission = { id: 'PNNSH', type: 'H' };
      }*/
    }
  }

  get headerPermission() {
    const self = this;
    const viewIndex = self.roles.findIndex(r => (
      r.id === 'PVPH') && r.entity === ('PM' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    const manageIndex = self.roles.findIndex(r => (
      r.id === 'PMPH') && r.entity === ('PM' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (manageIndex > -1) {
      return 'manage';
    }
    if (viewIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }
  get iPPermission() {
    const self = this;
    const viewIndex = self.roles.findIndex(r => (
      r.id === 'PVPIP') && r.entity === ('PM' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    const manageIndex = self.roles.findIndex(r => (
      r.id === 'PMPIP') && r.entity === ('PM' + (self.selectedException ?
        ('_' + self.selectedException._id) : '')));
    if (manageIndex > -1) {
      return 'manage';
    }
    if (viewIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }

  currentPartnerFlows(prtnrId) {
    const self = this;
    const tempArr = self.flowExceptionList.filter(flow => flow.partner === prtnrId);
    return tempArr.length > 0;
  }

  hasPermissionStartsWith(segment: string) {
    const self = this;
    return self.commonService.hasPermissionStartsWith(segment);
  }

  ngOnDestroy(): void {
    const self = this;
    self.flowList = [];
    Object.keys(self.subscriptions).forEach(e => {
      self.subscriptions[e].unsubscribe();
    });
    if (self.exceptionListModalRef) {
      self.exceptionListModalRef.close();
    }
    if (self.flowFGAModalRef) {
      self.flowFGAModalRef.close();
    }
  }
}
