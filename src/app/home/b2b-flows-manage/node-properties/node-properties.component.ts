import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';

import { AppService } from 'src/app/utils/services/app.service';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { environment } from 'src/environments/environment';
import { B2bFlowService } from '../b2b-flow.service';
import { OperatorFunction, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'odp-node-properties',
  templateUrl: './node-properties.component.html',
  styleUrls: ['./node-properties.component.scss'],
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
  searchTerm: string;
  path: string;
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
    const options: GetOptions = {
      filter: {
        app: this.commonService.app._id
      },
      select: 'agentId'
    }
    this.commonService.get('partnerManager', `/${this.commonService.app._id}/agent`, options).subscribe(res => {
      if (res) {
        const selected = this.currNode.options.agents;
        this.currNode.options.agents = [];
        res.some(r => selected?.find(e => {
          if (e._id == r._id) {
            this.currNode.options.agents.push(e)
          }
        }
        ))
      }
    });

    this.flowData.skipAuth = true;
    if (this.flowData?.inputNode?.type === 'FILE') {
      this.flowData.inputNode.options['contentType'] = 'multipart/form-data'
    }
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

  selectDataService(data: any) {
    this.currNode.dataStructure.outgoing = data;
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
    this.flowService.reCreatePaths.emit();
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


  formatter(result: any) {
    if (result && typeof result == 'object') {
      return result.label;
    }
    return result;
  };


  search: OperatorFunction<string, readonly { label: string, value: string }[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) => {
        const regex = /{{(?!.*}})(.*)/g;
        const matches = term.match(regex) || [];
        this.searchTerm = matches.length > 0 ? _.cloneDeep(matches).pop() : '';
        // term = term.split(' ').filter((ele) => ele.startsWith("{{") && !ele.endsWith("}")).pop() || '';
        // this.searchTerm = term;
        if (this.searchTerm) {
          term = this.searchTerm.replace('{{', '');
        }
        return matches.length === 0 && this.searchTerm === '' ? [] : this.variableSuggestions.filter((v) => v.label.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 15);
      }),
    );

  onValueChange(value: any) {
    this.currNode.options.url = value;
  }

  onPathAdd() {
    const inputDirectories = this.currNode.options?.inputDirectories ? _.cloneDeep(this.currNode.options.inputDirectories) : [];
    const pathObj = {
      path: this.path,
      watchSubDirecties: false
    }
    inputDirectories.push(pathObj);

    this.path = '';
    this.currNode.options['inputDirectories'] = inputDirectories;
    this.changesDone.emit();
  }

  removePath(index) {
    this.currNode.options['inputDirectories'].splice(index, 1);
  }

  toggleWatch(i) {
    this.currNode.options['inputDirectories'][i].watchSubDirecties = !this.currNode.options['inputDirectories'][i].watchSubDirecties;
  }

  get variableSuggestions() {
    return this.flowService.getSuggestions(this.currNode)
  }


  get isInputNode() {
    if (this.flowData && this.currNode) {
      return this.flowData.inputNode._id == this.currNode._id;
    }
    return true;
    // return this.nodeList[0]._id == this.currNode._id;
  }
  get showDataMapping() {
    if (this.flowData && this.currNode && this.prevNode) {
      return !_.isEmpty(this.prevNode.dataStructure?.outgoing);
    }
    return false;
    // return this.nodeList[0]._id == this.currNode._id;
  }

  get showInputSelector() {
    if (this.isInputNode) {
      return false;
    }
    if (this.currNode.type == 'ERROR') {
      return false;
    }
    if (this.currNode.type == 'CONVERT_JSON_JSON'
      || this.currNode.type == 'CONVERT_JSON_XML'
      || this.currNode.type == 'CONVERT_XML_JSON'
      || this.currNode.type == 'CONVERT_JSON_CSV'
      || this.currNode.type == 'CONVERT_CSV_JSON') {
      return false;
    }
    return true;
  }

  get checkForFileOptions() {
    if (this.currNode?.dataStructure?.outgoing?.formatType === 'EXCEL' || this.currNode?.dataStructure?.outgoing?.formatType === 'CSV' || this.currNode?.dataStructure?.outgoing?.formatType === 'DELIMITER') {
      return true
    }
    else {
      this.currNode.options['skipStartRows'] = null;
      this.currNode.options['skipEndRows'] = null;
      return false
    }
  }

  get showOutputSelector() {
    return this.currNode.type != 'ERROR'
      && this.currNode?.type != 'DATASERVICE'
      && this.currNode?.type != 'MAPPING'
      && this.currNode?.type != 'DEDUPE'
      && this.currNode?.type != 'CONFLICT'
      && this.currNode?.type != 'FILE_WRITE'
      && this.currNode?.type != 'TIMER'
      && this.currNode?.type != 'RESPONSE'
      && this.currNode.type != 'CONVERT_JSON_JSON'
      && this.currNode.type != 'CONVERT_JSON_XML'
      && this.currNode.type != 'CONVERT_XML_JSON'
      && this.currNode.type != 'CONVERT_JSON_CSV'
      && this.currNode.type != 'CONVERT_CSV_JSON';
  }
}
