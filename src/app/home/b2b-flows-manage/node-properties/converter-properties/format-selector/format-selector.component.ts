import { Component, EventEmitter, Input, Output } from '@angular/core';
import { zip } from 'rxjs';
import * as _ from 'lodash';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-format-selector',
  templateUrl: './format-selector.component.html',
  styleUrls: ['./format-selector.component.scss']
})
export class FormatSelectorComponent {
  @Input() format: any;
  @Output() formatChange: EventEmitter<any>;
  showConverterWindow: boolean;
  formatList: Array<any>;
  apiOptions: GetOptions;
  searchTerm: string;
  showLoader: boolean;
  searchSubscription: any;
  constructor(private commonService: CommonService) {
    this.showConverterWindow = false;
    this.formatList = [];
    this.apiOptions = {
      page: 1,
      count: 5,
      select: 'name definition attributeCount formatType',
      sort: 'name'
    };
    this.formatChange = new EventEmitter();
  }

  ngOnInit(): void {
    this.loadInitial();
  }

  loadInitial() {
    this.showLoader = true;
    zip(
      this.commonService.get('serviceManager', `/${this.commonService.app._id}/service`, this.apiOptions),
      this.commonService.get('partnerManager', `/${this.commonService.app._id}/dataFormat`, this.apiOptions)
    ).subscribe((res) => {
      this.showLoader = false;
      let allResult = _.flatten(res);
      if (allResult && allResult.length > 0) {
        allResult = allResult.map(item => {
          if (!item.formatType) {
            item.formatType = 'JSON';
          }
          return item;
        });
      }
      this.formatList = allResult;
    }, err => {
      this.showLoader = false;
      this.formatList = [];
    });
  }

  searchFormat(searchTerm: string) {
    this.apiOptions.filter = {
      name: '/' + searchTerm + '/',
      definition: { $exists: true }
    };
    this.searchTerm = searchTerm;
    this.showLoader = true;
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    this.searchSubscription = zip(
      this.commonService.get('serviceManager', `/${this.commonService.app._id}/service`, this.apiOptions),
      this.commonService.get('partnerManager', `/${this.commonService.app._id}/dataFormat`, this.apiOptions)
    ).subscribe((res: Array<any>) => {
      this.showLoader = false;
      let allResult = _.flatten(res);
      if (allResult && allResult.length > 0) {
        allResult = allResult.map(item => {
          if (!item.formatType) {
            item.formatType = 'JSON';
          }
          return item;
        });
      }
      this.formatList = allResult;
    }, err => {
      this.showLoader = false;
      this.formatList = [];
    });
  }

  clearSearch() {
    this.formatList = [];
    this.searchTerm = null;
    delete this.apiOptions.filter;
    this.loadInitial();
  }

  toggleItem(flag: boolean, item: any) {
    this.formatList.forEach(df => {
      df._selected = false;
    });
    item._selected = flag;
  }

  selectFormat() {
    this.format = this.formatList.find(e => e._selected);
    this.formatChange.emit(this.format);
  }

  get isFormatSelected() {
    return this.formatList.some(e => e._selected);
  }
}
