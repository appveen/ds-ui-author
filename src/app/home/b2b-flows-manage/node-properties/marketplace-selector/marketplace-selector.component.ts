import { Component, Input, OnInit } from '@angular/core';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import * as _ from 'lodash';
import { AppService } from 'src/app/utils/services/app.service';
import { B2bFlowService } from '../../b2b-flow.service';

@Component({
  selector: 'odp-marketplace-selector',
  templateUrl: './marketplace-selector.component.html',
  styleUrls: ['./marketplace-selector.component.scss']
})
export class PluginSelectorComponent implements OnInit {

  @Input() currNode: any;
  @Input() edit: any
  @Input() nodeList: Array<any>;
  @Input() isInputNode: boolean;
  showLoader: boolean;
  pluginList: Array<any>;
  searchTerm: string;
  data: any;
  constructor(private commonService: CommonService,
    private flowService: B2bFlowService,
    private appService: AppService) {
    this.edit = { status: false };
    this.pluginList = [];
    this.nodeList = [];
  }

  ngOnInit(): void {
    this.data = {};
    this.data.type = this.currNode.subType;
    this.loadInitial();
  }

  loadInitial() {
    this.showLoader = true;
    let filter = {};
    if (this.isInputNode) {
      filter = { type: 'INPUT' };
    }
    this.commonService.get('partnerManager', '/admin/node', {
      sort: 'name',
      filter: filter,
      count: 5,
      noApp: true
    }).subscribe((res) => {
      this.showLoader = false;
      this.pluginList = res;
      this.selectDefault();
    }, err => {
      this.showLoader = false;
      this.pluginList = [];
    });
  }

  searchService(searchTerm: string) {
    let filter: any = { name: '/' + searchTerm + '/' };
    if (this.isInputNode) {
      filter.type = 'INPUT';
    }
    const options: GetOptions = {
      filter: filter,
      count: 5,
      noApp: true
    };
    this.searchTerm = searchTerm;
    this.showLoader = true;
    this.commonService.get('partnerManager', '/admin/node', options).subscribe((res) => {
      this.showLoader = false;
      this.pluginList = res;
      this.selectDefault();
    }, err => {
      this.showLoader = false;
      this.pluginList = [];
    });
  }

  clearSearch() {
    this.pluginList = [];
    this.searchTerm = null;
    this.loadInitial();
  }

  selectDefault() {
    if (this.data) {
      this.pluginList.forEach(item => {
        if (item._id == this.data._id) {
          item._selected = true;
        }
      });
    }
  }

  searchNode(searchTerm: string) {
    this.searchTerm = searchTerm;
  }

  toggleItem(flag: boolean, item: any) {
    this.pluginList.forEach(df => {
      df._selected = false;
    });
    item._selected = flag;
  }

  selectNode() {
    this.data = this.pluginList.find(e => e._selected);
    if (!this.data.params) {
      this.data.params = [];
    }
    this.currNode.options.plugin = this.data;
    const oldId = this.currNode._id;
    const nodeName = this.data.name + ' ' + this.flowService.nodeIDCounter;
    const newId = _.snakeCase(nodeName);
    this.flowService.nodeIDCounter++;
    let regex = new RegExp(`${oldId}`, 'g');
    let replacer = newId;
    this.nodeList.forEach((item) => {
      let temp = this.appService.cloneObject(item);
      delete temp.dataStructure;
      let content = JSON.stringify(temp);
      let fixedNode = JSON.parse(content.replace(regex, replacer));
      _.merge(item, fixedNode);
    });
    this.flowService.reCreatePaths.emit();
    this.currNode._id = newId;
    this.currNode.name = nodeName;
  }

  get isNodeSelected() {
    return this.pluginList.some(e => e._selected);
  }

}
