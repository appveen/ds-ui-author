import { Component, Input, OnInit } from '@angular/core';
import { B2bFlowService } from '../b2b-flow.service';

@Component({
  selector: '[odp-flow-node]',
  templateUrl: './flow-node.component.html',
  styleUrls: ['./flow-node.component.scss']
})
export class FlowNodeComponent implements OnInit {

  @Input() nodeList: any;
  @Input() nodeIndex: number;
  showNewNodeDropdown: boolean;
  node: any
  constructor(private flowService: B2bFlowService) {
    this.nodeList = [];
  }

  ngOnInit(): void {
    this.node = this.nodeList[this.nodeIndex];
  }

  showBranchDropdown(event: any) {
    this.flowService.showAddNodeDropdown.emit({
      position: { left: event.clientX, top: event.clientY },
      node: this.node,
      nodeIndex: this.nodeIndex
    });
  }

  selectNode() {
    this.flowService.selectedNode.emit({
      node: this.node,
      nodeIndex: this.nodeIndex
    });
  }

  get addBranchStyle() {
    const items = this.node.onSuccess || [];
    return {
      transform: `translateX(${(items.length) * 48}px)`
    }
  }
}
