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

  constructor() {}

  ngOnInit(): void {
      
  }
  onFormatChange(event, type){
    // if (!environment.production) {
    //   console.log(data, type);
    // }
    // if (!this.dataStructure) {
    //   this.dataStructure = {};
    // }

    // if (type == 'incoming') {
    //   this.dataStructure.incoming = data;
    // }

    // if (type == 'outgoing') {
    //   this.dataStructure.outgoing = data;
    // }

    // this.mappings = [];
    // (this.onSuccess || []).forEach(item => {
    //   const temp = this.nodeList.find(r => r._id == item._id);
    //   if (temp && temp.type == 'MAPPING') {
    //     temp.mappings = [];
    //   }
    // })
    this.changesDone.emit();
    // this.flowService.dataStructureSelected.emit({ currNode: this.currNode, type });
  }
}
