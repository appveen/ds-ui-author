import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-group-author-library',
  templateUrl: './group-author-library.component.html',
  styleUrls: ['./group-author-library.component.scss']
})
export class GroupAuthorLibraryComponent implements OnInit, OnDestroy {

  @Input() roles: Array<any>;
  @Output() rolesChange: EventEmitter<Array<any>>;
  edit: any;

  constructor(private commonService: CommonService,
    private appService: AppService) {
    this.roles = [];
    this.rolesChange = new EventEmitter();
    this.edit = { status: true };
  }

  ngOnInit() {
    if (!this.roles) {
      this.roles = [];
    }
  }

  ngOnDestroy(): void {

  }

  getPermissionObject(type: string) {
    return {
      id: type,
      app: this.commonService.app._id,
      entity: 'GS',
      type: 'author'
    };
  }

  hasPermission(type: string) {
    return this.commonService.hasPermission(type);
  }

  set permissionType(val: any) {
    const blockedIndex = this.roles.findIndex(r => r.id === 'PNL' && r.entity === 'GS');
    if (blockedIndex > -1) {
      this.roles.splice(blockedIndex, 1);
    }
    const manageIndex = this.roles.findIndex(r => r.id === 'PML' && r.entity === 'GS');
    if (manageIndex > -1) {
      this.roles.splice(manageIndex, 1);
    }
    const viewIndex = this.roles.findIndex(r => r.id === 'PVL' && r.entity === 'GS');
    if (viewIndex > -1) {
      this.roles.splice(viewIndex, 1);
    }
    this.roles.push(this.getPermissionObject(val));
  }

  get permissionType() {
    if (this.roles.find(r => r.id === 'PML' && r.entity === 'GS')) {
      return 'manage';
    } else if (this.roles.find(r => r.id === 'PVL' && r.entity === 'GS')) {
      return 'view';
    } else {
      return 'blocked';
    }
  }

}
