import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NodeData } from '../../integration-flow.model';

@Component({
  selector: '[odp-err-start]',
  templateUrl: './err-start.component.html',
  styleUrls: ['./err-start.component.scss']
})
export class ErrStartComponent implements OnInit {

  @Input() flowData: any;
  @Input() nodeList: Array<NodeData>;
  @Input() index: number;
  @Input() edit: any;
  @Output() clicked: EventEmitter<any>;
  constructor() {
    const self = this;
    self.flowData = {};
    self.nodeList = [];
    self.clicked = new EventEmitter();
  }

  ngOnInit() {
    const self = this;
  }

  onClick(event) {
    const self = this;
    if (self.edit.status) {
      self.clicked.emit(event);
    }
  }

  get hasResNodes() {
    const self = this;
    if (self.nodeList && self.nodeList.length > 0) {
      return true;
    }
    return false;
  }

}
