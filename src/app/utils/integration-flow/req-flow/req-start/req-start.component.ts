import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NodeData } from '../../../microflow/microflow.component';

@Component({
  selector: '[odp-req-start]',
  templateUrl: './req-start.component.html',
  styleUrls: ['./req-start.component.scss']
})
export class ReqStartComponent implements OnInit {

  @Input() flowData: any;
  @Input() nodeList: Array<NodeData>;
  @Input() index: number;
  @Input() edit: any;
  @Output() clicked: EventEmitter<any>;
  constructor() {
    const self = this;
    self.flowData = {};
    self.nodeList = [];
    self.edit = {};
    self.clicked = new EventEmitter();
  }

  ngOnInit() {
    const self = this;
  }

  onClick(event) {
    const self = this;
    self.clicked.emit(event);
  }

  get hasTimer() {
    const self = this;
    if (self.flowData && self.flowData.timer && self.flowData.timer.enabled) {
      return true;
    }
    return false;
  }

}
