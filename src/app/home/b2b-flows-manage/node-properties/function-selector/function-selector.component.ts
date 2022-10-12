import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-function-selector',
  templateUrl: './function-selector.component.html',
  styleUrls: ['./function-selector.component.scss']
})
export class FunctionSelectorComponent implements OnInit {

  @Input() edit: any;
  @Input() data: any;
  @Output() dataChange: EventEmitter<any>;

  functionList: Array<any>;
  searchTerm: string;
  showLoader: boolean;
  constructor(private commonService: CommonService,
    private appService: AppService) {
    this.edit = {
      status: true
    };
    this.functionList = [];
    this.dataChange = new EventEmitter();
  }

  ngOnInit(): void {
    this.loadInitial();
  }

  loadInitial() {
    this.showLoader = true;
    this.commonService.get('partnerManager', `/${this.commonService.app._id}/faas`, {
      sort: 'name',
      select: 'name status api',
      count: 10
    }).subscribe((res) => {
      this.showLoader = false;
      this.functionList = res;
      this.selectDefault();
    }, err => {
      this.showLoader = false;
      this.functionList = [];
    });
  }

  searchFunction(searchTerm: string) {
    const options: GetOptions = {
      filter: {
        name: '/' + searchTerm + '/',
        definition: { $exists: true },
        app: this.commonService.app._id
      },
      select: 'name status',
      count: 5
    };
    this.searchTerm = searchTerm;
    this.showLoader = true;
    this.commonService.get('partnerManager', `/${this.commonService.app._id}/faas`, options).subscribe((res) => {
      this.showLoader = false;
      this.functionList = res;
      this.selectDefault();
    }, err => {
      this.showLoader = false;
      this.functionList = [];
    });
  }

  clearSearch() {
    this.functionList = [];
    this.searchTerm = null;
    this.loadInitial();
  }

  selectDefault() {
    if (this.data) {
      this.functionList.forEach(item => {
        if (item._id == this.data._id) {
          item._selected = true;
        }
      });
    }
  }

  toggleItem(flag: boolean, item: any) {
    this.functionList.forEach(df => {
      df._selected = false;
    });
    item._selected = flag;
  }

  selectFunction() {
    this.data = this.functionList.find(e => e._selected);
    this.dataChange.emit(this.data);
  }

  get isFunctionSelected() {
    return this.functionList.some(e => e._selected);
  }
}
