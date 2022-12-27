import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'odp-kafka-connector',
  templateUrl: './kafka-connector.component.html',
  styleUrls: ['./kafka-connector.component.scss']
})
export class KafkaConnectorComponent implements OnInit {

  @Input() edit: any;
  @Input() prevNode: any;
  @Input() currNode: any;
  @Input() nodeList: Array<any>;
  
  constructor() { }

  ngOnInit(): void {
  }

}
