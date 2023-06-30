import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'odp-system-node',
  templateUrl: './system-node.component.html',
  styleUrls: ['./system-node.component.scss']
})
export class SystemNodeComponent implements OnInit {
  api: any = {
    method: 'GET',
    endpoint: '',
    contentType: 'application/json',
    timeout: '',
    retryCount: '',
    retryInteval: '',
    type: '',
    headers: {}
  }

  @Input() edit: any;
  @Input() nodeDetails: any = {};
  availableNodes: Array<any>;
  isDeleted: boolean = false;
  changesDone: EventEmitter<any> = new EventEmitter<any>();
  dataStructure: any = {};
  @Output() onChangeData: EventEmitter<any> = new EventEmitter<any>();
  toggle: any;
  showDataMapping: boolean = false;

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
