import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'odp-postgre-connector',
  templateUrl: './postgre-connector.component.html',
  styleUrls: ['./postgre-connector.component.scss']
})
export class PostgreConnectorComponent implements OnInit {

  @Input() edit: any;
  @Input() currNode: any;
  @Input() nodeList: Array<any>;

  constructor() { }

  ngOnInit(): void {
  }

}
