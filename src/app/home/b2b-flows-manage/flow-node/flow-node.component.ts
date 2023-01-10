import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { delay, tap } from 'rxjs/operators';
import { B2bFlowService } from '../b2b-flow.service';
import { B2bFlowsManageComponent } from '../b2b-flows-manage.component';

@Component({
  selector: '[odp-flow-node]',
  templateUrl: './flow-node.component.html',
  styleUrls: ['./flow-node.component.scss']
})
export class FlowNodeComponent implements OnInit {

  @Input() prevNode: any;
  @Input() currNode: any;
  @Input() nodeList: any;
  @Output() nodeListChange: EventEmitter<any>;
  @Input() branchIndex: number;

  showNewNodeDropdown: boolean;
  node: any
  clickEventPos: any;
  addTo: string;
  isNodeSelected: boolean;
  constructor(private flowService: B2bFlowService,
    public b2bflowsmanage: B2bFlowsManageComponent) {
    this.nodeList = [];
    this.node = {};
    this.nodeListChange = new EventEmitter();
  }

  ngOnInit(): void {
    this.node = this.currNode;
    this.flowService.selectedNode.pipe(
      tap(() => {
        this.isNodeSelected = false;
      }),
      delay(5)
    ).subscribe((data: any) => {
      if (data && data.currNode == this.currNode) {
        this.isNodeSelected = true;
      }
    });
  }

  getCurrentNode(item: any) {
    return this.nodeList.find(e => e._id == item._id);
  }

  showBranchDropdown(event: any, branchIndex?: number) {
    if(this.b2bflowsmanage.edit.status){
      this.clickEventPos = { left: event.clientX, top: event.clientY };
      this.showNewNodeDropdown = true;
    }
  }

  selectNode() {
    if(this.b2bflowsmanage.edit.status){
      this.flowService.selectedNode.emit({
        currNode: this.currNode,
        prevNode: this.prevNode,
      });
    }
  }

  deleteNode() {
    // this.flowService.deleteNode.emit({
    //   currNode: this.currNode,
    //   prevNode: this.prevNode,
    // });
    if (!this.prevNode) {
      return;
    }
    this.prevNode.onSuccess.splice(this.branchIndex, 1);
    this.prevNode.onSuccess = this.prevNode.onSuccess.concat(this.currNode.onSuccess);
    const index = this.nodeList.findIndex(e => e._id == this.currNode._id);
    if (index > -1) {
      this.nodeList.splice(index, 1);
    }
    this.nodeListChange.emit(this.nodeList);
    this.flowService.selectedNode.emit(null);
  }

  getAddStyle(index: number) {
    return {
      marginLeft: `${(84 + (index > 0 ? 144 : 0))}px`
    }
  }

  addNode(type: string) {
    const tempNode = this.flowService.getNodeObject(type);
    let node = this.currNode;
    if (this.addTo == 'prev') {
      node = this.prevNode;
    }
    if (node) {
      if (!node.onSuccess) {
        node.onSuccess = [];
      }
      if (this.addTo == 'prev') {
        if (this.branchIndex > -1 && node.onSuccess.length > 0) {
          const temp = node.onSuccess.splice(this.branchIndex, 1)[0];
          if (temp) {
            tempNode.onSuccess.push({ _id: temp._id });
            temp._id = tempNode._id;
          }
          node.onSuccess.push({ _id: tempNode._id });
          // this.flowData.nodes.splice(this.selectedNodeIndex, 0, tempNode);
        } else {
          node.onSuccess.push({ _id: tempNode._id });
        }
      } else {
        node.onSuccess.push({ _id: tempNode._id });
      }
      this.nodeList.push(tempNode);
      this.nodeListChange.emit(this.nodeList);
    }
    this.showNewNodeDropdown = false;
  }

  onNodeChange(data: any) {
    this.nodeListChange.emit(data);
  }

  get dropDownStyle() {
    return {
      top: `${this.clickEventPos.top}px`,
      left: `${this.clickEventPos.left}px`,
    }
  }
}
