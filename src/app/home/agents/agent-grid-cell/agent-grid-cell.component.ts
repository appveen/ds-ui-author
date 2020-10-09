import { Component, OnInit, EventEmitter } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, IAfterGuiAttachedParams } from 'ag-grid-community';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-agent-grid-cell',
  templateUrl: './agent-grid-cell.component.html',
  styleUrls: ['./agent-grid-cell.component.scss']
})
export class AgentGridCellComponent implements OnInit, ICellRendererAngularComp {


  params: ICellRendererParams;
  value: any;
  field: any;
  data: any;
  sendOption: EventEmitter<any>;
  constructor(private commonService: CommonService) {
    const self = this;
    self.sendOption = new EventEmitter();
  }

  ngOnInit(): void {
  }

  agInit(params: ICellRendererParams): void {
    const self = this;
    self.params = params;
    self.value = params.value;
    self.field = params.colDef.field;
    self.data = self.params.data;
    if ((self.field === 'heartbeat'
      || self.field === 'streak'
      || self.field === '_options'
      || self.field === 'password') && self.params.data) {
      self.value = self.params.data.agentID;
    }
    if (self.field === 'pendingFiles' && typeof self.value === 'object') {
      self.value = 0;
    }
  }

  refresh(params: any): boolean {
    const self = this;
    return true;
  }

  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
    const self = this;
  }

  hasPermission(roleId: string, entity?: string) {
    const self = this;
    return self.commonService.hasPermission(roleId, entity);
  }

  activateOption(type: string) {
    const self = this;
    self.sendOption.emit({
      agent: self.data,
      type
    });
  }

  hasViewPermission(id, role: string) {
    const self = this;
    if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
      return true;
    }

    const list = self.commonService.getEntityPermissions('AGENT_' + id);

    let inAllPermission: boolean;
    let inListPermission: boolean;

    inAllPermission = self.hasPermission(role, 'AGENT');

    inListPermission = Boolean(list.find(e => e.id === role));

    if (list.length === 0 && inAllPermission) {
      return true;
    }
    return list.length > 0 && inListPermission;
  }

  onRightClick() {
    return false;
  }

  updateStatus(evnt) {
    if (!evnt.reload) {
      const self = this;
      if (evnt.type === 'disable') {
        self.data.status = 'DISABLED';
      } else {
        self.data.status = 'STOPPED';
      }
    }
  }
  get dataAvailable() {
    const self = this;
    if (self.data && Object.keys(self.data).length > 0) {
      return true;
    }
    return false;
  }
}
