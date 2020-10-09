import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { CommonService } from 'src/app/utils/services/common.service';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { AppService } from '../services/app.service';

@Component({
  selector: 'odp-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit, OnDestroy {

  @Input() paths: Array<Breadcrumb>;
  breadcrumbList: Array<Breadcrumb>;
  currentApp: string;
  appNameSubscription: Subscription;
  constructor(private commonService: CommonService,
    private appService: AppService) {
    const self = this;
    self.breadcrumbList = [];
  }

  ngOnInit() {
    const self = this;
    self.currentApp = self.commonService.app._id;
    self.appNameSubscription = self.commonService.currentAppUpdated.subscribe((appId) => {
      self.currentApp = appId;
    });
   
  }

  openAppSwitcher(event: Event) {
    const self = this;
    event.preventDefault();
    self.appService.openAppSwitcher.emit();
  }

  insertBefore(seg: string, next: string) {
    const self = this;
    if (seg === 'sb') {
      self.breadcrumbList.push({
        label: self.getLabel('sm', null),
        url: self.getUrl('sm', null),
        active: false
      });
    } else if (seg === 'po') {
      self.breadcrumbList.push({
        label: self.getLabel('pm', null),
        url: self.getUrl('pm', null),
        active: false
      });
    } else if (seg === 'gs') {
      self.breadcrumbList.push({
        label: self.getLabel('lib', null),
        url: self.getUrl('lib', null),
        active: false
      });
    } else if (seg === 'dfm') {
      self.breadcrumbList.push({
        label: self.getLabel('dfl', null),
        url: self.getUrl('dfl', null),
        active: false
      });
    } else if (seg === 'nsm') {
      self.breadcrumbList.push({
        label: self.getLabel('nsl', null),
        url: self.getUrl('nsl', null),
        active: false
      });
    } else if (seg === 'manage') {
      self.breadcrumbList.push({
        label: self.getLabel('user-group', null),
        url: self.getUrl('group', null),
        active: false
      });
    }
  }

  getLabel(seg: string, next: any) {
    const self = this;
    if (seg === 'sb') {
      return (next ? 'Edit' : 'New ') + ' Data Service';
    } else if (seg === 'gs') {
      return (next ? 'Edit' : 'New ') + ' Library';
    } else if (seg === 'po') {
      return (next ? 'Edit' : 'New ') + ' Partner';
    } else if (seg === 'nsm') {
      return (next ? 'Edit' : 'New ') + ' Nano Service';
    } else if (seg === 'dfm') {
      return (next ? 'Edit' : 'New ') + ' Data Format';
    } else if (seg === 'manage') {
      return (next ? 'Edit' : 'New ') + ' Group';
    } else if (seg === 'sm') {
      return 'Data Services';
    } else if (seg === 'lib') {
      return 'Libraires';
    } else if (seg === 'pm') {
      return 'Partners';
    } else if (seg === 'dfl') {
      return 'Data Formats';
    } else if (seg === 'nsl') {
      return 'Nano Services';
    } else if (seg === 'group') {
      return 'Groups';
    } else {
      return seg;
    }
  }
  getUrl(seg: string, next: string) {
    const self = this;
    if (seg === 'sb') {
      return `/app/${self.commonService.app._id}/sb`;
    } else if (seg === 'gs') {
      return `/app/${self.commonService.app._id}/gs`;
    } else if (seg === 'po') {
      return `/app/${self.commonService.app._id}/po`;
    } else if (seg === 'sm') {
      return `/app/${self.commonService.app._id}/sm`;
    } else if (seg === 'lib') {
      return `/app/${self.commonService.app._id}/lib`;
    } else if (seg === 'pm') {
      return `/app/${self.commonService.app._id}/pm`;
    } else if (seg === 'nsl') {
      return `/app/${self.commonService.app._id}/nsl`;
    } else if (seg === 'nsm') {
      return `/app/${self.commonService.app._id}/nsm`;
    } else if (seg === 'dfl') {
      return `/app/${self.commonService.app._id}/dfl`;
    } else if (seg === 'dfm') {
      return `/app/${self.commonService.app._id}/dfm`;
    } else if (seg === 'group') {
      return `/app/${self.commonService.app._id}/cp/group`;
    } else if (seg === 'manage') {
      return `/app/${self.commonService.app._id}/cp/manage`;
    } else {
      return null;
    }
  }

  ngOnDestroy() {
    const self = this;
    if (self.appNameSubscription) {
      self.appNameSubscription.unsubscribe();
    }
  }
}

