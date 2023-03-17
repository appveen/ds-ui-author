import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';

import { AppService } from 'src/app/utils/services/app.service';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { environment } from 'src/environments/environment';
import { B2bFlowService } from '../b2b-flow.service';

@Component({
  selector: 'odp-node-properties',
  templateUrl: './node-properties.component.html',
  styleUrls: ['./node-properties.component.scss']
})
export class NodePropertiesComponent implements OnInit {

  @Input() edit: any;
  @Input() flowData: any;
  @Input() currNode: any;
  @Input() nodeList: Array<any>;
  @Output() close: EventEmitter<any>;
  @Output() changesDone: EventEmitter<any>;
  prevNode: any;
  toggle: any;
  nodeNameErrorMessage: string;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private flowService: B2bFlowService) {
    this.edit = { status: false };
    this.close = new EventEmitter();
    this.changesDone = new EventEmitter();
    this.toggle = {};
  }

  ngOnInit(): void {
    this.prevNode = this.nodeList.find(e => (e.onSuccess || []).findIndex(es => es._id == this.currNode._id) > -1);
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
    if (this.currNode && !this.currNode.options.retry) {
      this.currNode.options.retry = {};
    }
    const options:  GetOptions={
      filter: {
        app: this.commonService.app._id
      },
      select: 'agentId'
    }
    this.commonService.get('partnerManager', `/${this.commonService.app._id}/agent`, options).subscribe(res=>{
      if(res){
        var selected=this.currNode.options.agents;
        this.currNode.options.agents=[];
        res.some(r=> selected?.find(e=>{
            if(e._id==r._id){
              this.currNode.options.agents.push(e)
            }
          }
        ))
      }
    });
  }

  enableEditing() {
    this.edit.status = true;
  }

  deleteNode() {
    if (this.prevNode) {
      const prevIndex = this.nodeList.findIndex(e => e._id == this.prevNode._id);
      if (prevIndex > -1) {
        const nextIndex = this.nodeList[prevIndex].onSuccess.findIndex(e => e._id == this.currNode._id);
        if (nextIndex > -1) {
          this.nodeList[prevIndex].onSuccess.splice(nextIndex, 1);
        }
      }
    }
    const currIndex = this.nodeList.findIndex(e => e._id == this.currNode._id);
    if (currIndex > -1) {
      this.nodeList.splice(currIndex, 1);
    }
    if (!environment.production) {
      console.log(this.nodeList);
    }
    this.flowService.reCreatePaths.emit();
    this.close.emit(false);
    this.flowService.selectedNode.emit(null);
  }

  onTypeChange(type: string) {
    if (!environment.production) {
      console.log(type);
    }
    this.currNode.options = { retry: {} };
    this.changesDone.emit()
  }

  onFormatChange(data: any, type: string) {
    if (!environment.production) {
      console.log(data, type);
    }
    if (!this.currNode.dataStructure) {
      this.currNode.dataStructure = {};
    }

    if (type == 'incoming') {
      this.currNode.dataStructure.incoming = data;
    }

    if (type == 'outgoing') {
      this.currNode.dataStructure.outgoing = data;
    }

    this.currNode.mappings = [];
    (this.currNode.onSuccess || []).forEach(item => {
      const temp = this.nodeList.find(r => r._id == item._id);
      if (temp && temp.type == 'MAPPING') {
        temp.mappings = [];
      }
    })
    this.changesDone.emit();
    this.flowService.dataStructureSelected.emit({ currNode: this.currNode, type });
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
    this.toggle['agentSelector'] = false;
    this.changesDone.emit()
  }

  removeAgent(data: any) {
    const index = this.currNode.options.agents.findIndex(e => e._id == data._id);
    if (index > -1) {
      this.currNode.options.agents.splice(index, 1);
    }
    this.changesDone.emit()
  }

  setFunctionEndpoint(data: any) {
    this.currNode.options.path = `/${this.commonService.app._id}/${this.appService.toCamelCase(data.name)}`
    this.changesDone.emit()
  }

  nodeNameChanged(value: string) {
    console.log(value);
    const oldId = this.currNode._id;
    const newId = _.snakeCase(value);
    // this.currNode._id = newId;
    let regex = new RegExp(`${oldId}`, 'g');
    let replacer = newId;
    console.log(regex, replacer);
    this.nodeList.forEach((item) => {
      let temp = this.appService.cloneObject(item);
      delete temp.dataStructure;
      let content = JSON.stringify(temp);
      let fixedNode = JSON.parse(content.replace(regex, replacer));
      _.merge(item, fixedNode);
    });
    // content = _.replace(content, regex, replacer);
    // content = content.replace(regex, replacer);
    // console.log(content);
    // JSON.parse(content);
    // console.log(JSON.stringify(this.nodeList), oldId, newId);
  }


  checkNameForUnique(value: string) {
    this.nodeNameErrorMessage = '';
    if (!value) {
      this.nodeNameErrorMessage = 'Node name cannot be empty.';
      return;
    }
    const matchDocs = this.flowService.nodeList.filter(e => e._id != this.currNode._id && _.camelCase(e.name) == _.camelCase(value));
    if (matchDocs && matchDocs.length > 0) {
      this.nodeNameErrorMessage = 'Duplicate node name.';
    }
  }

  get isInputNode() {
    if (this.flowData && this.currNode) {
      return this.flowData.inputNode._id == this.currNode._id;
    }
    return true;
    // return this.nodeList[0]._id == this.currNode._id;
  }
}
