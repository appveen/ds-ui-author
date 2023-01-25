import { Component, Input, OnInit } from '@angular/core';
import { APIConfig } from 'src/app/utils/interfaces/apiConfig';
import { CommonService } from 'src/app/utils/services/common.service';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'odp-agent-sessions',
  templateUrl: './agent-sessions.component.html',
  styleUrls: ['./agent-sessions.component.scss']
})
export class AgentSessionsComponent implements OnInit {

  @Input() agentDetails: any;
  apiConfig: APIConfig;
  showLazyLoader: boolean;
  agentSessions: Array<any>;
  sortModel: any;
  filterModel: any;
  constructor(private commonService: CommonService,
    private ts: ToastrService) {
    this.apiConfig = {
      page: 1,
      count: 30,
      filter: {},
      sort: '-timestamp'
    };
    this.agentSessions = [];
    this.sortModel = {};
    this.filterModel = {};
  }

  ngOnInit(): void {
    this.getSessions();
  }

  getSessions() {
    this.showLazyLoader = true;
    this.commonService.get('partnerManager', `/${this.commonService.app._id}/agent/utils/${this.agentDetails.agentId}/sessions`, this.apiConfig).subscribe(res => {
      res.forEach((item: any) => {
        this.agentSessions.push(item);
      });
      this.showLazyLoader = false;
    });
  }

  loadMore(event: any) {
    if (event.target.scrollTop + event.target.offsetHeight === event.target.scrollHeight + 2) {
      this.apiConfig.page++;
      this.getSessions();
    }
  }

  filterLevel(value: string) {
    if (value !== 'ALL') {
      this.apiConfig.filter = { logLevel: value };
    } else {
      this.apiConfig.filter = {};
    }
    this.apiConfig.page = 1;
    this.agentSessions = [];
    this.getSessions();
  }

  clearFilter() {
    this.apiConfig.filter = {
      agentId: this.agentDetails._id,
      app: this.commonService.app._id
    };
    this.apiConfig.page = 1;
    this.agentSessions = [];
    this.getSessions();
  }

  applySort(field: string) {
    if (!this.sortModel[field]) {
      this.sortModel = {};
      this.sortModel[field] = 1;
    } else if (this.sortModel[field] == 1) {
      this.sortModel[field] = -1;
    } else {
      delete this.sortModel[field];
    }
  }

  convertDate(dateString: string) {
    const date = new Date(dateString);
    return moment(date).format('DD MMM YYYY, hh:mm:ss A')
  }

  changeState(event: any, sessionId: string, action: string) {
    this.showLazyLoader = true;
    this.commonService.put('partnerManager', `/${this.commonService.app._id}/agent/utils/${this.agentDetails.agentId}/sessions/${sessionId}/${action}`, {}).subscribe(res => {
      this.ts.success('Status Chaned to ' + action);
      this.showLazyLoader = false;
      this.agentSessions = [];
      this.apiConfig.page = 1;
      this.getSessions();
    }, err => {
      this.showLazyLoader = false;
      this.commonService.errorToast(err);
    })
  }
}
