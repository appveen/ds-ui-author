import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../utils/services/common.service';
import { AppService } from '../utils/services/app.service';

@Component({
  selector: 'odp-auth-mode',
  templateUrl: './auth-mode.component.html',
  styleUrls: ['./auth-mode.component.scss']
})
export class AuthModeComponent implements OnInit, OnDestroy {

  @ViewChild('searchDomainInput', { static: false }) searchDomainInput: ElementRef;
  username: string;
  loadingDomains: boolean;
  showProfileOptions: boolean;
  subscriptions: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public commonService: CommonService,
    private appService: AppService) {
    const self = this;
    self.subscriptions = {};
  }
  ngOnInit() {
    const self = this;
    self.commonService.apiCalls.componentLoading = false;
    if (!self.commonService.userDetails) {
      self.router.navigate(['/']);
      return;
    }
    self.username = self.commonService.userDetails.username;
    if (self.commonService.userDetails.basicDetails && self.commonService.userDetails.basicDetails.name) {
      self.username = self.commonService.userDetails.basicDetails.name;
    }
  }

  logout() {
    const self = this;
    self.commonService.logout();
  }

  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach(e => {
      self.subscriptions[e].unsubscribe();
    });
  }

  get isSuperAdmin() {
    const self = this;
    return self.commonService.userDetails.isSuperAdmin;
  }
}
