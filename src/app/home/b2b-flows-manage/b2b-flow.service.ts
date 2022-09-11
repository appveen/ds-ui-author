import { EventEmitter, Injectable } from '@angular/core';
import * as uuid from 'uuid/v1';

@Injectable({
  providedIn: 'root'
})
export class B2bFlowService {

  showAddNodeDropdown: EventEmitter<any>;
  selectedNode: EventEmitter<any>;
  constructor() {
    this.showAddNodeDropdown = new EventEmitter();
    this.selectedNode = new EventEmitter();
  }

  getNodeObject(type: string) {
    return {
      _id: uuid(),
      type: type,
      onSuccess: [],
      onError: [],
      options: {
        method: 'POST'
      },
      dataStructure: {
        outgoing: {}
      }
    }
  }
}
