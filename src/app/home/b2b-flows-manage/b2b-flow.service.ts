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
    if (type == 'CODEBLOCK') {
      const tempCode = [];
      tempCode.push('//use logger for logging');
      tempCode.push('async function execute(context, node) {');
      tempCode.push('\ttry {');
      tempCode.push('\t\t//Write Your code here');
      tempCode.push('\t\t');
      tempCode.push('\t\treturn context;');
      tempCode.push('\t} catch(err) {');
      tempCode.push('\t\tlogger.error(err);');
      tempCode.push('\t\tthrow err;');
      tempCode.push('\t}');
      tempCode.push('}');
      temp.options.code = tempCode.join('\n');
    }
    return temp;
  }
}
