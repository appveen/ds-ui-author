import { Component, OnInit, Input } from '@angular/core';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'odp-user-group-appcenter-flows',
  templateUrl: './user-group-appcenter-flows.component.html',
  styleUrls: ['./user-group-appcenter-flows.component.scss']
})
export class UserGroupAppcenterFlowsComponent implements OnInit {

  @Input() roles: Array<any>;
  @Input() type: string;
  // serviceList: Array<any>;
  toggleAccordion: any;
  subscriptions: any;
  aggregatePermission: any;
  activeSubTab: number;
  partnerList: Array<any> = [];
  showLazyLoader: boolean;
  flowList: Array<any>;
  selectedFlow: any;
  prefix: string;


  constructor(private commonService: CommonService,
    private appService: AppService) {
    const self = this;
    // self.serviceList = [];
    self.toggleAccordion = {};
    self.aggregatePermission = {};
    self.subscriptions = {};
    self.roles = [];
    self.activeSubTab = 0;
    self.flowList = [];
  }

  ngOnInit() {
    const self = this;
    self.prefix = self.type === 'FLOW' ? 'FLOW_' : 'INTR_';
    self.getFlows();

  }



  hasPermission(type: string) {
    const self = this;
    return self.commonService.hasPermission(type);
  }

  // code for flows

  getFlows() {
    this.showLazyLoader = true;
    this.flowList = [];
    return this.commonService.get('partnerManager', `/${this.commonService.app._id}/flow/utils/count`).pipe(switchMap((count: any) => {
      return this.commonService.get('partnerManager', `/${this.commonService.app._id}/flow`, {
        count: count,
        sort: "-_metadata.lastUpdated",
        ...(this.type === 'FLOW' ? {
          filter: {
            'inputNode.type': {
              $not: {
                $eq: 'TIMER'
              }
            }
          }
        } : {})
      });
    })).subscribe((res: any) => {
      this.showLazyLoader = false;
      this.flowList = res;
      if (res.length > 0) {
        this.selectedFlow = res[0];
      }
    }, err => {
      this.showLazyLoader = false;
      console.log(err);
      this.commonService.errorToast(err);
    });
  }

  selectFlow(flow) {
    this.selectedFlow = flow;
  }

  checktrigger() {
    return this.roles.filter(r => r.id == this.prefix + this.selectedFlow._id).length === 1;
  }

  toggleTrigger(val) {
    const self = this;
    if (val) {
      self.roles.push({
        id: this.prefix + self.selectedFlow._id,
        entity: self.selectedFlow._id,
        app: self.commonService.app._id,
        type: 'appcenter'
      });
    } else {
      const index = self.roles.findIndex(r => r.id === this.prefix + self.selectedFlow._id && r.entity === self.selectedFlow._id);
      if (index != -1) {
        self.roles.splice(index, 1);
      }
    }
  }

}

