import { Component, OnInit, Input } from '@angular/core';
import { GetOptions, CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-user-group-appcenter-bokmark',
  templateUrl: './user-group-appcenter-bokmark.component.html',
  styleUrls: ['./user-group-appcenter-bokmark.component.scss']
})
export class UserGroupAppcenterBokmarkComponent implements OnInit {
  @Input() roles: Array<any>;
  subscriptions: any = {};
  showLazyLoader: boolean;
  bookmarkList: Array<any> = [];
  bookmarkConfig: GetOptions = {};


  constructor(
    private commonService: CommonService,
  ) {
    const self = this;
    self.bookmarkConfig = {};
    self.bookmarkConfig.count = -1;
    self.bookmarkConfig.filter = {};
    self.roles = [];
  }

  ngOnInit() {
    const self = this;
    self.getBookmarkList();
  }
  getBookmarkList() {
    const self = this;
    self.bookmarkConfig.select = 'name';
    self.showLazyLoader = true;
    const path = '/app/' + self.commonService.app._id + '/bookmark';
    self.subscriptions['getBookmarkList'] = self.commonService.get('user', path, self.bookmarkConfig)
      .subscribe((res) => {
        self.showLazyLoader = false;
        if (res.length > 0) {
          self.bookmarkList = res;
        }
      }, (err) => {
        self.commonService.errorToast(err);
      });
  }
  changeValue(_bokmarkId) {
    const self = this;
    const data = {
      app: self.commonService.app._id,
      entity: 'BM_' + _bokmarkId,
      id: 'PVBM',
      type: 'appcenter'
    };
    const tempIndex = self.roles.findIndex(d => d.entity === 'BM_' + _bokmarkId);
    if (tempIndex > -1) {
      self.roles.splice(tempIndex, 1);
    } else {
      self.roles.push(data);
    }
  }

  isChecked(_bokmarkId) {
    const self = this;
    let retValue = false;
    const tempIndex = self.roles.findIndex(d => d.entity === 'BM_' + _bokmarkId);
    if (tempIndex > -1) {
      retValue = true;
    }
    return retValue;
  }
  hasPermission(type: string) {
    const self = this;
    return self.commonService.hasPermission(type);
  }
  markAllSelected() {
    const self = this;
    self.bookmarkList.forEach(element => {
      const data = {
        app: self.commonService.app._id,
        entity: 'BM_' + element._id,
        id: 'PVBM',
        type: 'appcenter'
      };
      const tempIndex = self.roles.findIndex(d => d.entity === 'BM_' + element._id);
      if (tempIndex === -1) {
        self.roles.push(data);
      }
    });
  }

  markAllDeSelected() {
    const self = this;
    self.bookmarkList.forEach(element => {
      const tempIndex = self.roles.findIndex(d => d.entity === 'BM_' + element._id);
      if (tempIndex > -1) {
        self.roles.splice(tempIndex, 1);
      }
    });
  }
}
