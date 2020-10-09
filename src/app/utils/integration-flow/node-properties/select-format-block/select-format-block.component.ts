import { Component, OnInit, Input } from '@angular/core';

import { NodeData, EditConfig, ActivateProperties, FlowData } from '../../integration-flow.model';
import { IntegrationFlowService } from '../../integration-flow.service';
import { MapperService } from 'src/app/utils/mapper/mapper.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'odp-select-format-block',
  templateUrl: './select-format-block.component.html',
  styleUrls: ['./select-format-block.component.scss']
})
export class SelectFormatBlockComponent implements OnInit {

  @Input() flowData: FlowData;
  @Input() edit: EditConfig;
  @Input() node: NodeData;
  @Input() nodeList: Array<NodeData>;
  @Input() index: number;
  constructor(private flowService: IntegrationFlowService,
    private mapperService: MapperService) {
    const self = this;
    self.node = self.flowService.nodeInstance();
    self.nodeList = [];
    self.edit = {
      status: false
    };
  }

  ngOnInit() {
    const self = this;
   
    if (!self.node.sourceFormat) {
      self.node.sourceFormat = {};
    }
    if (!self.node.targetFormat) {
      self.node.targetFormat = {};
    }
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

  setDataStructure(format) {
    const self = this;
    self.flowService.setDataStructure(format, self.node).then(resArr => {
      if (self.index > 0) {
        const sourceFormat = self.nodeList[self.index - 1].targetFormat;
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

  get restrictToFormat() {
    const self = this;
    if (self.node.meta.blockType === 'INPUT') {
      if (self.node.meta.sourceType === 'REST') {
        return ['JSON', 'XML'];
      } else if (self.node.meta.sourceType === 'SOAP') {
        return ['XML', 'WSDL-XML', 'JAXRPC-XML'];
      } else {
        return ['JSON', 'XML', 'CSV', 'EXCEL', 'DELIMITER', 'FLATFILE', 'BINARY'];
      }
    } else {
      if (self.node.meta.targetType === 'REST') {
        return ['JSON', 'XML', 'BINARY'];
      } else if (self.node.meta.targetType === 'SOAP') {
        return ['XML', 'WSDL-XML', 'JAXRPC-XML'];
      } else {
        return ['JSON', 'XML', 'CSV', 'EXCEL', 'DELIMITER', 'FLATFILE', 'BINARY'];
      }
    }
  }

  get errors() {
    const self = this;
    return self.flowService.getNodeErrors(self.flowData, self.node, self.index > 0 ? self.nodeList[self.index - 1] : null);
  }

  get soapBlock() {
    const self = this;
    if ((self.node.meta.sourceType === 'SOAP' || self.node.meta.targetType === 'SOAP')
      && self.node.meta.contentType !== 'XML') {
      return true;
    }
    return false;
  }
}
