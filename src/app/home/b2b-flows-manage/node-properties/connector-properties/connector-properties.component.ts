import { Component, Input, OnInit } from '@angular/core';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-connector-properties',
  templateUrl: './connector-properties.component.html',
  styleUrls: ['./connector-properties.component.scss']
})
export class ConnectorPropertiesComponent implements OnInit {

  @Input() edit: any;
  @Input() prevNode: any;
  @Input() currNode: any;
  @Input() nodeList: Array<any>;
  connectorList: Array<any>;
  searchTerm: string;
  showLoader: boolean;
  constructor(private commonService: CommonService,
    private appService: AppService) {
    this.edit = {
      status: true
    };
    this.connectorList = [];
  }
  ngOnInit(): void {
    this.loadInitial();
  }

  loadInitial() {
    this.showLoader = true;
    this.commonService.get('user', `/${this.commonService.app._id}/connector`, {
      sort: 'name',
      select: 'name type',
      count: 10,
      filter: {
        type: {
          $in: ['MongoDB',
            'MySQL',
            'PostgreSQL',
            'SFTP',
            'Apache Kafka',
            'Azure Blob Storage',
            'Amazon S3',
            'Google Cloud Storage']
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
      filter: {
        name: '/' + searchTerm + '/',
        app: this.commonService.app._id
      },
      select: 'name status connectorId',
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
