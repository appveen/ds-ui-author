import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-api-keys-manage',
  templateUrl: './api-keys-manage.component.html',
  styleUrls: ['./api-keys-manage.component.scss']
})
export class ApiKeysManageComponent implements OnInit {

  @Input() data: any;
  @Output() dataChange: EventEmitter<any>;
  showSettings: boolean;
  activeTab: number;
  showLazyLoader: boolean;
  constructor(private commonService: CommonService,
    private ts: ToastrService) {
    this.dataChange = new EventEmitter();
    this.activeTab = 0;
  }

  ngOnInit(): void {
    this.activeTab = 0;
  }

  hasPermission(type: string) {
    return this.commonService.hasPermission(type);
  }

  toggleStatus(flag: boolean) {
    let action = 'Disabled';
    if (flag) {
      action = 'Enabled';
    }
    this.commonService.put('user', `/${this.commonService.app._id}/apiKeys/${this.data._id}`, { status: action }).subscribe(res => {
      this.ts.success('Status Chanegd to ' + action);
      this.data = res;
    }, err => {
      this.commonService.errorToast(err);
    });
  }

  onDataChange(data: any) {
    console.log(data);
    this.commonService.put('user', `/${this.commonService.app._id}/apiKeys/${this.data._id}`, data).subscribe(res => {
      this.ts.success('API Key Modified');
    }, err => {
      this.commonService.errorToast(err);
    });
  }

  get days() {
    const startDate = moment(new Date(this.data._metadata.createdAt));
    const endDate = moment(new Date(this.data.expiryAfterDate));
    return endDate.diff(startDate, 'days');
  }

  get cleanUpDays() {
    const startDate = moment(new Date(this.data.expiryAfterDate));
    const endDate = moment(new Date());
    return endDate.diff(startDate, 'days') + 45;
  }

  get daysClass() {
    if (this.days > 90) {
      return 'text-white bg-success';
    } else if (this.days > 60) {
      return 'text-white bg-accent';
    } else if (this.days > 30) {
      return 'text-dark bg-warning';
    } else {
      return 'text-white bg-danger';
    }
  }

  get isDisabled() {
    return this.data.status == 'Disabled';
  }

  // toggleStatus(action: string) {
  //   this.commonService.put('user', `/${this.commonService.app._id}/apiKeys/utils/status/${action}`, {}).subscribe(res => {
  //     this.ts.success('Status Chanegd to ' + action);
  //   }, err => {
  //     this.commonService.errorToast(err);
  //   });
  // }
}
