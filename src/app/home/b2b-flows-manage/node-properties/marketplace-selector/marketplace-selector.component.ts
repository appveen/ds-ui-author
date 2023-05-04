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
  showLoader: boolean;
  customNodeList: Array<any>;
  searchTerm: string;
  data: any;
  constructor(private commonService: CommonService,
    private flowService: B2bFlowService,
    private appService: AppService) {
    this.edit = { status: false };
    this.customNodeList = [];
    this.nodeList = [];
  }

  ngOnInit(): void {
    this.data = {};
    this.data.type = this.currNode.subType;
    this.loadInitial();
  }

  loadInitial() {
    this.showLoader = true;
    this.commonService.get('partnerManager', '/admin/node', {
      sort: 'name',
      count: 5,
      noApp: true
    }).subscribe((res) => {
      this.showLoader = false;
      this.customNodeList = res;
      this.selectDefault();
    }, err => {
      this.showLoader = false;
      this.customNodeList = [];
    });
  }

  searchService(searchTerm: string) {
    const options: GetOptions = {
      filter: {
        name: '/' + searchTerm + '/'
      },
      count: 5,
      noApp: true
    };
    this.searchTerm = searchTerm;
    this.showLoader = true;
    this.commonService.get('partnerManager', '/admin/node', options).subscribe((res) => {
      this.showLoader = false;
      this.customNodeList = res;
      this.selectDefault();
    }, err => {
      this.showLoader = false;
      this.customNodeList = [];
    });
  }

  clearSearch() {
    this.customNodeList = [];
    this.searchTerm = null;
    this.loadInitial();
  }

  selectDefault() {
    if (this.data) {
      this.customNodeList.forEach(item => {
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
    this.customNodeList.forEach(df => {
      df._selected = false;
    });
    item._selected = flag;
  }

  selectNode() {
    this.data = this.customNodeList.find(e => e._selected);
    if (!this.data.params) {
      this.data.params = [];
    }
    this.currNode.options.node = this.data;
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
    return this.customNodeList.some(e => e._selected);
  }

}
