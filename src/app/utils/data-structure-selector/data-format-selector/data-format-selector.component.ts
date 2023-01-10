import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { zip } from 'rxjs';
import * as _ from 'lodash';

import { AppService } from '../../services/app.service';
import { CommonService, GetOptions } from '../../services/common.service';

@Component({
  selector: 'odp-data-format-selector',
  templateUrl: './data-format-selector.component.html',
  styleUrls: ['./data-format-selector.component.scss']
})
export class DataFormatSelectorComponent implements OnInit {

  @Input() edit: any;
  @Input() format: any;
  @Output() formatChange: EventEmitter<any>;

  apiOptions: GetOptions;
  dataFormatList: Array<any>;
  searchTerm: string;
  showLoader: boolean;
  searchSubscription: any;
  constructor(private commonService: CommonService,
    private appService: AppService) {
    this.edit = {
      status: true
    };
    this.dataFormatList = [];
    this.formatChange = new EventEmitter();
    this.apiOptions = {
      page: 1,
      count: 5,
      select: 'name definition attributeCount formatType character excelType strictValidation lineSeparator',
      sort: 'name'
    }
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
      this.dataFormatList = allResult;
      this.selectDefault();
    }, err => {
      this.showLoader = false;
      this.dataFormatList = [];
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
      this.dataFormatList = allResult;

      this.selectDefault();
    }, err => {
      this.showLoader = false;
      this.dataFormatList = [];
    });
  }

  clearSearch() {
    this.dataFormatList = [];
    this.searchTerm = null;
    this.loadInitial();
  }

  selectDefault() {
    if (this.format) {
      this.dataFormatList.forEach(item => {
        if (item._id == this.format._id) {
          item._selected = true;
        }
      });
    }
  }

  toggleItem(flag: boolean, item: any) {
    this.dataFormatList.forEach(df => {
      df._selected = false;
    });
    item._selected = flag;
  }

  selectFormat() {
    this.format = this.dataFormatList.find(e => e._selected);
    this.formatChange.emit(this.format);
  }

  get isFormatSelected() {
    return this.dataFormatList.some(e => e._selected);
  }
}
