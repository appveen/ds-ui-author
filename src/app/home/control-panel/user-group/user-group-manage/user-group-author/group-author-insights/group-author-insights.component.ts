import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-group-author-insights',
  templateUrl: './group-author-insights.component.html',
  styleUrls: ['./group-author-insights.component.scss']
})
export class GroupAuthorInsightsComponent implements OnInit {
  @Input() roles: Array<any>;
  @Output() rolesChange: EventEmitter<Array<any>>;
  constructor(
    private commonService: CommonService
  ) {
    this.roles = [];
    this.rolesChange = new EventEmitter();
  }

  ngOnInit(): void {
  }


  hasPermission(type: string) {
    const self = this;
    return this.commonService.hasPermission(type);
  }

  getPermissionObject(id: string) {
    const self = this;
    if (id === null || id.length === 0) {
      return {};
    }
    return {
      id,
      app: self.commonService.app._id,
      entity: 'INS',
      type: 'author'
    };
  }

  get userTabPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PVISU');
    if (manageIndex > -1) {
      return 'view';
    }
    return 'blocked';

  }
  set userTabPermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNISU' && r.entity === ('INS'));
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }

    const viewIndex = self.roles.findIndex(r => r.id === 'PVISU' && r.entity === ('INS'));
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }

    if (Array.isArray(val)) {
      val.forEach(item => {
        self.roles.push(self.getPermissionObject(item));
      });
    } else {
      self.roles.push(self.getPermissionObject(val));
    }

  }


  get dataserviceTabPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PVISDS');
    if (manageIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }
  set dataserviceTabPermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNISDS' && r.entity === ('INS'));
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }

    const viewIndex = self.roles.findIndex(r => r.id === 'PVISDS' && r.entity === ('INS'));
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }

    if (Array.isArray(val)) {
      val.forEach(item => {
        self.roles.push(self.getPermissionObject(item));
      });
    } else {
      self.roles.push(self.getPermissionObject(val));
    }

  }

  get groupTabPermission() {
    const self = this;
    const manageIndex = self.roles.findIndex(r => r.id === 'PVISG');
    if (manageIndex > -1) {
      return 'view';
    }
    return 'blocked';
  }

  set groupTabPermission(val: any) {
    const self = this;
    const blockedIndex = self.roles.findIndex(r => r.id === 'PNISG' && r.entity === ('INS'));
    if (blockedIndex > -1) {
      self.roles.splice(blockedIndex, 1);
    }

    const viewIndex = self.roles.findIndex(r => r.id === 'PVISG' && r.entity === ('INS'));
    if (viewIndex > -1) {
      self.roles.splice(viewIndex, 1);
    }

    if (Array.isArray(val)) {
      val.forEach(item => {
        self.roles.push(self.getPermissionObject(item));
      });
    } else {
      self.roles.push(self.getPermissionObject(val));
    }

  }

}
