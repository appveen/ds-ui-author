import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { GetOptions, CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { Group } from 'src/app/utils/interfaces/group';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { CanComponentDeactivate } from 'src/app/utils/guards/route.guard';
@Component({
  selector: 'odp-user-group-manage',
  templateUrl: './user-group-manage.component.html',
  styleUrls: ['./user-group-manage.component.scss']
})
export class UserGroupManageComponent implements OnInit, OnDestroy, CanComponentDeactivate {

  @ViewChild('pageChangeModalTemplate', { static: false }) pageChangeModalTemplate;
  subscriptions: any = {};
  activeTab: number;
  group: Group;
  apiConfig: GetOptions;
  showLazyLoader: boolean;
  alertModalData: any;
  oldData: Group;
  breadcrumbPaths: Array<Breadcrumb>;
  oldGroup: Group;
  alertModalRef: NgbModalRef;
  pageChangeModalTemplateRef: NgbModalRef;
  updatedGrpName: string;
  updatedGrpDesc: string;
  openDeleteModal: EventEmitter<any>;
  alertModal: {
    statusChange?: boolean;
    title: string;
    message: string;
    _id: string;
  };
  allUsers: Array<any>;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private route: ActivatedRoute,
    private ts: ToastrService) {
    const self = this;
    self.apiConfig = {};
    self.group = {};
    self.oldData = {};
    self.alertModalData = {};
    self.breadcrumbPaths = [];
    self.updatedGrpName = '';
    self.updatedGrpDesc = '';
    self.openDeleteModal = new EventEmitter();
    self.alertModal = {
      statusChange: false,
      title: '',
      message: '',
      _id: null
    };
  }

  ngOnInit() {
    const self = this;
    self.breadcrumbPaths.push({
      active: false,
      label: 'Groups',
      url: '/app/' + self.commonService.app._id + '/cp/gr'
    });
    self.route.params.subscribe(param => {
      if (param.id) {
        self.getGroup(param.id);
      }
    });
  }

  showTabWithPermission() {
    const self = this;
    if (self.showAuthorTab) {
      self.activeTab = 0;
    } else if (self.showAppcenterTab) {
      self.activeTab = 1;
    } else if (self.showMembersTab) {
      self.activeTab = 2;
    } else if (self.showBotsTab) {
      self.activeTab = 3;
    }
  }

  getGroup(id: string) {
    const self = this;
    self.showLazyLoader = true;
    self.apiConfig.filter = {};
    self.subscriptions['getGroup'] = self.commonService.get('user', '/group/' + id, self.apiConfig).subscribe(res => {
      self.showLazyLoader = false;
      try {
        if (res.roles && res.roles.length > 0) {
          const invalidList = res.roles.map((e, i) => {
            if (!e.entity || (e.entity.split('_')[1] && e.entity.split('_')[1] === 'null')) {
              return i;
            } else {
              return null;
            }
          }).filter(e => e);
          invalidList.reverse();
          invalidList.forEach(e => {
            res.roles.splice(e, 1);
          });
        }
      } catch (e) {
        console.error('While removing invalid role', e);
      }
      self.group = res;
      self.getMembers();
      self.oldGroup = self.appService.cloneObject(res);
      if (!self.group.roles) {
        self.group.roles = [];
      }
      self.fillDefaultRoles();
      self.oldData = self.appService.cloneObject(self.group);
      self.breadcrumbPaths.push({
        active: true,
        label: self.group.name
      });
    }, err => {
      self.activeTab = 0;
      self.showLazyLoader = false;
      self.commonService.errorToast(err, 'Unable to fetch user groups, please try again later');
    });
  }
  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach(e => {
      self.subscriptions[e].unsubscribe();
    });
    if (self.pageChangeModalTemplateRef) {
      self.pageChangeModalTemplateRef.close();
    }
    if (self.alertModalRef) {
      self.alertModalRef.close();
    }
  }

  isThisUser(user) {
    const self = this;
    return user._id === self.commonService.userDetails._id;
  }

  saveGroup() {
    const self = this;
    const payload = self.group;
    let response;
    payload.app = self.commonService.app._id;
    payload.users = self.allUsers.map(u => u._id);
    if (!self.canEditGroup) {
      delete payload.name;
      delete payload.description;
    }
    if (!(self.showMembersTab || self.showBotsTab)) {
      delete payload.users;
    }
    if (!(self.showAuthorTab || self.showAppcenterTab)) {
      delete payload.roles;
    } else {
      payload.roles = payload.roles.filter(e => e.id && (!e.id.startsWith('PN') || e.entity.indexOf('_') > -1));
    }
    self.showLazyLoader = true;
    if (self.group._id) {
      response = self.commonService.put('user', '/group/' + self.group._id, payload);
    } else {
      response = self.commonService.post('user', '/group/', payload);
    }
    self.subscriptions['saveGroup'] = response.subscribe(res => {
      self.updatedGrpName = res.name;
      self.updatedGrpDesc = res.description;
      self.showLazyLoader = false;
      self.ts.success('Group saved sucessfully');
      self.group = res;
      self.oldData = self.appService.cloneObject(self.group);
      self.router.navigate(['/app', self.commonService.app._id, 'cp', 'gr']);
    }, err => {
      self.showLazyLoader = false;
      self.commonService.errorToast(err);
    });
  }

  getMembers() {
    const self = this;
    const options = {
      select: 'username,basicDetails.name,accessControl.apps,bot',
      count: -1,
      noApp: true
    };
    const arr = [];
    arr.push(self.commonService.get('user', `/${self.commonService.app._id}/group/${self.group._id}/usr`, options).toPromise());
    // arr.push(self.commonService.get('user', `/bot/app/${self.commonService.app._id}/`, options).toPromise());
    Promise.all(arr).then(res => {
      self.allUsers = Array.prototype.concat.apply([], res);
      self.showTabWithPermission();
    }, err => {
      self.allUsers = [];
      self.showTabWithPermission();
    });
  }

  deleteGroup() {
    const self = this;
    self.alertModal.statusChange = false;
    self.alertModal.title = 'Delete Group';
    self.alertModal.message = 'Are you sure you want to delete <span class="text-delete font-weight-bold">'
      + self.group.name + '</span> Group?';
    self.alertModal._id = self.group._id;
    self.openDeleteModal.emit(self.alertModal);
  }

  closeDeleteModal(data) {
    const self = this;
    if (data) {
      const url = '/group/' + data._id;
      self.showLazyLoader = true;
      self.subscriptions['deleteGroup'] = self.commonService.delete('user', url).subscribe(d => {
        self.showLazyLoader = false;
        self.ts.success('Group deleted sucessfully');
        self.router.navigate(['/app', self.commonService.app._id, 'cp', 'gr']);
      }, err => {
        self.showLazyLoader = false;
        self.commonService.errorToast(err, 'Unable to delete, please try again later');
      });
    }
  }

  hasPermission(type: string, entity?: string) {
    const self = this;
    return self.commonService.hasPermission(type, entity);
  }

  hasPermissionStartsWith(segment: string) {
    const self = this;
    return self.commonService.hasPermissionStartsWith(segment);
  }

  getPermissionObject(type: string, entity: string) {
    const self = this;
    return {
      id: type,
      app: self.commonService.app._id,
      entity,
      type: 'author'
    };
  }

  fillDefaultRoles() {
    const self = this;
    if (self.group.roles.length === 0) {
      if (self.hasPermission('PMGADS') || self.hasPermission('PVGADS')) {
        ['DSB', 'DSD', 'DSPD', 'DSPS', 'DSIDPR', 'DSIDPO', 'DSIRSU', 'DSIRAP', 'DSIRRJ', 'DSIRDI',
          'DSIRRW', 'DSSDH', 'DSSPD', 'DSSR', 'DSSE', 'DSSF', , 'DSSP', 'DSR', 'DSE'].forEach(item => {
            self.group.roles.push({
              id: 'PN' + item,
              app: self.commonService.app._id,
              entity: 'SM',
              type: 'author'
            });
          });
      }

      if (self.hasPermission('PMGAP') || self.hasPermission('PVGAP')) {
        ['PB', 'PFM', 'PP', 'PPPD', 'PFPS', 'PH'].forEach(item => {
          self.group.roles.push({
            id: 'PN' + item,
            app: self.commonService.app._id,
            entity: 'PM',
            type: 'author'
          });
        });
      }

      if (self.hasPermission('PMGNS') || self.hasPermission('PVGNS')) {
        ['NSB', 'NSIO', 'NSURL', 'NSH'].forEach(item => {
          self.group.roles.push({
            id: 'PN' + item,
            app: self.commonService.app._id,
            entity: 'NS',
            type: 'author'
          });
        });
      }

    }
    if (!self.group.roles.find(r => (r.id === 'PVL' || r.id === 'PML' || r.id === 'PNL') && r.entity === 'GS')
      && (self.hasPermission('PMGAL') || self.hasPermission('PVGAL'))) {
      self.group.roles.push(self.getPermissionObject('PNL', 'GS'));
    }
    if (!self.group.roles.find(r => (r.id === 'PVUB' || r.id === 'PMUB' || r.id === 'PNUB') && r.entity === 'USER')
      && (self.hasPermission('PMGAU') || self.hasPermission('PVGAU'))) {
      self.group.roles.push(self.getPermissionObject('PNUB', 'USER'));
    }
    if (!self.group.roles.find(r => (r.id === 'PVGB' || r.id === 'PMGB' || r.id === 'PNGB') && r.entity === 'GROUP')
      && (self.hasPermission('PMGAG') || self.hasPermission('PVGAG'))) {
      self.group.roles.push(self.getPermissionObject('PNGB', 'GROUP'));
    }
    if (!self.group.roles.find(r => (r.id === 'PVDF' || r.id === 'PMDF' || r.id === 'PNDF') && r.entity === 'DF')
      && (self.hasPermission('PMGADF') || self.hasPermission('PVGADF'))) {
      self.group.roles.push(self.getPermissionObject('PNDF', 'DF'));
    }
    if (!self.group.roles.find(r => (r.id === 'PVNS' || r.id === 'PMNS' || r.id === 'PNNS') && r.entity === 'NS')
      && (self.hasPermission('PMGANS') || self.hasPermission('PVGANS'))) {
      self.group.roles.push(self.getPermissionObject('PNNS', 'NS'));
    }
    if (!self.group.roles.find(r => (r.id === 'PVA' || r.id === 'PMA' || r.id === 'PNA') && r.entity === 'AGENT')
      && (self.hasPermission('PMGAA') || self.hasPermission('PVGAA'))) {
      self.group.roles.push(self.getPermissionObject('PNA', 'AGENT'));
    }

    // Remove the Invalid  permissions
    const blackListArray = ['PMDSSR', 'PMDSSE', 'PMDSSF'];
    const indexes = [];
    self.group.roles.forEach((element, i) => {
      const index = blackListArray.findIndex(e => e === element.id);
      if (index > -1) {
        indexes.push(i);
      }
    });
    indexes.reverse().forEach(i => {
      self.group.roles.splice(i, 1);
    });

    // removing Duplicate permissions
    self.group.roles = self.group.roles.reduce((acc, current) => {
      const x = acc.find(item => item.id === current.id && item.app === current.app && item.entity === current.entity);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
  }
  isChangesDone() {
    const self = this;
    if (self.updatedGrpName.length > 0 || self.updatedGrpDesc.length > 0) {
      return false;
    } else {
      return !(self.group.name === self.oldGroup.name && self.group.description === self.oldGroup.description);
    }
  }
  canDeactivate(): Promise<boolean> | boolean {
    const self = this;
    if (this.changesMadeinAuthorTab || self.changesMadeinAppcenterTab || self.changesMadeinUsersTab || self.isChangesDone()) {
      return new Promise((resolve, reject) => {
        self.pageChangeModalTemplateRef = this.commonService.modal(this.pageChangeModalTemplate);
        self.pageChangeModalTemplateRef.result.then(close => {
          resolve(close);
        }, dismiss => {
          resolve(false);
        });
      });
    }
    return true;
  }

  get canEditGroup() {
    const self = this;
    if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
      return true;
    } else {
      const list = self.commonService.getEntityPermissions('GROUP_' + self.group._id);
      if (list.length === 0 && self.hasPermission('PMGBU', 'GROUP')) {
        return true;
      } else if (list.length > 0 && list.find(e => e.id === 'PMGBU')) {
        return true;
      } else {
        return false;
      }
    }
  }

  get authorRolesCount() {
    const self = this;
    let temp = [];
    if (self.group.roles) {
      temp = self.group.roles.filter(e => e.type === 'author').filter(e => e.id !== 'PNDS' && e.id !== 'PVDS' && e.id !== 'PMDS');
    }
    return temp.length;
  }

  get showAuthorTab() {
    const self = this;
    if (self.hasPermissionStartsWith('PVGA') || self.hasPermissionStartsWith('PMGA')) {
      return true;
    }
    return false;
  }

  get showAppcenterTab() {
    const self = this;
    if (self.hasPermissionStartsWith('PVGC') || self.hasPermissionStartsWith('PMGC')) {
      return true;
    }
    return false;
  }

  get showMembersTab() {
    const self = this;
    if (self.hasPermissionStartsWith('PVGMU') || self.hasPermissionStartsWith('PMGMU')) {
      return true;
    }
    return false;
  }

  get showBotsTab() {
    const self = this;
    if (self.hasPermissionStartsWith('PVGMB') || self.hasPermissionStartsWith('PMGMB')) {
      return true;
    }
    return false;
  }

  get appcenterRolesCount() {
    const self = this;
    return self.group.roles ? self.group.roles.filter(e => e.type === 'appcenter').length : 0;
  }

  get usersCount() {
    const self = this;
    return self.allUsers ? self.allUsers.filter(e => !e.bot).length : 0;
  }

  get botsCount() {
    const self = this;
    return self.allUsers ? self.allUsers.filter(e => e.bot).length : 0;
  }

  get changesMadeinAuthorTab() {
    const self = this;
    const arrNew = self.group.roles ? self.group.roles.filter(e => e.type === 'author') : [];
    const arrOld = self.oldData.roles ? self.oldData.roles.filter(e => e.type === 'author') : [];
    return JSON.stringify(arrNew) !== JSON.stringify(arrOld);
  }

  get changesMadeinAppcenterTab() {
    const self = this;
    const arrNew = self.group.roles ? self.group.roles.filter(e => e.type === 'appcenter') : [];
    const arrOld = self.oldData.roles ? self.oldData.roles.filter(e => e.type === 'appcenter') : [];
    return JSON.stringify(arrNew) !== JSON.stringify(arrOld);
  }

  get changesMadeinUsersTab() {
    const self = this;
    return JSON.stringify(self.group.users) !== JSON.stringify(self.oldData.users);
  }

  get authType() {
    const self = this;
    if (self.commonService.userDetails && self.commonService.userDetails.auth) {
      return self.commonService.userDetails.auth.authType;
    }
    return null;
  }

  get editBasicDetails() {
    const self = this;
    if (self.commonService.hasPermission('PMGBU')) {
      return true;
    }
    return false;
  }
}
