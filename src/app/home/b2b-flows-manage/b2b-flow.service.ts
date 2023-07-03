import { EventEmitter, Injectable } from '@angular/core';
import { AppService } from 'src/app/utils/services/app.service';
import * as _ from 'lodash';
import * as uuid from 'uuid/v1';
import { B2bPathService } from './b2b-path.service';

@Injectable({
  providedIn: 'root'
})
export class B2bFlowService {

  showAddNodeDropdown: EventEmitter<any>;
  selectedNode: EventEmitter<any>;
  deleteNode: EventEmitter<any>;
  reCreatePaths: EventEmitter<any>;
  selectedPath: EventEmitter<any>;
  anchorSelected: any;
  nodeLabelMap: any;
  dataStructureSelected: EventEmitter<any>;
  nodeList: Array<any>;
  nodeIDCounter: number;
  constructor(private appService: AppService,
    private pathService: B2bPathService) {
    this.showAddNodeDropdown = new EventEmitter();
    this.selectedNode = new EventEmitter();
    this.deleteNode = new EventEmitter();
    this.reCreatePaths = new EventEmitter();
    this.selectedPath = new EventEmitter();
    this.dataStructureSelected = new EventEmitter();
    this.nodeLabelMap = {
      FILE: 'File Agent',
      API_XML: 'Invoke API XML',
      API_MULTIPART: 'API Multipart Upload',
      TIMER: 'Timer',
      CODEBLOCK: 'Code Block',
      CONNECTOR: 'Connector',
      DATASERVICE: 'Data Service',
      FUNCTION: 'Function',
      MAPPING: 'Mapping',
      TRANSFORM: 'Transform',
      DEDUPE: 'De-Dupe',
      CONFLICT: 'Conflict',
      FOREACH: 'For Each',
      PLUGIN: 'Plugin',
      REDUCE: 'Reduce',
      UNWIND: 'Change Root',
      RESPONSE: 'Response',
      ERROR: 'Global Error',
      FILE_READ: 'File Reader',
      FILE_WRITE: 'File Writer',
      PARSE_JSON: "Parse JSON",
      PARSE_XML: "Parse XML",
      PARSE_CSV: "Parse CSV",
      CONVERT_JSON_JSON: "Convert JSON to JSON",
      CONVERT_JSON_XML: "Convert JSON to XML",
      CONVERT_XML_JSON: "Convert XML to JSON",
      CONVERT_JSON_CSV: "Convert JSON to CSV",
      CONVERT_CSV_JSON: "Convert CSV to JSON",
      SYSTEM: 'System Task',
      USER: 'User Task',
      EVENT: 'Event Trigger',
      DECISION: 'Decision'
    };
    this.nodeList = [];
    this.nodeIDCounter = 0;
  }

  getNodeType(node: any, isInputNode?: boolean) {
    if (node.type == 'API' && isInputNode) {
      if (node?.options?.contentType == 'multipart/form-data') {
        return 'API File Receiver';
      } else if (node?.options?.contentType == 'application/xml') {
        return 'API XML Receiver';
      } else {
        return 'API JSON Receiver';
      }
    } else if (node.type == 'API' && !isInputNode) {
      return 'Invoke API';
    } else if (node.type === 'PROCESS') {
      return 'Starter Node';
    } else if (this.nodeLabelMap[node.type]) {
      return this.nodeLabelMap[node.type];
    } else {
      return node.type;
    }
  }

  parseDynamicValue(value: any) {
    const configuredData: any = {};
    if (typeof value == 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const segments = value.split('.');
      let nodeSeg = segments[0];
      let nodeKeySeg = segments[1];
      let dateKeySeg = segments.splice(2).join('.');
      configuredData.node = nodeSeg.split('').slice(2, nodeSeg.length).join('');
      if (configuredData.node.startsWith('node[')) {
        configuredData.node = configuredData.node.split('').slice(6, configuredData.node.length - 2).join('');
      }
      if (dateKeySeg) {
        configuredData.nodeKey = nodeKeySeg;
        configuredData.dataKey = dateKeySeg.split('').slice(0, dateKeySeg.length - 2).join('');
      } else {
        configuredData.nodeKey = nodeKeySeg.split('').slice(0, nodeKeySeg.length - 2).join('');
      }
    }
    // else if (typeof value == 'string' && value.startsWith('node[')) {
    //   const charArr = value.split('');
    //   configuredData.node = charArr.slice(6, 12).join('');
    //   const nodeKeyIndexes = charArr.map((e, i) => e == '.' ? i : null).filter(e => e);
    //   if (nodeKeyIndexes.length == 1) {
    //     configuredData.nodeKey = charArr.slice(nodeKeyIndexes[0] + 1, charArr.length).join('');
    //   } else {
    //     configuredData.nodeKey = charArr.slice(nodeKeyIndexes[0] + 1, nodeKeyIndexes[1]).join('');
    //     configuredData.dataKey = charArr.slice(nodeKeyIndexes[1] + 1, charArr.length).join('');
    //   }
    // } 
    else {
      configuredData.customValue = value;
    }
    return configuredData;
  }

  getDynamicLabel(configuredData: any, nodeList: Array<any>) {
    let text = configuredData.customValue || '';
    if (configuredData && configuredData.node) {
      const nodeData = nodeList.find(e => e._id == configuredData.node);
      if (!nodeData) {
        return text;
      }
      text += nodeData.name || nodeData._id;
    }
    if (configuredData && configuredData.nodeKey) {
      text += '<span class="font-16">/</span>' + configuredData.nodeKey;
    }
    if (configuredData && configuredData.dataKey) {
      text += '<span class="font-16">/</span>' + configuredData.dataKey;
    }
    return text;
  }

  getDynamicValue(configuredData: any) {
    let text = configuredData.customValue || '';
    if (configuredData && configuredData.node) {
      text += `${configuredData.node}`;
    }
    if (configuredData && configuredData.nodeKey) {
      text += '.' + configuredData.nodeKey;
    }
    if (configuredData && configuredData.dataKey) {
      text += '.' + configuredData.dataKey;
    }
    return text;
  }

  getDynamicName(configuredData: any, nodeList: Array<any>) {
    let text = configuredData.customValue || '';
    if (configuredData && configuredData.node) {
      const nodeData = nodeList.find(e => e._id == configuredData.node);
      if (!nodeData) {
        return text;
      }
      text += nodeData.name || nodeData._id;
    }
    if (configuredData && configuredData.nodeKey) {
      text += '/' + configuredData.nodeKey;
    }
    if (configuredData && configuredData.dataKey) {
      text += '/' + configuredData.dataKey;
    }
    return text;
  }

  getNodeObject(type: string, nodeList: Array<any>, anotherInputNode: boolean = false) {
    if (this.nodeIDCounter == 0) {
      this.nodeIDCounter = this.nodeList.length;
    }
    this.nodeIDCounter++;
    let defaultName = this.getNodeType({ type, contentType: 'application/json' }, anotherInputNode) + ' ' + this.nodeIDCounter;
    while (nodeList.findIndex(e => e._id == _.snakeCase(defaultName)) > -1) {
      this.nodeIDCounter++;
      defaultName = this.getNodeType({ type, contentType: 'application/json' }, anotherInputNode) + ' ' + this.nodeIDCounter;
    }
    const temp: any = {
      // _id: this.appService.getNodeID(allIds),
      _id: _.snakeCase(defaultName),
      name: defaultName,
      type: type,
      onSuccess: [],
      onError: [],
      options: {
        method: 'POST',
        headers: {},
        contentType: 'application/json'
      },
      dataStructure: {
        outgoing: {}
      }
    };
    if (type == 'DATASERVICE') {
      temp.options.update = true;
      temp.options.insert = true;
    }

    if (type == 'FOREACH' || type == 'REDUCE') {
      temp.options.startNode = null;
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

  getNodesBefore(currNode: any) {
    let temp = [];
    let nodeId = '';
    if (typeof currNode == 'string') {
      nodeId = currNode;
    }
    else {
      nodeId = currNode._id;
    }
    let prevNode = this.nodeList.find(e => {
      let nexItems = _.concat((e.onSuccess || []), (e.onError || []));
      if (nexItems.find((es) => es._id == nodeId)) {
        return true;
      }
      return false;
    });
    if (prevNode) {
      temp.push(prevNode);
      temp = temp.concat(this.getNodesBefore(prevNode));
    }
    return temp;
  }

  generateLinkPath(origX: number, origY: number, destX: number, destY: number, sc: number) {
    return this.pathService.getElbowPath(origX, origY, destX, destY, sc);
  }

  cleanPayload(nodeList: Array<any>) {
    nodeList.forEach((node: any) => {
      if (node.onSuccess && node.onSuccess.length > 0) {
        let indexesToRemove = [];
        node.onSuccess.forEach((nextNode: any, index: number) => {
          if (nodeList.findIndex(e => e._id == nextNode._id) == -1) {
            indexesToRemove.push(index);
          }
          if (nextNode._id == node._id) {
            indexesToRemove.push(index);
          }
        });
        if (indexesToRemove.length > 0) {
          indexesToRemove.reverse();
          indexesToRemove.forEach((index: number) => {
            node.onSuccess.splice(index, 1);
          });
        }
      }
    });
  }

  jsonFromStructure(schema: any) {
    if (schema && schema.definition) {
      return this.convertDefinitionToJSON(schema.definition);
    }
    return {};
  }

  convertDefinitionToJSON(definition: Array<any>) {
    let temp = {};
    if (definition) {
      definition.forEach(item => {
        if (item.type == 'Array') {
          let arrayType = item.definition[0].type;
          temp[item.key] = [];
          if (arrayType == 'Object') {
            temp[item.key].push(this.convertDefinitionToJSON(item.definition[0].definition));
          } else {
            if (arrayType == 'Number') {
              temp[item.key].push(2023);
            } else if (arrayType == 'Boolean') {
              temp[item.key].push(true);
            } else if (arrayType == 'Date') {
              temp[item.key].push(new Date().toISOString());
            } else {
              temp[item.key].push('');
            }
          }
        } else if (item.type == 'Object') {
          temp[item.key] = this.convertDefinitionToJSON(item.definition);
        } else if (item.type == 'Number') {
          temp[item.key] = 2023;
        } else if (item.type == 'Boolean') {
          temp[item.key] = true;
        } else if (item.type == 'Date') {
          temp[item.key] = new Date().toISOString();
        } else {
          temp[item.key] = '';
        }
      });
    }
    return temp;
  }

  getNestedSuggestions(node: any, definition: Array<any>, parentKey?: any) {
    let list = [];
    if (definition && definition.length > 0) {
      definition.forEach((def: any) => {
        let key = parentKey ? parentKey + '.' + def.key : def.key;
        if (def.type == 'Object') {
          list = list.concat(this.getNestedSuggestions(node, def.definition, key));
        } else {
          let item: any = {};
          item.label = (node._id || node.type) + '/body/' + key;
          item.value = node._id + '.body.' + key;
          list.push(item);
          if (node.type == "DATASERVICE") {
            item = {};
            item.label = (node._id || node.type) + '/responseBody[0]/' + key;
            item.value = node._id + '.responseBody[0].' + key;
            list.push(item);
          } else {
            item = {};
            item.label = (node._id || node.type) + '/responseBody/' + key;
            item.value = node._id + '.responseBody.' + key;
            list.push(item);
          }
        }
      });
    }
    return list;
  }

  getSuggestions(currNode?): Array<{ label: string, value: string }> {
    if (!this.nodeList || this.nodeList.length == 0) {
      return [];
    }
    const list = currNode ? this.getNodesBefore(currNode) : this.nodeList;
    const temp = list.map(node => {
      let list = [];
      let statusCode: any = {};
      statusCode.label = (node._id || node.type) + '/statusCode'
      statusCode.value = node._id + '.statusCode'
      list.push(statusCode);
      let status: any = {};
      status.label = (node._id || node.type) + '/status'
      status.value = node._id + '.status'
      list.push(status);
      let headers: any = {};
      headers.label = (node._id || node.type) + '/headers'
      headers.value = node._id + '.headers'
      list.push(headers);
      if (!node.dataStructure) {
        node.dataStructure = {};
      }
      if (!node.dataStructure.outgoing) {
        node.dataStructure.outgoing = {};
      }
      if (node.dataStructure.outgoing.definition) {
        list = list.concat(this.getNestedSuggestions(node, node.dataStructure.outgoing.definition));
        // node.dataStructure.outgoing.definition.forEach(def => {
        //   let item: any = {};
        //   item.label = (node._id || node.type) + '/body/' + def.key;
        //   item.value =node._id + '.body.' + def.key;
        //   list.push(item);
        //   item = {};
        //   item.label = (node._id || node.type) + '/responseBody/' + def.key;
        //   item.value =node._id + '.responseBody.' + def.key;
        //   list.push(item);
        // });
      }
      else {
        let item: any = {};
        item.label = (node._id || node.type) + '/body';
        item.value = node._id + '.body';
        list.push(item);
        item = {};
        item.label = (node._id || node.type) + '/responseBody';
        item.value = node._id + '.responseBody';
        list.push(item);
      }
      return list;
    })
    return _.flatten(temp);
  }
}
