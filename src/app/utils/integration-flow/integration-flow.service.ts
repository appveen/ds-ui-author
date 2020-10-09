import { Injectable, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { NodeData, ActivateProperties, Format, FlowData } from './integration-flow.model';
import { CommonService, GetOptions } from '../services/common.service';
import { AppService } from '../services/app.service';
import { MapperService } from '../mapper/mapper.service';

@Injectable({
  providedIn: 'root'
})
export class IntegrationFlowService {

  onlyView: boolean;
  activateProperties: EventEmitter<ActivateProperties>;
  nodeSelected: EventEmitter<any>;
  deleteNode: EventEmitter<any>;
  autoMapped: EventEmitter<any>;
  nodeTypeChange: EventEmitter<any>;
  apiCache: { [key: string]: Promise<any> };
  formatFields: Array<string>;
  private subscriptions: any;
  private promises: Array<Promise<any>>;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private mapperService: MapperService) {
    const self = this;
    self.activateProperties = new EventEmitter<ActivateProperties>();
    self.deleteNode = new EventEmitter();
    self.nodeSelected = new EventEmitter();
    self.autoMapped = new EventEmitter();
    self.nodeTypeChange = new EventEmitter();
    self.subscriptions = {};
    self.apiCache = {};
    self.promises = [];
    self.formatFields = [
      '_id',
      'id',
      'name',
      'attributeCount',
      'type',
      'definition',
      'formatType',
      'excelType',
      'character',
      'length',
      'lineSeparator'
    ];
  }

  getMonth(index: number, full?: boolean) {
    const months = ['January', 'February', 'March', 'April', 'May',
      'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    index = index % 12;
    if (full) {
      return months[index];
    } else {
      return months[index].substr(0, 3);
    }
  }

  getWeek(index: any, full?: boolean) {
    if (typeof index === 'string') {
      index = parseInt(index, 10);
    }
    const weeks = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thrusday', 'Friday', 'Saturday'];
    index = index % 7;
    if (full) {
      return weeks[index];
    } else {
      return weeks[index].substr(0, 3);
    }
  }

  nodeInstance(data?: NodeData): NodeData {
    const temp: NodeData = {
      sourceFormat: {},
      targetFormat: {},
      meta: {
        connectionDetails: {},
        uniqueRemoteTransactionOptions: {},
        inputDirectories: [],
        outputDirectories: [],
        fileExtensions: [],
        fileDetails: {},
        ipList: [],
        secretIds: []
      },
      mapping: []
    };
    if (data) {
      Object.assign(temp, data);
    }
    return temp;
  }

  parseNodes(blocks: Array<NodeData>, noFormatDetails?: boolean) {
    const self = this;
    const nodes: Array<NodeData> = [];
    if (!blocks) {
      return nodes;
    }
    blocks.forEach((node: NodeData, i: number, a: Array<NodeData>) => {
      node.active = false;
      if (!node.meta.uniqueRemoteTransactionOptions) {
        node.meta.uniqueRemoteTransactionOptions = {};
      }
      if (!node.sourceFormat) {
        node.sourceFormat = {};
      }
      if (!node.targetFormat) {
        node.targetFormat = {};
      }
      if (!node.meta.connectionDetails) {
        node.meta.connectionDetails = {};
      }
      if (!node.meta.connectionDetails.trustAllCerts) {
        node.meta.connectionDetails.trustAllCerts = false;
      }
      if (node.mapping) {
        delete node.mapping;
      }
      if (!noFormatDetails && (node.sourceFormat && node.sourceFormat.type !== 'custom' && node.sourceFormat.type !== 'binary')) {
        const temp = self.getFormatDetails(node.sourceFormat);
        self.promises.push(temp);
        temp.then(res => {
          self.reBuildDefinition(node, 'sourceFormat');
        }, err => { });
      }
      if (!noFormatDetails && (node.sourceFormat && node.sourceFormat.type === 'binary')) {
        node.sourceFormat.definition = '{}';
        self.reBuildDefinition(node, 'sourceFormat');
      }
      if (!noFormatDetails && (node.targetFormat && node.targetFormat.type !== 'custom' && node.targetFormat.type !== 'binary')) {
        const temp = self.getFormatDetails(node.targetFormat);
        self.promises.push(temp);
        temp.then(res => {
          self.reBuildDefinition(node, 'targetFormat');
        }, err => { });
      }
      if (!noFormatDetails && (node.targetFormat && node.targetFormat.type === 'binary')) {
        node.targetFormat.definition = '{}';
        self.reBuildDefinition(node, 'targetFormat');
      }
      if (node.meta.blockType === 'PROCESS' && !node.meta.processType) {
        node.meta.processType = 'REQUEST';
      }
      if (node.meta.blockType === 'INPUT') {
        nodes.push(node);
      } else if (node.meta.blockType === 'PROCESS' && node.meta.processType === 'REQUEST') {
        const prevNode: NodeData = a[i - 1];
        let nextNode: NodeData;
        if (a.length > i + 1) {
          nextNode = a[i + 1];
        }
        if (prevNode && prevNode.meta.blockType === 'PROCESS' && prevNode.meta.processType === 'TRANSFORM') {
          node.mapping = prevNode.mapping;
          node.meta.xslt = prevNode.meta.xslt;
          if (typeof node.meta.xslt === 'string') {
            node.meta.xslt = JSON.parse(node.meta.xslt);
          }
        }
        if (!noFormatDetails && (node.meta.blockType === 'PROCESS'
          && (node.meta.formatType === 'nanoService' || node.meta.formatType === 'dataService'))) {
          const temp = self.getServiceDetails(node, nextNode);
          self.promises.push(temp);
          temp.then(res => {
            let sourcePromise = Promise.resolve();
            let targetPromise = Promise.resolve();
            if (!node.sourceFormat.definition) {
              sourcePromise = self.getFormatDetails(node.sourceFormat);
            }
            if (!node.targetFormat.definition) {
              targetPromise = self.getFormatDetails(node.targetFormat);
            }
            self.promises.push(sourcePromise);
            self.promises.push(targetPromise);
            sourcePromise.then(res => {
              self.reBuildDefinition(node, 'sourceFormat');
            }, err => { });
            targetPromise.then(res => {
              self.reBuildDefinition(node, 'targetFormat');
            }, err => { });
          }, err => { });
        }
        nodes.push(node);
      } else if (node.meta.blockType === 'OUTPUT') {
        const prevNode = a[i - 1];
        if (prevNode.meta.blockType === 'PROCESS' && prevNode.meta.processType === 'TRANSFORM') {
          node.mapping = prevNode.mapping;
          node.meta.xslt = prevNode.meta.xslt;
          if (typeof node.meta.xslt === 'string') {
            node.meta.xslt = JSON.parse(node.meta.xslt);
          }
        }
        nodes.push(node);
      }
    });
    Promise.all(self.promises).then(res => {
      self.promises = [];
      self.generateMappings(nodes);
    }).catch(err => {
      self.promises = [];
      self.generateMappings(nodes);
    });
    return nodes;
  }

  generateMappings(nodes: Array<NodeData>) {
    const self = this;
    nodes.forEach((node: NodeData, i: number) => {
      if (node.sourceFormat && node.sourceFormat.definition
        && node.meta && node.meta.xslt && i > 0) {
        const prevNode = nodes[i - 1];
        if (prevNode.targetFormat && prevNode.targetFormat.definition) {
          const sourceDefArray = self.mapperService.getSourceDefArray(prevNode.targetFormat.definition, prevNode.targetFormat.formatType);
          const mappings = self.mapperService.getMappings(sourceDefArray, node.sourceFormat.definition, node.meta.xslt);
          node.mapping = mappings;
        }
      }
    });
  }

  getFormatDetails(data: Format): Promise<any> {
    const self = this;
    const options: GetOptions = {
      select: 'name,definition,attributeCount,formatType,character,excelType,strictValidation,lineSeparator',
    };
    if (!data || !data.id || data.id === 'ERROR') {
      return Promise.resolve();
    }
    if (!self.apiCache[data.id]) {
      if (data.type === 'dataService') {
        self.apiCache[data.id] = self.commonService.get('serviceManager', '/service/' + data.id, options).toPromise();
      } else {
        self.apiCache[data.id] = self.commonService.get('partnerManager', '/dataFormat/' + data.id, options).toPromise();
      }
    }
    return new Promise((resolve, reject) => {
      self.subscriptions['getFormatDetails_' + data.id] = self.apiCache[data.id].then(res => {
        _.assign(data, res);
        data.lineSeparator = res.lineSeparator;
        if (data.type === 'dataService') {
          data.definition = JSON.parse(res.definition);
        } else {
          data.definition = JSON.parse(res.definition).definition;
        }
        resolve(data);
      }).catch(err => {
        self.commonService.errorToast(err);
        reject(err);
      });
    });
  }

  getServiceDetails(data: NodeData, nextNode: NodeData): Promise<any> {
    const self = this;
    const options: GetOptions = {};
    if (!data.meta || !data.meta.formatId) {
      return Promise.resolve();
    }
    if (!self.apiCache[data.meta.formatId]) {
      if (data.meta.formatType === 'dataService') {
        options.select = 'name,definition,attributeCount';
        self.apiCache[data.meta.formatId] = self.commonService
          .get('serviceManager', '/service/' + data.meta.formatId, options).toPromise();
      } else {
        self.apiCache[data.meta.formatId] = self.commonService
          .get('partnerManager', '/nanoService/' + data.meta.formatId, options).toPromise();
      }
    }
    return new Promise((resolve, reject) => {
      self.subscriptions['getServiceDetails_' + data.id] = self.apiCache[data.meta.formatId].then(res => {
        data.meta.formatName = res.name;
        if (data.meta.formatType === 'dataService') {
          data.sourceFormat.definition = JSON.parse(res.definition);
          data.sourceFormat.attributeCount = res.attributeCount;
          data.targetFormat.definition = JSON.parse(res.definition);
          data.targetFormat.attributeCount = res.attributeCount;
        } else {
          if (data.sourceFormat.id !== res.in.id) {
            data.meta.xslt = null;
            data.mapping = null;
          }
          if (data.targetFormat.id !== res.out.id && nextNode) {
            nextNode.meta.xslt = null;
            nextNode.mapping = null;
          }
          data.meta.connectionDetails.url = res.url;
          data.sourceFormat = res.in;
          data.targetFormat = res.out;
          if (!res.headers) {
            res.headers = [];
          }
          const tempHeaders = JSON.parse(JSON.stringify(res.headers));
          if (data.meta.customHeadersList && data.meta.customHeadersList.length > 0) {
            data.meta.customHeadersList.forEach(item => {
              const temp = tempHeaders.find(e => e.key === item.key);
              if (temp) {
                temp.value = item.value;
              } else {
                tempHeaders.push(item);
              }
            });
          }
          data.meta.customHeadersList = tempHeaders;
          if (data.meta.customHeadersList && data.meta.customHeadersList.length > 0) {
            data.meta.customHeadersList.forEach(item => {
              if (data.meta.customHeaders && data.meta.customHeaders[item.header]) {
                item.checked = true;
                item.value = data.meta.customHeaders[item.header];
              }
            });
          }
        }
        resolve(data);
      }).catch(err => {
        self.commonService.errorToast(err);
        reject(err);
      });
    });
  }

  reBuildDefinition(data: NodeData, type: string) {
    const self = this;
    if (!data[type].definition) {
      data[type].definition = {};
    }
    if (typeof data[type].definition === 'string') {
      data[type].definition = JSON.parse(data[type].definition);
    }
    const headers = self
      .convertHeadersToDefinition(data.meta.customHeadersList);
    if (headers) {
      data[type].definition['$headers'] = headers;
    } else {
      delete data[type].definition['$headers'];
    }
  }

  convertHeadersToDefinition(headersList: Array<any>) {
    const self = this;
    if (headersList && headersList.length > 0) {
      const definition = {
        type: 'Object',
        properties: {
          name: 'Headers',
          dataKey: '$headers'
        },
        definition: {}
      };
      headersList.filter(e => e.checked).forEach(item => {
        definition.definition[self.appService.toCamelCase(item.header)] = {
          type: 'String',
          properties: {
            name: item.header,
            dataKey: item.header
          }
        };
      });
      return definition;
    }
    return null;
  }

  convertHeader(prefix: string, key: string) {
    if (key) {
      return prefix + key.split(' ')
        .filter(e => e)
        .map(e => e.charAt(0).toUpperCase() + e.substr(1, e.length))
        .join('-');
    }
    return null;
  }

  getHeaders(headerList: Array<any>) {
    const self = this;
    const headers = {};
    headerList.forEach(e => {
      if (!e.header) {
        e.header = self.convertHeader('ODP-NS-', e.key);
      }
    });
    const selectedHeaders = headerList.filter(e => e.checked);
    selectedHeaders.forEach(e => {
      headers[e.header] = e.value;
    });
    return headers;
  }

  getAgents(type?: string) {
    const self = this;
    const options: GetOptions = {
      select: 'name,agentID,type',
      filter: {
        name: {
          $exists: true
        },
        app: self.commonService.app._id
      },
      count: -1,
      noApp: true
    };
    if (type) {
      options.filter.type = type;
    }
    return new Promise((resolve, reject) => {
      self.subscriptions['getAgents'] = self.commonService.get('partnerManager', '/agentRegistry', options).subscribe(res => {
        resolve(res);
      }, err => {
        reject(err);
      });
    });
  }

  getFileExtensions() {
    return [
      'json',
      'xml',
      'csv',
      'xls',
      'xlsx',
      'doc',
      'docx',
      'pdf',
      'jpg',
      'png',
      'gif',
    ];
  }

  getNodeErrors(flowData: FlowData, node: NodeData, prevNode?: NodeData) {
    const self = this;
    const temp: any = {};
    if (!node) {
      return temp;
    }
    if (!flowData) {
      flowData = {};
    }
   
    if (flowData && flowData.timer && flowData.timer.enabled && flowData.timer.startDate && flowData.timer.endDate) {
      const startDate = new Date(flowData.timer.startDate);
      const endDate = new Date(flowData.timer.endDate);
      if (startDate.getTime() >= endDate.getTime()) {
        temp.invalidStartEndDate = true;
      }
    }
    if (node.meta.blockType === 'OUTPUT'
      && node.meta.targetType !== 'FILE'
      && (!node.meta.connectionDetails.url || !this.appService.isValidURL(node.meta.connectionDetails.url))) {
      temp.invalidURL = true;
    }
    if (node.meta.blockType === 'INPUT' && !node.source && node.meta.contentType !== 'BINARY') {
      temp.invalidInputDataStructure = true;
    }
    if (node.meta.blockType === 'INPUT' && node.meta.sourceType === 'FILE'
      && node.meta.uniqueRemoteTransaction
      && node.meta.uniqueRemoteTransactionOptions
      && !(node.meta.uniqueRemoteTransactionOptions.fileName || node.meta.uniqueRemoteTransactionOptions.checksum)) {
      temp.invalidTransactionOptions = true;
    }
    if (node && node.meta.blockType === 'OUTPUT'
      && node.meta.targetType === 'FILE'
      && !node.meta.target) {
      temp.invalidAgent = true;
    }
    if (node && node.meta.blockType === 'INPUT'
      && node.meta.sourceType === 'FILE'
      && !node.meta.source) {
      temp.invalidAgent = true;
    }
    if (node.meta.blockType === 'OUTPUT' && !node.target && node.meta.contentType !== 'BINARY') {
      temp.invalidOutputDataStructure = true;
    }
    if (node.meta.blockType === 'PROCESS' && node.meta.formatType === 'dataService' && !node.meta.formatId) {
      temp.invalidDataService = true;
    }
    if (node.meta.blockType === 'PROCESS' && node.meta.formatType === 'nanoService' && !node.meta.formatId) {
      temp.invalidNanoService = true;
    }
    if (prevNode && prevNode.target !== node.source && !node.meta.xslt && node.meta.contentType !== 'BINARY') {
      temp.invalidMapping = true;
    }
    if (prevNode &&
      !(prevNode.targetFormat.type === 'binary' && node.sourceFormat.type === 'binary') &&
      (!node.meta.xslt || Object.keys(node.meta.xslt).length === 0)) {
      temp.invalidMapping = true;
    }
    if (prevNode &&
      ((prevNode.targetFormat.type === 'binary' && node.sourceFormat.type !== 'binary')
        || (prevNode.targetFormat.type !== 'binary' && node.sourceFormat.type === 'binary'))) {
      temp.invalidBinaryMapping = true;
    }
    let b2BAgentMaxFileSize = self.commonService.userDetails.b2BAgentMaxFileSize;
    if (!b2BAgentMaxFileSize) {
      b2BAgentMaxFileSize = '100k';
    }
    const unit = b2BAgentMaxFileSize.split('').pop();
    let fileMaxSize = parseInt(b2BAgentMaxFileSize.substr(0, b2BAgentMaxFileSize.length - 1), 10);
    if (unit.toLowerCase() === 'g') {
      fileMaxSize *= 1024 * 1024 * 1024;
    } else if (unit.toLowerCase() === 'm') {
      fileMaxSize *= 1024 * 1024;
    } else if (unit.toLowerCase() === 'k') {
      fileMaxSize *= 1024;
    }
    if (typeof node.meta.fileMaxSize === 'number'
      && node.meta.fileMaxSize !== 0
      && node.meta.fileMaxSize > fileMaxSize) {
      temp.invalidFileSize = true;
    }
    if (flowData.changedDependencies && flowData.changedDependencies.length > 0) {
      let changedCurr;
      let changedPrev;
      changedCurr = flowData.changedDependencies.find(e => e.entity === node.sourceFormat.type
        && e.id === node.sourceFormat.id);
      if (!changedCurr) {
        changedCurr = flowData.changedDependencies.find(e => e.entity === node.targetFormat.type
          && e.id === node.targetFormat.id);
      }
      if (changedCurr) {
        temp.currFormatChanged = true;
      }
      if (prevNode) {
        if (!prevNode.sourceFormat) {
          prevNode.sourceFormat = {};
        }
        if (!prevNode.targetFormat) {
          prevNode.targetFormat = {};
        }
        changedPrev = flowData.changedDependencies.find(e => e.entity === prevNode.sourceFormat.type
          && e.id === prevNode.sourceFormat.id);
        if (!changedPrev) {
          changedPrev = flowData.changedDependencies.find(e => e.entity === prevNode.targetFormat.type
            && e.id === prevNode.targetFormat.id);
        }
        if (changedPrev) {
          temp.prevFormatChanged = true;
        }
      }
    }
    return temp;
  }

  countAttr(def: any) {
    const self = this;
    return self.appService.countAttr(def);
  }

  setDataStructure(format: Format, node: NodeData) {
    const self = this;
    format.id = format._id;
    delete format._id;
    if (format.formatType === 'EXCEL') {
      node.meta.fileDetails = {
        excelType: format.excelType
      };
    }
    if (format.formatType === 'DELIMITER') {
      node.meta.character = format.character;
    }
    if (format.formatType === 'CSV') {
      node.meta.character = ',';
      if (!node.meta.fileDetails) {
        node.meta.fileDetails = {};
      }
      node.meta.fileDetails.lineSeparator = format.lineSeparator;
    }
    if (!format.formatType) {
      format.formatType = 'JSON';
      node.meta.contentType = 'JSON';
    } else {
      node.meta.contentType = format.formatType;
    }
    const tempId = self.appService.randomID(5);
    node.source = tempId;
    node.sourceFormat = {};
    self.formatFields.forEach(key => {
      node.sourceFormat[key] = format[key];
    });
    node.target = tempId;
    node.targetFormat = {};
    self.formatFields.forEach(key => {
      node.targetFormat[key] = format[key];
    });
    const arr = [];
    if (node.targetFormat.type !== 'custom' && node.targetFormat.type !== 'binary') {
      arr.push(new Promise((resolve, reject) => {
        self.getFormatDetails(node.targetFormat).then(res => {
          resolve(res);
          self.reBuildDefinition(node, 'targetFormat');
        }, reject);
      }));
    }
    if (node.sourceFormat.type !== 'custom' && node.sourceFormat.type !== 'binary') {
      arr.push(new Promise((resolve, reject) => {
        self.getFormatDetails(node.sourceFormat).then(res => {
          resolve(res);
          self.reBuildDefinition(node, 'sourceFormat');
        }, reject);
      }));
    }
    return Promise.all(arr);
  }

  patchPartnerAgent(blocks: Array<NodeData>, agent: any, direction: string) {
    try {
      blocks.forEach((e, i, a) => {
        let tempNode: NodeData;
        if (direction === 'Inbound') {
          tempNode = blocks[0];
        } else if (blocks.length > 1) {
          tempNode = blocks[blocks.length - 1];
        }
        if (tempNode && (tempNode.meta.sourceType === 'FILE' || tempNode.meta.targetType === 'FILE')) {
          tempNode.meta.source = agent.agentID;
          tempNode.meta.target = agent.agentID;
        }
      });
    } catch (e) { }
  }

  getTransformNodes(blocks: Array<NodeData>, lastNode: NodeData) {
    const self = this;
    const transformPhase = [];
    blocks.forEach((e, i, a) => {
     
      delete e.active;
      e.sequenceNo = (i + 1);
      if (e.sourceFormat && e.sourceFormat.definition && typeof e.sourceFormat.definition === 'object') {
        e.sourceFormat.definition = JSON.stringify(e.sourceFormat.definition);
      }
      if (e.targetFormat && e.targetFormat.definition && typeof e.targetFormat.definition === 'object') {
        e.targetFormat.definition = JSON.stringify(e.targetFormat.definition);
      }
      if (!e.meta.connectionDetails) {
        e.meta.connectionDetails = {};
      }
      e.meta.connectionDetails.multipartAttribute = 'fileName';
      if (i > 0 || lastNode) {
        let tempNode;
        if (lastNode) {
          tempNode = lastNode;
        } else {
          tempNode = a[i - 1];
        }
        delete tempNode.active;
        if ((e.meta.xslt || e.source !== tempNode.target)) {
          const temp: NodeData = self.appService.cloneObject(e);
          temp.meta.blockType = 'PROCESS';
          temp.meta.processType = 'TRANSFORM';
          temp.sourceFormat = JSON.parse(JSON.stringify(tempNode.targetFormat));
          temp.source = tempNode.target;
          temp.targetFormat = JSON.parse(JSON.stringify(e.sourceFormat));
          temp.target = e.source;
          if (!temp.meta.xslt) {
            temp.meta.xslt = '{}';
          }
          if (typeof temp.meta.xslt === 'object') {
            temp.meta.xslt = JSON.stringify(temp.meta.xslt);
          }
          delete temp.meta.formatId;
          delete temp.meta.formatName;
          delete temp.meta.connectionDetails;
          delete temp.meta.formatType;
          delete temp.meta.character;
          delete temp.meta.contentType;
          delete temp.meta.sourceType;
          delete temp.meta.targetType;
          delete temp.meta.source;
          delete temp.meta.target;
          delete temp.name;
          delete temp.mapping;
          transformPhase.push({ index: i, data: temp });
          delete e.mapping;
          delete e.meta.xslt;
        }
      }
      if (e.meta.customHeadersList && e.meta.customHeadersList.length > 0) {
        e.meta.customHeaders = self.getHeaders(e.meta.customHeadersList);
      }
    });
    return transformPhase;
  }

  getStructures(node: NodeData) {
    const t: any = {};
    if (node.target) {
      t.id = node.targetFormat.id;
      t.customId = node.target;
    }
    if (node.targetFormat && node.targetFormat.definition) {
      t.type = node.targetFormat.type;
      if (node.targetFormat.definition && typeof node.targetFormat.definition === 'string') {
        t.definition = JSON.parse(node.targetFormat.definition);
      }
      if (t.definition && t.definition._id) {
        t.definition._id.type = 'String';
        delete t.definition._id.counter;
        delete t.definition._id.suffix;
        delete t.definition._id.padding;
      }
      if (t.definition && typeof t.definition === 'object') {
        t.definition = JSON.stringify(t.definition);
      }
      t.meta = {
        contentType: node.targetFormat.formatType || 'JSON',
        character: node.targetFormat.character,
        lineSeparator: node.targetFormat.lineSeparator,
        strictValidation: node.targetFormat.strictValidation,
        wsdlContent: node.meta.wsdlContent,
        tagName: node.meta.inputName,
        tagType: node.meta.inputType,
        operation: node.meta.operation,
        part: 'INPUT'
      };
      if (node.meta.fileDetails && Object.keys(node.meta.fileDetails).length > 0) {
        t.meta.fileDetails = node.meta.fileDetails;
      }
    } else {
      t.definition = '{}';
      t.meta = {
        contentType: (node.targetFormat ? node.targetFormat.formatType : null) || 'JSON'
      };
    }
    return t;
  }

  getErrorNode() {
    const temp: NodeData = {};
    temp.target = 'ERROR';
    temp.meta = {
      connectionDetails: {},
      uniqueRemoteTransactionOptions: {},
      inputDirectories: [],
      outputDirectories: [],
      fileExtensions: [],
      fileDetails: {},
      ipList: [],
      secretIds: []
    };
    temp.targetFormat = {
      _id: 'ERROR',
      id: 'ERROR',
      name: 'ERROR',
      formatType: 'JSON',
      type: 'dataFormat',
      definition: JSON.stringify({
        appName: {
          type: 'String',
          properties: {
            name: 'App Name',
            dataKey: 'appName',
            dataPath: 'appName'
          }
        },
        partnerName: {
          type: 'String',
          properties: {
            name: 'Partner Name',
            dataKey: 'partnerName',
            dataPath: 'partnerName'
          }
        },
        partnerId: {
          type: 'String',
          properties: {
            name: 'Partner ID',
            dataKey: 'partnerId',
            dataPath: 'partnerId'
          }
        },
        flowName: {
          type: 'String',
          properties: {
            name: 'Flow Name',
            dataKey: 'flowName',
            dataPath: 'flowName'
          }
        },
        flowId: {
          type: 'String',
          properties: {
            name: 'Flow ID',
            dataKey: 'flowId',
            dataPath: 'flowId'
          }
        },
        message: {
          type: 'String',
          properties: {
            name: 'Message',
            dataKey: 'message',
            dataPath: 'message'
          }
        },
        stackTrace: {
          type: 'String',
          properties: {
            name: 'Stack Trace',
            dataKey: 'stackTrace',
            dataPath: 'stackTrace'
          }
        },
        statusCode: {
          type: 'String',
          properties: {
            name: 'Status Code',
            dataKey: 'statusCode',
            dataPath: 'statusCode'
          }
        },
        flowType: {
          type: 'String',
          properties: {
            name: 'Flow Type',
            dataKey: 'flowType',
            dataPath: 'flowType'
          }
        },
        nodeType: {
          type: 'String',
          properties: {
            name: 'Node Type',
            dataKey: 'nodeType',
            dataPath: 'nodeType'
          }
        },
        nodeId: {
          type: 'String',
          properties: {
            name: 'Node ID',
            dataKey: 'nodeId',
            dataPath: 'nodeId'
          }
        }
      })
    };
    return temp;
  }

  isInvalidIP(ip: string) {
    if (ip) {
      try {
        const segments = ip.split('.');
        const lastSeg = segments[3];
        const cidr = lastSeg.split('/');
        let flag = false;
        segments[3] = cidr[0];
        if (segments.length !== 4) {
          flag = true;
        }
        for (let i = 0; i < 4; i++) {
          if (!segments[i] || segments[i].match(/[^0-9]+/g)) {
            flag = true;
          }
          if (segments[i] !== '*' && (parseInt(segments[i], 10) < 0 || parseInt(segments[i], 10) > 255)) {
            flag = true;
          }
        }
        if (cidr.length > 1 && parseInt(cidr[1], 10) > 32) {
          flag = true;
        }
        return flag;
      } catch (e) {
        return true;
      }
    }
  }

  cleanBlock(node: NodeData) {
    if (node) {
      if (node.sourceFormat) {
        delete node.sourceFormat.definition;
      }
      if (node.targetFormat) {
        delete node.targetFormat.definition;
      }
      delete node.mapping;
      if (node.meta && node.meta.secretIds) {
        node.meta.secretIds = node.meta.secretIds.filter(e => e);
      }
    }
    return node;
  }
}
