import { Component, OnInit, Input } from '@angular/core';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-user-group-appcenter-flows',
  templateUrl: './user-group-appcenter-flows.component.html',
  styleUrls: ['./user-group-appcenter-flows.component.scss']
})
export class UserGroupAppcenterFlowsComponent implements OnInit {

  @Input() roles: Array<any>;
  serviceList: Array<any>;
  toggleAccordion: any;
  subscriptions: any;
  aggregatePermission: any;
  activeSubTab: number;
  partnerList: Array<any> = [];
  showLazyLoader: boolean;
  flowList: Array<any>;


  constructor(private commonService: CommonService,
    private appService: AppService) {
    const self = this;
    self.serviceList = [];
    self.toggleAccordion = {};
    self.aggregatePermission = {};
    self.subscriptions = {};
    self.roles = [];
    self.activeSubTab = 0;
    self.flowList = [];
  }

  ngOnInit() {
    const self = this;
    self.getPartnersList();

  }

  roleActive(role: any) {
    const self = this;
    if (self.roles.find(r => r.id === 'PVI' && r.entity === 'INTR_' + role)) {
      return true;
    }
    return false;
  }
  toggleRole(role: any) {
    const self = this;
    const target: HTMLInputElement = <HTMLInputElement>event.target;

    if (target.checked) {
      self.roles.push({
        id: 'PVI',
        entity: 'INTR_' + role,
        app: self.commonService.app._id,
        type: 'appcenter'
      });
    } else {
      const index = self.roles.findIndex(r => r.id === 'PVI' && r.entity === 'INTR_' + role);
      self.roles.splice(index, 1);
    }

  }
  collapseAccordion() {
    const self = this;
    Object.keys(self.toggleAccordion).forEach(key => {
      self.toggleAccordion[key] = false;
    });
  }

  hasPermission(type: string) {
    const self = this;
    return self.commonService.hasPermission(type);
  }

  // code for flows

  getPartnersList() {
    const self = this;
    if (self.subscriptions['getPartners']) {
      self.subscriptions['getPartners'].unsubscribe();
    }
    const options: GetOptions = {
      count: -1,
      app: self.commonService.app._id
    };
    self.showLazyLoader = true;
    self.subscriptions['getPartners'] = self.commonService.get('partnerManager', `/${this.commonService.app._id}/partner`, options)
      .subscribe(res => {
        self.showLazyLoader = false;
        if (res.length > 0) {
          res.forEach(_service => {
            self.partnerList.push(_service);
            self.flowList = self.flowList.concat(_service['flows']);
          });
          self.getFlowDetails();
        }
      }, err => {
        self.showLazyLoader = false;
        self.commonService.errorToast(err, 'We are unable to fetch partners, please try again later');
      });
  }

  getFlowDetails() {
    const self = this;
    if (self.subscriptions['getFlows']) {
      self.subscriptions['getFlows'].unsubscribe();
    }
    const options: GetOptions = {
      count: -1,
      filter: {
        _id: { '$in': self.flowList }
      },
      select: 'name'
    };
    self.showLazyLoader = true;
    self.subscriptions['getFlows'] = self.commonService.get('partnerManager', `/${this.commonService.app._id}/flow`, options)
      .subscribe(res => {
        self.showLazyLoader = false;
        self.flowList = res;
      }, err => {
        self.showLazyLoader = false;
        self.commonService.errorToast(err, 'We are unable to fetch Flows, please try again later');
      });
  }

  getFlowName(flowId) {
    const self = this;
    const tempFlow = self.flowList.find(d => d._id === flowId);
    if (tempFlow && tempFlow.name) {
      return tempFlow.name;
    }

  }
  getAccess(partner) {
    const self = this;
    let retVal = 0;
    partner.flows.forEach(element => {
      const index = self.roles.findIndex(r => r.id === 'PVI' && r.entity === 'INTR_' + element);
      if (index > -1) {
        retVal++;
      }
    });
    return retVal;

  }

}

