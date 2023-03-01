import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MappingService {

  selectedSourceNode: any;
  selectedTargetNode: any;
  reCreatePaths: EventEmitter<any>;
  constructor() {
    this.reCreatePaths = new EventEmitter();
  }

  tryMapping() {
    if (this.selectedSourceNode && this.selectedTargetNode) {
      if (!this.selectedTargetNode.source) {
        this.selectedTargetNode.source = [];
      }
      this.selectedTargetNode.source.push(this.selectedSourceNode);
      this.reCreatePaths.emit({ source: this.selectedSourceNode._id, target: this.selectedTargetNode._id });
      this.selectedSourceNode = null;
      this.selectedTargetNode = null;
    }
  }
}
