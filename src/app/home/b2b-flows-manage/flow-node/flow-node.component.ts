import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { delay, tap } from 'rxjs/operators';
import { B2bFlowService } from '../b2b-flow.service';
import { B2bFlowsManageComponent } from '../b2b-flows-manage.component';

@Component({
  selector: '[odp-flow-node]',
  templateUrl: './flow-node.component.html',
  styleUrls: ['./flow-node.component.scss']
})
export class FlowNodeComponent implements OnInit {

  @Input() index: number;
  @Input() prevNode: any;
  @Input() currNode: any;
  @Input() nodeList: any;
  @Output() nodeListChange: EventEmitter<any>;
  @Input() branchIndex: number;

  nextNode: any;
  paths: Array<any>;
  isMouseDown: any;
  selectedPathIndex: number;
  selectedNode: any;
  nodeLabelMap: any;
  constructor(private flowService: B2bFlowService) {
    this.index = -1;
    this.nodeListChange = new EventEmitter();
    this.branchIndex = -1;
    this.paths = [];
    this.nodeList = [];
    this.nodeLabelMap = {
      FILE: 'File Agent',
      TIMER: 'Timer',
      CODEBLOCK: 'Code Block',
      CONNECTOR: 'Connector',
      DATASERVICE: 'Data Service',
      FUNCTION: 'Function',
      MAPPING: 'Mapping',
      UNWIND: 'Change Root',
      RESPONSE: 'Response'
    };
  }

  ngOnInit(): void {
    this.paths = [];
    this.renderPaths();
    this.flowService.selectedNode.subscribe((data) => {
      this.selectedPathIndex = null;
      if (data && data.currNode._id == this.currNode._id) {
        this.selectedNode = data.currNode;
      } else {
        this.selectedNode = null;
      }
    });
    this.flowService.reCreatePaths.subscribe(() => {
      this.paths = [];
      this.renderPaths();
    });
    this.prevNode = this.nodeList.find((e: any) => e.onSuccess.find(ei => ei._id == this.currNode._id));
  }

  renderPaths() {
    if (this.currNode.onSuccess && this.currNode.onSuccess.length > 0) {
      this.currNode.onSuccess.forEach((item: any) => {
        const nextNode = this.nodeList.find((e: any) => e._id == item._id);
        if (nextNode) {
          const path = this.flowService.generateLinkPath(this.currNode.coordinates.x + 146, this.currNode.coordinates.y + 18, nextNode.coordinates.x - 6, nextNode.coordinates.y + 18, 1.5);
          this.paths.push({
            _id: nextNode._id,
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

  selectPath(event: any, index: number, path: any) {
    setTimeout(() => {
      this.selectedPathIndex = index;
    }, 200);
    this.flowService.selectedNode.emit(null);
  }

  isActive(place: string) {
    if (this.flowService.anchorSelected && this.flowService.anchorSelected.dataset.id == this.currNode._id) {
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
      currNode: this.currNode,
      prevNode: this.prevNode
    });
  }

  // @HostListener('mousedown', ['$event'])
  // onMouseDown(event: any) {
  //   this.isMouseDown = event;
  // }

  // @HostListener('document:mouseup', ['$event'])
  // onMouseUp(event: any) {
  //   this.isMouseDown = null;
  //   // this.flowService.anchorSelected = null;
  // }

  // @HostListener('mousemove', ['$event'])
  // onMouseMove(event: any) {
  //   if (this.isMouseDown) {
  //     const tempX = event.clientX - this.isMouseDown.clientX;
  //     const tempY = event.clientY - this.isMouseDown.clientY;
  //     this.isMouseDown = event;
  //     this.currNode.coordinates.x += tempX;
  //     this.currNode.coordinates.y += tempY;
  //     this.flowService.reCreatePaths.emit();
  //   }
  // }

  @HostListener('document:keydown', ['$event'])
  onDeleteKey(event: any) {
    if (((event.metaKey || event.ctrlKey) && event.key == 'Backspace') || event.key == 'Delete') {
      if (typeof this.selectedPathIndex == 'number') {
        const path = this.paths[this.selectedPathIndex];
        this.nodeList.forEach((node: any) => {
          let i = node.onSuccess.findIndex(e => e._id == path._id);
          if (i > -1) {
            node.onSuccess.splice(i, 1);
          }
        });
        this.paths.splice(this.selectedPathIndex, 1);
      }
    }
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
      this.createPaths(sourceEle, targetEle);
      this.flowService.reCreatePaths.emit();
    }
  }

  get style() {
    return {
      transform: `translate(${this.currNode.coordinates.x}px,${this.currNode.coordinates.y}px)`,
    }
  }

  get isSelected() {
    if (this.currNode._id && this.selectedNode && this.selectedNode._id) {
      return true;
    }
    return false;
  }

  get isInputNode() {
    return this.nodeList[0]._id == this.currNode._id;
  }

  get nodeType() {
    if (this.currNode.type == 'API' && this.isInputNode) {
      return 'API Reciever';
    } else if (this.currNode.type == 'API' && !this.isInputNode) {
      return 'Invoke API';
    } else if (this.nodeLabelMap[this.currNode.type]) {
      return this.nodeLabelMap[this.currNode.type];
    } else {
      return this.currNode.type;
    }
  }
}
