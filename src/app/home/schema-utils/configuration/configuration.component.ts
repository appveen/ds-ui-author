import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { UntypedFormGroup, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { VersionConfig } from 'src/app/utils/interfaces/schemaBuilder';

@Component({
  selector: 'odp-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {

  @Input() form: UntypedFormGroup;
  @Input() edit: any;
  @Input() versionConfig: VersionConfig;
  activeTab: number;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private ts: ToastrService) {
    this.activeTab = 1;
  }

  ngOnInit() {
  }

  hasPermission(type: string, entity?: string) {
    return this.commonService.hasPermission(type, entity);
  }

  hasPermissionStartsWith(type: string, entity?: string) {
    return this.commonService.hasPermissionStartsWith(type, entity);
  }

  canEdit(type: string) {
    if (this.hasPermission('PMDS' + type, 'SM')) {
      return true;
    }
    return false;
  }

  canView(type: string) {
    if (this.hasPermission('PMDS' + type, 'SM')
      || this.hasPermission('PVDS' + type, 'SM')) {
      return true;
    }
    return false;
  }

  isAdmin() {

    if (!this.commonService.userDetails.isSuperAdmin
      && this.commonService.isAppAdmin) {
      return true;
    } else
      return false
  }

  get id() {
    return this.edit._id;
  }
}
