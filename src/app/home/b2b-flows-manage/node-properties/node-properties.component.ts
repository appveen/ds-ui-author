import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'odp-node-properties',
  templateUrl: './node-properties.component.html',
  styleUrls: ['./node-properties.component.scss']
})
export class NodePropertiesComponent implements OnInit {

  @Input() edit: any;
  @Input() prevNode: any;
  @Input() currNode: any;
  @Input() nodeList: Array<any>;
  @Output() close: EventEmitter<any>;
  showNodeMapping: boolean;
  showAgentSelector: boolean;
  constructor() {
    this.edit = { status: true };
    this.close = new EventEmitter();
  }

  ngOnInit(): void {
    if (this.prevNode && !this.prevNode.dataStructure) {
      this.prevNode.dataStructure = {};
    }
    if (this.prevNode && this.prevNode.dataStructure && !this.prevNode.dataStructure.outgoing) {
      this.prevNode.dataStructure.outgoing = {};
    }
    if (this.currNode && !this.currNode.dataStructure) {
      this.currNode.dataStructure = {};
    }
    if (this.currNode && this.currNode.dataStructure && !this.currNode.dataStructure.outgoing) {
      this.currNode.dataStructure.outgoing = {};
    }
    if (this.currNode && !this.currNode.options) {
      this.currNode.options = {};
    }
  }

  closeMapping(data: any) {
    if (!data) {
      this.showNodeMapping = false;
      return;
    }
  }

  onTypeChange(type: string) {
    if (!environment.production) {
      console.log(type);
    }
    if (this.prevNode) {
      this.currNode.options = {};
    }
  }

  onFormatChange(data: any) {
    if (!environment.production) {
      console.log(data);
    }
    this.currNode.dataStructure.outgoing = data;
    this.currNode.mappings = [];
    (this.currNode.onSuccess || []).forEach(item => {
      const temp = this.nodeList.find(r => r._id == item._id);
      if (temp && temp.type == 'MAPPING') {
        temp.mappings = [];
      }
    })
  }

  cancel() {
    this.close.emit(false);
  }

  selectAgent(data: any) {
    if (!this.currNode.options.agents) {
      this.currNode.options.agents = [];
    }
    const index = this.currNode.options.agents.findIndex(e => e._id == data._id);
    if (index == -1) {
      this.currNode.options.agents.push(data);
    }
    this.showAgentSelector = false;
  }

  removeAgent(data: any) {
    const index = this.currNode.options.agents.findIndex(e => e._id == data._id);
    if (index > -1) {
      this.currNode.options.agents.splice(index, 1);
    }
  }
}
