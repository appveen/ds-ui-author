import { Component, Input, OnInit } from '@angular/core';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-marketplace-selector',
  templateUrl: './marketplace-selector.component.html',
  styleUrls: ['./marketplace-selector.component.scss']
})
export class MarketplaceSelectorComponent implements OnInit {

  @Input() currNode: any;
  @Input() edit: any
  showLoader: boolean;
  customNodeList: Array<any>;
  searchTerm: string;
  data: any;
  constructor(private commonService: CommonService) {
    this.edit = { status: false };
    this.customNodeList = [];
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
  }

  get isNodeSelected() {
    return this.customNodeList.some(e => e._selected);
  }

}
