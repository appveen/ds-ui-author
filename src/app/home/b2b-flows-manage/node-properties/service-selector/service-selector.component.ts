import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-service-selector',
  templateUrl: './service-selector.component.html',
  styleUrls: ['./service-selector.component.scss']
})
export class ServiceSelectorComponent implements OnInit {

  @Input() edit: any;
  @Input() data: any;
  @Output() dataChange: EventEmitter<any>;

  serviceList: Array<any>;
  searchTerm: string;
  showLoader: boolean;
  constructor(private commonService: CommonService,
    private appService: AppService) {
    this.edit = {
      status: false
    };
    this.serviceList = [];
    this.dataChange = new EventEmitter();
  }

  ngOnInit(): void {
    this.loadInitial();
  }

  loadInitial() {
    this.showLoader = true;
    this.commonService.get('serviceManager', `/${this.commonService.app._id}/service`, {
      sort: 'name',
      select: 'name definition attributeCount status',
      count: 5
    }).subscribe((res) => {
      this.showLoader = false;
      this.serviceList = res;
      this.selectDefault();
    }, err => {
      this.showLoader = false;
      this.serviceList = [];
    });
  }

  searchService(searchTerm: string) {
    const options: GetOptions = {
      filter: {
        name: '/' + searchTerm + '/',
        definition: { $exists: true },
        app: this.commonService.app._id
      },
      select: 'name definition attributeCount status',
      count: 5
    };
    this.searchTerm = searchTerm;
    this.showLoader = true;
    this.commonService.get('serviceManager', `/${this.commonService.app._id}/service`, options).subscribe((res) => {
      this.showLoader = false;
      this.serviceList = res;
      this.selectDefault();
    }, err => {
      this.showLoader = false;
      this.serviceList = [];
    });
  }

  clearSearch() {
    this.serviceList = [];
    this.searchTerm = null;
    this.loadInitial();
  }

  selectDefault() {
    if (this.data) {
      this.serviceList.forEach(item => {
        if (item._id == this.data._id) {
          item._selected = true;
        }
      });
    }
  }

  toggleItem(flag: boolean, item: any) {
    this.serviceList.forEach(df => {
      df._selected = false;
    });
    item._selected = flag;
  }

  selectService() {
    this.data = this.serviceList.find(e => e._selected);
    this.dataChange.emit(this.data);
  }

  get isServiceSelected() {
    return this.serviceList.some(e => e._selected);
  }

}
