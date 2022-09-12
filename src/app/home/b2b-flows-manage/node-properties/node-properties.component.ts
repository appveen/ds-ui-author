import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'odp-node-properties',
  templateUrl: './node-properties.component.html',
  styleUrls: ['./node-properties.component.scss']
})
export class NodePropertiesComponent implements OnInit {

  @Input() edit: any;
  @Input() node: any;
  @Input() nodeIndex: number;
  @Input() nodeList: Array<any>;
  @Output() close: EventEmitter<any>;
  showNodeMapping: boolean;
  constructor() {
    this.edit = { status: true };
    this.close = new EventEmitter();
  }

  ngOnInit(): void {
  }

  closeMapping(data: any) {
    if (!data) {
      this.showNodeMapping = false;
      return;
    }
  }

  cancel() {
    this.close.emit(false);
  }

  get prevNode() {
    if (this.nodeIndex > 0) {
      return this.nodeList[this.nodeIndex - 1];
    }
  }
  get currNode() {
    return this.node;
  }
}
