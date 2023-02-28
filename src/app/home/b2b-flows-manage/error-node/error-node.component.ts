import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { B2bFlowService } from '../b2b-flow.service';

@Component({
  selector: '[odp-error-node]',
  templateUrl: './error-node.component.html',
  styleUrls: ['./error-node.component.scss']
})
export class ErrorNodeComponent implements OnInit {

  @Input() node: any;
  @Input() nodeList: Array<any>;
  @Output() nodeListChange: EventEmitter<Array<any>>;

  successPaths: Array<any>;
  errorPaths: Array<any>;
  isMouseDown: any;
  selectedPathIndex: number;
  selectedPath: any;
  selectedPathType: any;
  selectedNode: any;
  constructor(private flowService: B2bFlowService) {
    this.nodeList = [];
    this.nodeListChange = new EventEmitter();
    this.successPaths = [];
    this.errorPaths = [];
  }

  ngOnInit(): void {
    this.renderPaths();
    this.flowService.selectedNode.subscribe((data) => {
      this.selectedPathIndex = null;
      if (data && data.currNode._id == this.node._id) {
        this.selectedNode = data.currNode;
      } else {
        this.selectedNode = null;
      }
    });
    this.flowService.reCreatePaths.subscribe(() => {
      this.successPaths = [];
      this.errorPaths = [];
      this.renderPaths();
    });
  }

  renderPaths() {
    if (this.node.onSuccess && this.node.onSuccess.length > 0) {
      this.node.onSuccess.forEach((item: any) => {
        const nextNode = this.nodeList.find((e: any) => e._id == item._id);
        if (nextNode) {
          const path = this.flowService.generateLinkPath(this.node.coordinates.x + 146, this.node.coordinates.y + 18, nextNode.coordinates.x - 6, nextNode.coordinates.y + 18, 1.5);
          this.successPaths.push({
            _id: nextNode._id,
            name: item.name,
            color: item.color,
            prevNode: this.node._id,
            path
          });
        }
      });
    }
    if (this.node.onError && this.node.onError.length > 0) {
      this.node.onError.forEach((item: any) => {
        const nextNode = this.nodeList.find((e: any) => e._id == item._id);
        if (nextNode) {
          const path = this.flowService.generateLinkPath(this.node.coordinates.x + 146, this.node.coordinates.y + 18, nextNode.coordinates.x - 6, nextNode.coordinates.y + 18, 1.5);
          this.errorPaths.push({
            _id: nextNode._id,
            name: item.name,
            color: item.color,
            prevNode: this.node._id,
            path
          });
        }
      });
    }
  }

  createPaths(source: any, target: any) {
    const sourceId = source.dataset.id;
    const targetId = target.dataset.id;
    const sourceNode = this.nodeList.find((e: any) => e._id == sourceId);
    const targetNode = this.nodeList.find((e: any) => e._id == targetId);
    if (sourceNode && targetNode) {
      if (!sourceNode.onSuccess) {
        sourceNode.onSuccess = [];
      }
      sourceNode.onSuccess.push({
        _id: targetNode._id
      });
    }
  }

  selectPath(event: any, index: number, path: any, type: string) {
    setTimeout(() => {
      this.selectedPathIndex = index;
      this.selectedPath = path;
      this.selectedPathType = type;
    }, 200);
    this.flowService.selectedNode.emit(null);
    this.flowService.selectedPath.emit({ index, path });
  }

  isActive(place: string) {
    if (this.flowService.anchorSelected && this.flowService.anchorSelected.dataset.id == this.node._id) {
      if (place == 'start' && this.flowService.anchorSelected.classList.contains('start')) {
        return true;
      } else if (place == 'end' && this.flowService.anchorSelected.classList.contains('end')) {
        return true;
      }
    }
    return false;
  }

  openProperties(event: any) {
    this.flowService.selectedNode.emit({
      currNode: this.node
    });
  }

  @HostListener('document:keydown', ['$event'])
  onDeleteKey(event: any) {
    if (((event.metaKey || event.ctrlKey) && event.key == 'Backspace') || event.key == 'Delete') {
      this.deletePath();
    }
  }

  deletePath() {
    let onSuccess = true;
    let nodeIndex = (this.node.onSuccess || []).findIndex(e => e._id == this.selectedPath._id);
    if (nodeIndex == -1) {
      onSuccess = false;
      nodeIndex = (this.node.onError || []).findIndex(e => e._id == this.selectedPath._id);
    }
    if (nodeIndex > -1) {
      if (onSuccess) {
        (this.node.onSuccess || []).splice(nodeIndex, 1);
      } else {
        (this.node.onError || []).splice(nodeIndex, 1);
      }
    }
    this.flowService.reCreatePaths.emit(null);
  }

  onAnchorClick(event: any) {
    // event.stopPropagation();
    // event.preventDefault();
    this.isMouseDown = null;
    if (!this.flowService.anchorSelected) {
      this.flowService.anchorSelected = event.target;
    } else {
      let sourceEle, targetEle;
      if ((event.target as HTMLElement).classList.contains('start')) {
        sourceEle = this.flowService.anchorSelected;
        targetEle = event.target;
      } else {
        sourceEle = event.target;
        targetEle = this.flowService.anchorSelected;
      }
      this.flowService.anchorSelected = null;
      if (sourceEle.dataset.id !== targetEle.dataset.id) {
        this.createPaths(sourceEle, targetEle);
        this.flowService.reCreatePaths.emit();
      }
    }
  }

  getPathTextStyle(path: any) {
    const nextNode = this.nodeList.find((e: any) => e._id == path._id);
    let sourceNodeX = (this.node.coordinates.x + 140);
    let sourceNodeY = (this.node.coordinates.y + 36);
    let x = (nextNode.coordinates.x - sourceNodeX) / 2 + sourceNodeX;
    let y = (nextNode.coordinates.y - sourceNodeY) / 2 + sourceNodeY;
    return {
      transform: `translate(${x}px,${y}px)`,
    }
  }

  get style() {
    if (this.node && this.node.coordinates) {
      return {
        transform: `translate(${this.node.coordinates.x}px, ${this.node.coordinates.y}px)`,
      }
    }
    return {
      transform: `translate(400px, 30px)`,
    }
  }

  get isSelected() {
    if (this.node._id && this.selectedNode && this.selectedNode._id) {
      return true;
    }
    return false;
  }

  get isSelectedPath() {
    if (this.node._id && this.selectedPath && this.selectedPath.prevNode == this.node._id) {
      return true;
    }
    return false;
  }

  get isInputNode() {
    return this.nodeList[0]._id == this.node._id;
  }

  get nodeType() {
    return this.flowService.getNodeType(this.node, this.isInputNode);
  }

}
