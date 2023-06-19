import { Component, Input, OnInit } from '@angular/core';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'odp-connector-properties',
  templateUrl: './connector-properties.component.html',
  styleUrls: ['./connector-properties.component.scss']
})
export class ConnectorPropertiesComponent implements OnInit {

  @Input() edit: any;
  @Input() currNode: any;
  @Input() nodeList: Array<any>;
  connectorList: Array<any>;
  searchTerm: string;
  showLoader: boolean;
  subscriptions: any;
  typeList: any;
  constructor(private commonService: CommonService,
    private appService: AppService) {
    this.edit = {
      status: false
    };
    this.connectorList = [];
    this.subscriptions = {};
    // this.typeList = ['SFTP', 'MSSQL'];
  }
  ngOnInit(): void {
    this.getAvailableConnectors();
    // this.loadInitial();
  }

  getAvailableConnectors() {
    this.subscriptions['getAvailableConnectors'] = this.commonService.get('user', `/${this.commonService.app._id}/connector/utils/availableConnectors`).subscribe(res => {
      this.typeList = _.uniq(res.map(ele => ele.type).filter(ele => ele));
      this.loadInitial()
    }, err => {
      this.commonService.errorToast(err, 'Unable to fetch user groups, please try again later');
    });
  }

  loadInitial() {
    this.showLoader = true;
    this.commonService.get('user', `/${this.commonService.app._id}/connector`, {
      sort: 'name',
      select: 'name type category',
      count: 10,
      filter: {
        type: {
          $in: this.typeList
        }
      }
    }).subscribe((res) => {
      this.showLoader = false;
      this.connectorList = res;
      this.selectDefault();
    }, err => {
      this.showLoader = false;
      this.connectorList = [];
    });
  }

  searchConnector(searchTerm: string) {
    const options: GetOptions = {
      sort: 'name',
      filter: {
        type: {
          $in: this.typeList
        },
        name: '/' + searchTerm + '/',
        app: this.commonService.app._id
      },
      select: 'name type category',
      count: 5
    };
    this.searchTerm = searchTerm;
    this.showLoader = true;
    this.commonService.get('user', `/${this.commonService.app._id}/connector`, options).subscribe((res) => {
      this.showLoader = false;
      this.connectorList = res;
      this.selectDefault();
    }, err => {
      this.showLoader = false;
      this.connectorList = [];
    });
  }

  clearSearch() {
    this.connectorList = [];
    this.searchTerm = null;
    this.loadInitial();
  }

  selectDefault() {
    if (this.currNode.options && this.currNode.options.connector && this.currNode.options.connector._id) {
      this.connectorList.forEach(item => {
        if (item._id == this.currNode.options.connector._id) {
          item._selected = true;
        }
      });
    }
  }

  toggleItem(flag: boolean, item: any) {
    this.connectorList.forEach(df => {
      df._selected = false;
    });
    item._selected = flag;
  }

  selectConnector() {
    let temp = this.appService.cloneObject(this.connectorList.find(e => e._selected));
    this.currNode.options.connector = {
      _id: temp._id
    };
  }

  removeConnector() {
    delete this.currNode.options.connector;
    this.connectorList.forEach(e => {
      delete e._selected;
    });
  }

  get isConnectorSelected() {
    return this.connectorList.some(e => e._selected);
  }

  get selectedConnector() {
    if (this.currNode.options.connector && this.currNode.options.connector._id) {
      return this.connectorList.find(e => e._selected);
    }
    return null;
  }
}
