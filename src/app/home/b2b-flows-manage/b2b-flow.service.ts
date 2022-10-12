import { EventEmitter, Injectable } from '@angular/core';
import { AppService } from 'src/app/utils/services/app.service';
import * as uuid from 'uuid/v1';

@Injectable({
  providedIn: 'root'
})
export class B2bFlowService {

  showAddNodeDropdown: EventEmitter<any>;
  selectedNode: EventEmitter<any>;
  deleteNode: EventEmitter<any>;
  constructor(private appService: AppService) {
    this.showAddNodeDropdown = new EventEmitter();
    this.selectedNode = new EventEmitter();
    this.deleteNode = new EventEmitter();
  }

  getNodeObject(type: string) {
    const temp: any = {
      _id: this.appService.getNodeID(),
      type: type,
      onSuccess: [],
      onError: [],
      options: {
        method: 'POST'
      },
      dataStructure: {
        outgoing: {}
      }
    };
    if (type == 'DATASERVICE') {
      temp.options.update = true;
      temp.options.insert = true;
    }
    return temp;
  }
}
