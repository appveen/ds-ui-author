import { Component, OnInit, ViewChild, Input, EventEmitter, OnDestroy, TemplateRef, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModalRef, NgbButtonLabel } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';

export interface Definition {
  key?: string;
  properties?: any;
  type?: string;
  definition?: Definition[];
}
@Component({
  selector: 'odp-manage-permissions',
  templateUrl: './manage-permissions.component.html',
  styleUrls: ['./manage-permissions.component.scss'],
  providers: [NgbButtonLabel]
})
export class ManagePermissionsComponent implements OnInit, OnDestroy {

  @ViewChild('deleteModal', { static: false }) deleteModal: TemplateRef<HTMLElement>;
  @Input() definitions: any;
  @Input() role: any;
  @Input() firstInit: boolean;
  @Input() edit: any;
  @Input() name: string;
  @Input() blockInvalidRole: any;
  @Input() schemaFree: boolean;
  @Output() roleChange: EventEmitter<any>;
  @Output() firstInitChange: EventEmitter<any>;
  @Output() blockInvalidRoleChange = new EventEmitter();
  @Output() oldRoleReset = new EventEmitter();
  deleteModalRef: NgbModalRef;
  sourceDefinition: Definition[];
  id: string;
  delete: any;
  roles: Array<RoleModel>;
  selectedRole: RoleModel;
  selectedRoleIndex: number;
  selectedFieldsCopy: any;
  oldData: any;
  searchRole: string;
  fields: any;
  definition: any;
  collapse: any;
  serviceName: any;
  canCreateFlag: boolean;
  editcheckFlag: boolean;
  deletecheckFlag: boolean;
  canReviewFlag: boolean;
  activeTab: number;
  toggleDropdown: any;
  blockFocus: any;

  selectedMode: string;

  constructor(private commonService: CommonService,
    private appService: AppService,
    private fb: FormBuilder) {
    const self = this;
    self.roles = [];
    self.selectedRole = {};
    self.selectedFieldsCopy = {};
    self.collapse = {};
    self.activeTab = 1;
    self.toggleDropdown = {};
    self.roleChange = new EventEmitter();
    self.firstInitChange = new EventEmitter();
    self.blockFocus = {};
    this.selectedMode = 'Basic';
  }

  ngOnInit() {
    const self = this;
    self.sourceDefinition = self.appService.patchDataKey(self.fb.array(self.definitions).value);
    self.definition = self.sourceDefinition;
    if (!self.role || Object.keys(self.role).length === 0 || !self.role.roles) {
      self.role = self.role || {};
      self.role.roles = self.appService.getDefaultRoles();
      if (self.definition) {
        self.role.fields = self.appService.getDefaultFields(self.role.roles.map(e => e.id), self.definition, {});
      } else {
        self.role.fields = self.appService.getDefaultFields(self.role.roles.map(e => e.id), [
          {
            _id: {
              type: 'String'
            }
          }
        ], {});
      }
      self.roleChange.emit(self.role);
      if (!this.firstInit) {
        setTimeout(() => {
          this.oldRoleReset.emit(self.role);
        }, 1000);
      }
    } else {
      self.id = self.role._id;
      if (!self.role.roles) {
        self.role.roles = [];
      }
      if (!self.role.fields) {
        self.role.fields = [];
      }
    }
    self.initRoles();
  }

  ngOnDestroy(): void {
    const self = this;
    if (self.deleteModalRef) {
      self.deleteModalRef.close();
    }
  }

  initRoles() {
    const self = this;
    if (typeof self.role.fields === 'string') {
      self.role.fields = JSON.parse(self.role.fields);
    }
    self.roles = self.role.roles;
    self.roles.forEach(e => {
      if (!e.operations.find(o => o.method === 'GET')) {
        e.operations.push({ method: 'GET' });
      }
    });
    self.selectedRole = self.roles[0];
    self.selectedRoleIndex = 0;
    self.oldData = self.appService.cloneObject(self.role);
    self.fields = self.flattenPermission(self.role.fields);
    self.selectedFieldsCopy = self.appService.cloneObject(self.fields);

    self.onSelectRole(self.roles[0], 0);
    const manageRole = self.roles.find(e => e.manageRole);
    const viewRole = self.roles.find(e => e.viewRole);
    const skipReviewRole = self.roles.find(e => e.skipReviewRole);
    if (manageRole) {
      manageRole.name = 'Manage ' + self.name;
    }
    if (viewRole) {
      viewRole.name = 'View ' + self.name;
    }
    if (skipReviewRole) {
      skipReviewRole.name = 'Skip Review ' + self.name;
    }
    self.serviceName = self.name;
    if (this.firstInit) {
      this.oldRoleReset.emit(self.role);
      this.firstInit = false;
      this.firstInitChange.emit(false);
    }
  }

  countFields() {
    const self = this;
    if (self.fields) {
      return Object.keys(self.fields).filter(e => {
        if (!(e === '_metadata' || e === '__v')) {
          return e;
        }
      }).length;
    } else {
      return 0;
    }
  }

  addPermission() {
    const self = this;
    self.checkPermissionChange();
    const tempId = 'P' + self.appService.rand(10);
    const tempRole = {
      id: tempId,
      name: null,
      operations: [{
        method: 'GET'
      }]
    };
    self.roles.push(tempRole);
    self.selectedRole = tempRole;
    self.selectedRoleIndex = self.roles.length - 1;
    Object.keys(self.fields).forEach(key => {
      self.fields[key]._p[tempId] = 'R';
    });
    self.updateRole();
  }

  flattenPermission(fields, parent?) {
    const self = this;
    if (typeof fields === 'string') {
      fields = JSON.parse(fields);
    }
    let temp = {};
    Object.keys(fields).forEach(key => {
      const fieldKey = parent ? parent + '.' + key : key;
      if (fields[key]._p) {
        temp[fieldKey] = fields[key];
        if (parent) {
          temp[fieldKey].parent = parent;
        }
      } else {

        temp[fieldKey] = { _t: "object", parent: parent ? parent : null }

        temp = Object.assign(temp, self.flattenPermission(fields[key], fieldKey));
      }
    });
    return temp;
  }

  deletePermission() {
    const self = this;
    self.checkPermissionChange();
    if (self.roles.length === 1) {
      return;
    }
    self.delete = {
      title: 'Delete ' + self.roles.find(e => e.id === self.selectedRole.id).name,
      label: 'Are you sure you want to delete this role?'
    };
    self.deleteModalRef = self.commonService.modal(self.deleteModal);
    self.deleteModalRef.result.then(close => {
      if (close) {
        const index = self.roles.findIndex(e => e.id === self.selectedRole.id);
        self.roles.splice(index, 1);
        Object.keys(self.fields).forEach(key => {
          delete self.fields[key]._p[self.selectedRole.id];
        });
        self.selectedRole = self.roles[0];
        self.selectedRoleIndex = 0;
      }
    }, dismiss => { });
  }

  checkPermissionChange() {
    const self = this;
    if (self.edit.id) {
      self.appService.detectPermissionChange.emit(true);
    }
  }

  onSelectRole(role, index) {
    const self = this;
    self.selectedRole = role;
    self.selectedRoleIndex = index;
    self.selectedRole.operations.forEach(item => {
      if (item.method === 'POST') {
        self.canCreateFlag = true;
      } else if (item.method === 'PUT') {
        self.editcheckFlag = true;
      } else if (item.method === 'DELETE') {
        self.deletecheckFlag = true;
      } else if (item.method === 'REVIEW') {
        self.canReviewFlag = true;
      }
    });
  }

  canManage(index: number) {
    const self = this;
    if (index > -1) {
      const tempRole = self.roles[index];
      let flag = false;
      if (tempRole.operations.find(x => x.method === 'POST')) {
        flag = true;
      }
      if (tempRole.operations.find(x => x.method === 'PUT')) {
        flag = true;
      }
      if (tempRole.operations.find(x => x.method === 'DELETE')) {
        flag = true;
      }
      if (tempRole.operations.find(x => x.method === 'REVIEW')) {
        flag = true;
      }
      return flag;
    } else {
      return;
    }
  }

  permissionEnabled(index: number, type: string): boolean {
    const self = this;
    const temp = self.roles[index];
    if (temp) {
      return Boolean(temp.operations.find(x => x.method === type));
    } else {
      return false;
    }
  }

  hasPermission(type: string) {
    const self = this;
    return self.commonService.hasPermission(type);
  }

  getViewAttributes(id: string) {
    const self = this;
    return Object.keys(self.fields).filter(e => {
      if (!(e === '_metadata'
        || e === '__v') && self.fields[e]._p && self.fields[e]._p[id] === 'R') {
        return e;
      }
    }).length;
  }

  changeValue(key, val) {
    const self = this;

    // select all / deselect all fields inside group when group is selected 
    const grpFields = Object.keys(self.fields).map(key => { self.fields[key].name = key; return self.fields[key] }).filter(data => data?.parent == key).map(data => data.name)
    grpFields.forEach(field => self.changeValue(field, val))

    if (val && self.fields[key]._p) {
      self.fields[key]._p[self.selectedRole.id] = 'R';
    } else if (!val && self.fields[key]._p) {
      self.fields[key]._p[self.selectedRole.id] = 'N';
    }

    self.updateRole();
  }

  changeSelectedMode(mode: string) {
    this.selectedMode = mode;
    this.rule[0].type = mode;
  }

  addRule(type: string) {
    this.selectedRole.rule.push({
      type,
      dataService: this.id,
    });
    this.updateRole();
  }

  removeRule(index: number) {
    const self = this;
    self.selectedRole.rule.splice(index, 1);
    self.toggleDropdown['BLOCK'] = false;
  }

  updateRole() {
    const self = this;
    const manageRole = self.roles.find(e => e.manageRole);
    const viewRole = self.roles.find(e => e.viewRole);
    const skipReviewRole = self.roles.find(e => e.skipReviewRole);
    if (manageRole) {
      manageRole.name = 'Manage ' + self.serviceName;
    }
    if (viewRole) {
      viewRole.name = 'View ' + self.serviceName;
    }
    if (skipReviewRole) {
      skipReviewRole.name = 'Skip Review ' + self.serviceName;
    }
    self.role.fields = self.appService.unFlattenObject(self.fields);
    self.role.roles = self.roles;
    self.roleChange.emit(self.role);
  }

  get canCreate() {
    const self = this;
    if (self.selectedRole && self.selectedRole.operations) {
      return Boolean(self.selectedRole.operations.find(x => x.method === 'POST'));
    }
    return false;
  }

  set canCreate(val) {
    const self = this;
    if (!self.edit.status) {
      return;
    }
    if (val) {
      self.selectedRole.operations.push({
        method: 'POST'
      });
    } else {
      const index = self.selectedRole.operations.findIndex(x => x.method === 'POST');
      if (index > -1) {
        self.selectedRole.operations.splice(index, 1);
      }
    }
    self.updateRole();
  }

  get canEdit() {
    const self = this;
    if (self.selectedRole && self.selectedRole.operations) {
      return Boolean(self.selectedRole.operations.find(x => x.method === 'PUT'));
    }
    return false;
  }

  set canEdit(val) {
    const self = this;
    if (!self.edit.status) {
      return;
    }
    if (val) {
      self.selectedRole.operations.push({
        method: 'PUT'
      });
    } else {
      const index = self.selectedRole.operations.findIndex(x => x.method === 'PUT');
      if (index > -1) {
        self.selectedRole.operations.splice(index, 1);
      }
    }
    self.updateRole();
  }

  get canDelete() {
    const self = this;
    if (self.selectedRole && self.selectedRole.operations) {
      return Boolean(self.selectedRole.operations.find(x => x.method === 'DELETE'));
    }
    return false;
  }

  set canDelete(val) {
    const self = this;
    if (!self.edit.status) {
      return;
    }
    if (val) {
      self.selectedRole.operations.push({
        method: 'DELETE'
      });
    } else {
      const index = self.selectedRole.operations.findIndex(x => x.method === 'DELETE');
      if (index > -1) {
        self.selectedRole.operations.splice(index, 1);
      }
    }
    self.updateRole();
  }

  get canApprove() {
    const self = this;
    if (self.selectedRole && self.selectedRole.operations) {
      return Boolean(self.selectedRole.operations.find(x => x.method === 'REVIEW'));
    }
    return false;
  }

  set canApprove(val) {
    const self = this;
    if (!self.edit.status) {
      return;
    }
    if (val) {
      self.selectedRole.operations.push({
        method: 'REVIEW'
      });
    } else {
      const index = self.selectedRole.operations.findIndex(x => x.method === 'REVIEW');
      if (index > -1) {
        self.selectedRole.operations.splice(index, 1);
      }
    }
    self.updateRole();
  }

  get hasConditions() {
    const self = this;
    if (self.selectedRole && self.selectedRole.rule && self.selectedRole.rule.length > 0) {
      return true;
    }
    return false;
  }

  set hasConditions(val) {
    const self = this;
    if (!self.edit.status) {
      return;
    }
    if (val) {
      if (!self.selectedRole.rule) {
        self.selectedRole.rule = [];
      }
      self.selectedRole.rule.push({
        type: 'Filter',
        dataService: self.id,
      });
    } else {
      self.blockInvalidRole = {};
      self.blockInvalidRoleChange.emit(self.blockInvalidRole);
      self.selectedRole.rule = [];
    }
    self.updateRole();
  }

  get skipReviewRole() {
    const self = this;
    if (self.selectedRole && self.selectedRole.operations) {
      return self.selectedRole.operations.find(o => o.method === 'SKIP_REVIEW');
    }
    return false;
  }

  get changesDone() {
    const self = this;
    return JSON.stringify(self.oldData) !== JSON.stringify(self.role);
  }

  get ruleBlocksValid() {
    const self = this;
    let isValid = true;
    let count = 0;
    if (Object.keys(self.blockInvalidRole).length > 0) {
      Object.keys(self.blockInvalidRole).forEach(key => {
        if (self.blockInvalidRole[key]) {
          count++;
        }
      });
      if (count > 0) {
        isValid = false;
      } else {
        isValid = true;
      }
    }
    return isValid;
  }

  get updatedRoles() {
    const self = this;
    self.role.fields = self.appService.unFlattenObject(self.fields);
    const manageRole = self.role.roles.find(e => e.manageRole);
    const viewRole = self.role.roles.find(e => e.viewRole);
    const skipReviewRole = self.role.roles.find(e => e.skipReviewRole);
    if (manageRole) {
      manageRole.name = 'Manage ' + self.serviceName;
    }
    if (viewRole) {
      viewRole.name = 'View ' + self.serviceName;
    }
    if (skipReviewRole) {
      skipReviewRole.name = 'Skip Review ' + self.serviceName;
    }
    self.roleChange.emit(self.role);
    return self.role;
  }

  get selectRoleType() {
    const self = this;
    if (self.canManage(self.selectedRoleIndex)) {
      return 'manage';
    }
    return 'view';
  }

  set selectRoleType(val) {
    const self = this;
    if (val === 'manage') {
      self.canCreate = true;
      self.canEdit = true;
      self.canDelete = true;
    } else {
      self.canCreate = false;
      self.canEdit = false;
      self.canDelete = false;
      self.canApprove = false;
    }
    self.updateRole();
  }

  get rule() {
    const self = this;
    return self.selectedRole.rule || [];
  }

  set rule(val) {
    const self = this;
    self.selectedRole.rule = val;
  }

  getSpacing(level) {
    let width = level * 7;
    if (level > 1) {
      width += (level - 1) * 16;
    }
    if (width > 0) {
      return {
        'min-width': width + 'px',
        'min-height': '36px',
        'margin-right': '16px'
      };
    } else {
      return {};
    }
  }

  idField(def) {
    if (def.key === '_id') {
      return true;
    }
    return false;
  }

  isChecked(key) {
    const self = this;

    // get all group fields
    const grpFields = Object.keys(self.fields).map(key => { self.fields[key].name = key; return self.fields[key] }).filter(data => data?.parent == key).map(data => data.name)

    // select group if all attributes in group are enabled 
    if (grpFields.length > 0) {
      let objChecked = true;

      grpFields.forEach(grpField => {

        // nested group condition 
        if (self.fields && self.fields[grpField]._t == "object"
          && self.isChecked(grpField) == false) {
          objChecked = false;
        }
        else if (self.fields
          && self.fields[grpField]
          && self.fields[grpField]._p
          && self.selectedRole.id
          && self.fields[grpField]._p[self.selectedRole.id] === 'N') {
          objChecked = false;
        }

      });
      return objChecked
    }

    else if (self.fields
      && self.fields[key]
      && self.fields[key]._p
      && self.selectedRole.id
      && self.fields[key]._p[self.selectedRole.id] === 'R') {

      return true;
    }
    return false;
  }

  markAsTouched(role) {
    if (role.manageRole) {
      role.manageRole = false;
    }
    if (role.viewRole) {
      role.viewRole = false;
    }
  }

  onInvalidRole(data, key) {
    const self = this;
    self.blockInvalidRole[key] = data;
    self.blockInvalidRoleChange.emit(self.blockInvalidRole);
  }
}

export interface RoleModel {
  id?: string;
  name?: string;
  description?: string;
  operations?: Array<{
    method?: string;
  }>;
  manageRole?: boolean;
  viewRole?: boolean;
  skipReviewRole?: boolean;
  rule?: Array<Rule>;
}

export interface Rule {
  type?: string;
  dataService?: string;
  conditions?: any;
}
