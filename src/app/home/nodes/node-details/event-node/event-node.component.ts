import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'odp-event-node',
  templateUrl: './event-node.component.html',
  styleUrls: ['./event-node.component.scss']
})
export class EventNodeComponent {
  api: any = {
    method: 'GET',
    path: '',
    contentType: 'application/json',
    timeout: '',
    retryCount: '',
    retryInteval: '',
  };

  @Input() edit: any;
  availableNodes: Array<any>;
  isDeleted: boolean = false;
  changesDone: EventEmitter<any> = new EventEmitter<any>();
  @Input() nodeDetails: any = {};
  toggle: any;
  showDataMapping: boolean = false;
  @Output() onChangeData: EventEmitter<any> = new EventEmitter<any>();
  dataStructure: any;

  constructor() { }

  ngOnInit(): void {
    this.dataStructure = this.nodeDetails.dataStructure;
    this.api = this.nodeDetails.api;

  }
  onFormatChange(data, type) {
    if (!this.dataStructure) {
      this.dataStructure = {};
    }

    if (type == 'incoming') {
      this.dataStructure.incoming = data;
    }

    if (type == 'outgoing') {
      this.dataStructure.outgoing = data;
    }

    // this.mappings = [];
    // (this.onSuccess || []).forEach(item => {
    //   const temp = this.nodeList.find(r => r._id == item._id);
    //   if (temp && temp.type == 'MAPPING') {
    //     temp.mappings = [];
    //   }
    // })
    this.changesDone.emit();
    this.onChangeData.emit(this.nodeDetails)
    // this.flowService.dataStructureSelected.emit({ currNode: this.currNode, type });
  }

  onChange(event) {
    this.onChangeData.emit(this.nodeDetails)
    this.changesDone.emit();
  }
}
