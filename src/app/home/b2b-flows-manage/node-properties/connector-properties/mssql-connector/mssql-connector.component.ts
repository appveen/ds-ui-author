import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'odp-mssql-connector',
  templateUrl: './mssql-connector.component.html',
  styleUrls: ['./mssql-connector.component.scss']
})
export class MssqlConnectorComponent implements OnInit {

  @Input() edit: any;
  @Input() currNode: any;
  @Input() nodeList: Array<any>;

  constructor() { }

  ngOnInit(): void {
  }

}
