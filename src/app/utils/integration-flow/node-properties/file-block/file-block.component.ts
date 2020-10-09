import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NodeData, EditConfig, ActivateProperties } from '../../integration-flow.model';
import { IntegrationFlowService } from '../../integration-flow.service';

@Component({
  selector: 'odp-file-block',
  templateUrl: './file-block.component.html',
  styleUrls: ['./file-block.component.scss']
})
export class FileBlockComponent implements OnInit {

  @Input() edit: EditConfig;
  node: NodeData;
  nodeList: Array<NodeData>;
  constructor(private flowService: IntegrationFlowService) {
    const self = this;
    self.node = self.flowService.nodeInstance();
  }

  ngOnInit() {
    const self = this;
    self.flowService.activateProperties.subscribe((data: ActivateProperties) => {
      self.nodeList = data.nodeList;
      self.node = self.nodeList[data.index];
    });
  }

}
