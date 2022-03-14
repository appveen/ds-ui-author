import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { NodeData, EditConfig, ActivateProperties, FlowData } from '../../integration-flow.model';
import { IntegrationFlowService } from '../../integration-flow.service';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { environment } from 'src/environments/environment';
import { MapperService } from 'src/app/utils/mapper/mapper.service';

@Component({
  selector: 'odp-select-service-block',
  templateUrl: './select-service-block.component.html',
  styleUrls: ['./select-service-block.component.scss']
})
export class SelectServiceBlockComponent implements OnInit, OnDestroy {

  @ViewChild('serviceSelectorModal', { static: true }) serviceSelectorModal;
  @Input() flowData: FlowData;
  @Input() edit: EditConfig;
  @Input() node: NodeData;
  @Input() nodeList: Array<NodeData>;
  @Input() index: number;
  @Input() propertyType: string;
  serviceList: Array<any>;
  serviceSelectorModalRef: NgbModalRef;
  constructor(private flowService: IntegrationFlowService,
    private mapperService: MapperService,
    private commonService: CommonService,
    private appService: AppService) {
    const self = this;
    self.node = self.flowService.nodeInstance();
    self.nodeList = [];
    self.serviceList = [];
    self.edit = {
      status: false
    };
  }

  ngOnInit() {
    const self = this;
   
    if (self.index > 0 && !self.node.mapping) {
      const sourceFormat = self.nodeList[self.index - 1].targetFormat;
      const targetFormat = self.node.sourceFormat;
      if (sourceFormat && sourceFormat.type && targetFormat && targetFormat.type
        && sourceFormat.formatType !== 'BINARY' && targetFormat.formatType !== 'BINARY'
        && (!self.node.mapping || self.node.mapping.length === 0)) {
        const sourceDefArray = self.mapperService.getSourceDefArray(sourceFormat.definition, sourceFormat.formatType);
        const mappings = self.mapperService.getMappings(sourceDefArray, targetFormat.definition, self.node.meta.xslt);
        self.node.mapping = mappings;
       
      }
    }
  }

  ngOnDestroy() {
    const self = this;
    if (self.serviceSelectorModalRef) {
      self.serviceSelectorModalRef.close();
    }
  }

  getAttributeCount(definition: any) {
    const self = this;
    if (typeof definition === 'string') {
      definition = JSON.parse(definition);
    }
    return self.flowService.countAttr(definition);
  }

  openSearchService() {
    const self = this;
    self.serviceList = [];
    self.serviceSelectorModalRef = self.commonService.modal(self.serviceSelectorModal, { centered: true, size: 'lg' });
    self.serviceSelectorModalRef.result.then(close => {
      if (close) {
        const temp = self.serviceList.find(e => e.selected);
        self.setService(temp);
      }
      self.serviceList = [];
    }, dismiss => {
      self.serviceList = [];
    });
  }

  setService(format: any) {
    const self = this;
    self.removeDataStructure();
    self.node.meta.formatId = format._id;
    self.node.meta.formatName = format.name;
    if (self.node.meta.formatType === 'dataService') {
      self.node.source = self.appService.randomID(5);
      self.node.sourceFormat = {};
      self.node.sourceFormat.name = format.name;
      self.node.sourceFormat.id = format._id;
      self.node.sourceFormat.attributeCount = format.attributeCount;
      self.node.sourceFormat.type = 'dataService';
      self.node.sourceFormat.formatType = 'JSON';
      self.node.target = self.appService.randomID(5);
      self.node.targetFormat = {};
      self.node.targetFormat.name = format.name;
      self.node.targetFormat.id = format._id;
      self.node.targetFormat.attributeCount = format.attributeCount;
      self.node.targetFormat.type = 'dataService';
      self.node.targetFormat.formatType = 'JSON';
    } else {
      self.node.sourceFormat = {};
      self.node.source = self.appService.randomID(5);
      self.flowService.formatFields.forEach(key => {
        self.node.sourceFormat[key] = format.in[key];
      });
      self.node.targetFormat = {};
      self.node.target = self.appService.randomID(5);
      self.flowService.formatFields.forEach(key => {
        self.node.targetFormat[key] = format.out[key];
      });
      self.node.meta.connectionDetails = {};
      self.node.meta.contentType = format.in.formatType;
      self.node.meta.connectionDetails.url = format.url;
      self.node.meta.connectionDetails.connectionType = 'PLAIN';
    }
    self.node.meta.customHeadersList = format.headers;
    if (self.node.meta.customHeadersList && self.node.meta.customHeadersList.length > 0) {
      self.node.meta.customHeadersList.forEach(item => {
        item.checked = true;
      });
    }
    const arr = [];
    if (self.node.sourceFormat && self.node.sourceFormat.id && self.node.sourceFormat.type !== 'custom') {
      arr.push(new Promise((resolve, reject) => {
        self.flowService.getFormatDetails(self.node.sourceFormat).then(res => {
          resolve(res);
          self.flowService.reBuildDefinition(self.node, 'sourceFormat');
        }, reject);
      }));
    }
    if (self.node.targetFormat && self.node.targetFormat.id && self.node.targetFormat.type !== 'custom') {
      arr.push(new Promise((resolve, reject) => {
        self.flowService.getFormatDetails(self.node.targetFormat).then(res => {
          resolve(res);
          self.flowService.reBuildDefinition(self.node, 'targetFormat');
        }, reject);
      }));
    }
    Promise.all(arr).then(resArr => {
      if (self.index > 0 || this.propertyType === 'error') {
        let sourceFormat;
        if (this.propertyType === 'error') {
          sourceFormat = self.flowService.getErrorNode().targetFormat;
        } else {
          sourceFormat = self.nodeList[self.index - 1].targetFormat;
        }
        const targetFormat = self.node.sourceFormat;
        if (sourceFormat && sourceFormat.type && targetFormat && targetFormat.type
          && sourceFormat.formatType !== 'BINARY' && targetFormat.formatType !== 'BINARY') {
          const sourceDefArray = self.mapperService.getSourceDefArray(sourceFormat.definition, sourceFormat.formatType);
          const mappings = self.mapperService.getMappings(sourceDefArray, targetFormat.definition);
          const xslt = self.mapperService.getXSLT(mappings, sourceDefArray, targetFormat.definition);
          if (!environment.production) {
            console.log('XSLT', xslt);
          }
          self.node.meta.xslt = xslt;
          self.node.mapping = mappings;
          self.flowService.autoMapped.emit({
            sourceFormat,
            targetFormat
          });
        }
      }
    }).catch(errArr => {
      if (!environment.production) {
        console.log(errArr);
      }
    });
    self.serviceList = [];
  }

  searchService(searchTerm: string) {
    const self = this;
    const options: GetOptions = {
      filter: {
        name: '/' + searchTerm + '/'
      },
      count: 20
    };
    let request;
    if (self.node.meta.formatType === 'dataService') {
      options.select = '_id,app,name,definition';
      request = self.commonService.get('serviceManager', `/${this.commonService.app._id}/service`, options);
    } else {
      request = self.commonService.get('partnerManager', '/nanoService', options);
    }
    request.subscribe(res => {
      self.serviceList = res;
    }, err => {
      self.commonService.errorToast(err);
    });
  }

  selectService(item: any) {
    const self = this;
    self.serviceList.forEach(e => e.selected = false);
    item.selected = true;
  }

  removeDataStructure() {
    const self = this;
    self.node.source = null;
    self.node.sourceFormat = {};
    self.node.target = null;
    self.node.targetFormat = {};
    self.node.meta.xslt = null;
    self.node.mapping = null;
    self.node.meta.formatId = null;
    self.node.meta.formatName = null;
    if (self.nodeList.length - 1 > self.index) {
      self.nodeList[self.index + 1].mapping = null;
      self.nodeList[self.index + 1].meta.xslt = null;
    }
    delete self.node.meta.contentType;
  }


  get isServiceSelected() {
    const self = this;
    return self.serviceList.filter(e => e.selected).length > 0;
  }

  get errors() {
    const self = this;
    return self.flowService.getNodeErrors(self.flowData, self.node, self.index > 0 ? self.nodeList[self.index - 1] : null);
  }

}
