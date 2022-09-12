import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

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

  dataFormatList: Array<any>;
  searchTerm: string;
  showLoader: boolean;
  constructor(private commonService: CommonService,
    private appService: AppService) {
    this.edit = {
      status: true
    };
    this.dataFormatList = [];
    this.formatChange = new EventEmitter();
  }

  ngOnInit(): void {
    this.loadInitial();
  }

  loadInitial() {
    this.showLoader = true;
    this.commonService.get('partnerManager', `/${this.commonService.app._id}/dataFormat`, {
      sort: 'name',
      select: 'name definition attributeCount formatType character excelType strictValidation lineSeparator',
      count: 10
    }).subscribe((res) => {
      this.showLoader = false;
      this.dataFormatList = res;
      this.selectDefault();
    }, err => {
      this.showLoader = false;
      this.dataFormatList = [];
    });
  }

  searchFormat(searchTerm: string) {
    const options: GetOptions = {
      filter: {
        name: '/' + searchTerm + '/',
        definition: { $exists: true },
        app: this.commonService.app._id
      },
      select: 'name definition attributeCount formatType character excelType strictValidation lineSeparator',
      count: 5
    };
    this.searchTerm = searchTerm;
    this.showLoader = true;
    this.commonService.get('partnerManager', `/${this.commonService.app._id}/dataFormat`, options).subscribe((res) => {
      this.showLoader = false;
      this.dataFormatList = res;
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
