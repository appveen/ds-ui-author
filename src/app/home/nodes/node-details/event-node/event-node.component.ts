import { Component, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'odp-event-node',
  templateUrl: './event-node.component.html',
  styleUrls: ['./event-node.component.scss']
})
export class EventNodeComponent {
  @Input() options: any;

  @Input() edit: any;
  availableNodes: Array<any>;
  isDeleted: boolean = false;
  changesDone: EventEmitter<any> = new EventEmitter<any>();
  @Input() dataStructure: any = {}; 
  toggle: any;
  showDataMapping: boolean = false;
}
