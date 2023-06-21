import { Component, EventEmitter, Input, OnInit } from '@angular/core';

@Component({
  selector: 'odp-system-node',
  templateUrl: './system-node.component.html',
  styleUrls: ['./system-node.component.scss']
})
export class SystemNodeComponent implements OnInit {
  @Input() options: any;

  @Input() edit: any;
  availableNodes: Array<any>;
  isDeleted: boolean = false;
  changesDone: EventEmitter<any> = new EventEmitter<any>();
  @Input() dataStructure: any = {}; 
  toggle: any;
  showDataMapping: boolean = false;

  constructor() {}

  ngOnInit(): void {
      
  }
  onFormatChange(event, _){

  }
}
