import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { map, catchError } from 'rxjs/operators';

import { IntegrationFlowService } from '../../integration-flow.service';
import { CommonService } from 'src/app/utils/services/common.service';
import { EditConfig, NodeData, ActivateProperties, FlowData } from '../../integration-flow.model';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-soap-block',
  templateUrl: './soap-block.component.html',
  styleUrls: ['./soap-block.component.scss']
})
export class SoapBlockComponent implements OnInit {

  @ViewChild('selectWSDLOperationTemplate', { static: true }) selectWSDLOperationTemplate;
  @Input() flowData: FlowData;
  @Input() edit: EditConfig;
  @Input() node: NodeData;
  @Input() nodeList: Array<NodeData>;
  @Input() index: number;
  @Input() partner: UntypedFormGroup;
  selectWSDLOperationTemplateRef: NgbModalRef;
  showLazyLoader: boolean;
  wsdlOperations: any;
  constructor(private flowService: IntegrationFlowService,
    private commonService: CommonService,
    private appService: AppService) {
    const self = this;
    self.node = self.flowService.nodeInstance();
  }

  ngOnInit() {
    const self = this;
  
  }

  wsdlContent(data) {
    const self = this;
    self.node.meta.wsdlContent = data;
    if (data) {
      self.getWSDLOperations().then(res => {
        self.selectWSDLOperationTemplateRef = self.commonService.modal(self.selectWSDLOperationTemplate);
        self.selectWSDLOperationTemplateRef.result.then(close => { }, dismiss => { });
      }).catch(err => {
        self.commonService.errorToast(err);
      });
    }
  }

  getWSDLOperations() {
    const self = this;
    self.showLazyLoader = true;
    return self.commonService.post('b2b', '/WSDLOperationsList', {
      wsdlContent: self.node.meta.wsdlContent
    }).pipe(
      map(data => {
        self.wsdlOperations = data;
        self.showLazyLoader = false;
        return data;
      }),
      catchError(err => {
        self.showLazyLoader = false;
        return err;
      })
    ).toPromise();
  }

  getWDSLStructure(res: any) {
    const self = this;
    self.showLazyLoader = true;
    return self.commonService.post('b2b', '/WSDLStructure', res).pipe(
      map(data => {
        self.showLazyLoader = false;
        return data;
      }),
      catchError(err => {
        self.showLazyLoader = false;
        return err;
      })
    ).toPromise();
  }

  selectWSDLOperation(operation: string, portType: string, bindingName: string) {
    const self = this;
    self.selectWSDLOperationTemplateRef.close(false);
    self.node.meta.operation = operation;
    self.getWDSLStructure({
      operation,
      portType,
      bindingName,
      wsdlContent: self.node.meta.wsdlContent,
      contentType: self.node.meta.contentType
    }).then(res => {
      const format = {
        _id: self.appService.randomID(5),
        name: 'custom',
        definition: res.inputStructure,
        type: 'custom',
        attributeCount: self.flowService.countAttr(JSON.parse(res.inputStructure)),
        formatType: self.node.meta.contentType
      };
      self.node.meta.inputName = res.inputName;
      self.node.meta.inputType = res.inputType;
      self.flowService.setDataStructure(format, self.node);
    }).catch(err => {
      self.commonService.errorToast(err);
    });
  }

  get soapBlock() {
    const self = this;
    if (self.node.meta.blockType === 'OUTPUT' && self.node.meta.targetType === 'SOAP') {
      return true;
    }
    return false;
  }
  get errors(): any {
    const self = this;
    return {};
  }
}
