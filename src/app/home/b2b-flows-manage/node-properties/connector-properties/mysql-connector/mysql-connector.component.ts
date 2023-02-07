import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'odp-mysql-connector',
  templateUrl: './mysql-connector.component.html',
  styleUrls: ['./mysql-connector.component.scss']
})
export class MysqlConnectorComponent implements OnInit {

  @Input() edit: any;
  @Input() currNode: any;
  @Input() nodeList: Array<any>;
  toggle: any;
  constructor() {
    this.toggle = {};
  }

  ngOnInit(): void {
  }

}
