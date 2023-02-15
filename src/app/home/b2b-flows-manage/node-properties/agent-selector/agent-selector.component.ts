import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-agent-selector',
  templateUrl: './agent-selector.component.html',
  styleUrls: ['./agent-selector.component.scss']
})
export class AgentSelectorComponent implements OnInit {

  @Input() edit: any;
  @Input() data: any;
  @Output() dataChange: EventEmitter<any>;

  agentList: Array<any>;
  searchTerm: string;
  showLoader: boolean;
  constructor(private commonService: CommonService,
    private appService: AppService) {
    this.edit = {
      status: false
    };
    this.agentList = [];
    this.dataChange = new EventEmitter();
  }

  ngOnInit(): void {
    this.loadInitial();
  }

  loadInitial() {
    this.showLoader = true;
    this.commonService.get('partnerManager', `/${this.commonService.app._id}/agent`, {
      sort: 'name',
      select: 'name status agentId',
      count: 10
    }).subscribe((res) => {
      this.showLoader = false;
      this.agentList = res;
      this.selectDefault();
    }, err => {
      this.showLoader = false;
      this.agentList = [];
    });
  }

  searchAgent(searchTerm: string) {
    const options: GetOptions = {
      filter: {
        name: '/' + searchTerm + '/',
        definition: { $exists: true },
        app: this.commonService.app._id
      },
      select: 'name status agentId',
      count: 5
    };
    this.searchTerm = searchTerm;
    this.showLoader = true;
    this.commonService.get('partnerManager', `/${this.commonService.app._id}/agent`, options).subscribe((res) => {
      this.showLoader = false;
      this.agentList = res;
      this.selectDefault();
    }, err => {
      this.showLoader = false;
      this.agentList = [];
    });
  }

  clearSearch() {
    this.agentList = [];
    this.searchTerm = null;
    this.loadInitial();
  }

  selectDefault() {
    if (this.data) {
      this.agentList.forEach(item => {
        if (item._id == this.data._id) {
          item._selected = true;
        }
      });
    }
  }

  toggleItem(flag: boolean, item: any) {
    this.agentList.forEach(df => {
      df._selected = false;
    });
    item._selected = flag;
  }

  selectAgent() {
    this.data = this.appService.cloneObject(this.agentList.find(e => e._selected));
    delete this.data._selected;
    this.dataChange.emit(this.data);
  }

  get isAgentSelected() {
    return this.agentList.some(e => e._selected);
  }

}
