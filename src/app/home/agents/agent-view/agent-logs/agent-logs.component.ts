import { Component, Input, OnInit } from '@angular/core';
import { APIConfig } from 'src/app/utils/interfaces/apiConfig';
import { CommonService } from 'src/app/utils/services/common.service';
import * as moment from 'moment';

@Component({
  selector: 'odp-agent-logs',
  templateUrl: './agent-logs.component.html',
  styleUrls: ['./agent-logs.component.scss']
})
export class AgentLogsComponent implements OnInit {

  @Input() agentDetails: any;
  apiConfig: APIConfig;
  showLazyLoader: boolean;
  agentLogs: Array<any>;
  sortModel: any;
  filterModel: any;
  constructor(private commonService: CommonService,) {
    this.apiConfig = {
      page: 1,
      count: 30,
      filter: {},
      sort: '-timestamp'
    };
    this.agentLogs = [];
    this.sortModel = {};
    this.filterModel = {};
  }

  ngOnInit(): void {
    this.getLogs();
  }

  getLogs() {
    this.showLazyLoader = true;
    this.commonService.get('partnerManager', `/${this.commonService.app._id}/agent/utils/${this.agentDetails.agentId}/logs`, this.apiConfig).subscribe(res => {
      res.forEach((item: any) => {
        this.agentLogs.push(item);
      });
      this.showLazyLoader = false;
    });
  }

  loadMore(event: any) {
    if (event.target.scrollTop + event.target.offsetHeight === event.target.scrollHeight + 2) {
      this.apiConfig.page++;
      this.getLogs();
    }
  }

  filterLevel(value: string) {
    if (value !== 'ALL') {
      this.apiConfig.filter = { logLevel: value };
    } else {
      this.apiConfig.filter = {};
    }
    this.apiConfig.page = 1;
    this.agentLogs = [];
    this.getLogs();
  }

  clearFilter() {
    this.apiConfig.filter = {
      agentId: this.agentDetails._id,
      app: this.commonService.app._id
    };
    this.apiConfig.page = 1;
    this.agentLogs = [];
    this.getLogs();
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

  convertDate(dateString) {
    const date = new Date(dateString);
    return moment(date).format('DD MMM YYYY, hh:mm:ss A')
  }
}
