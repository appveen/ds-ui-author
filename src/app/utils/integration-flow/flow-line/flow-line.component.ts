import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: '[odp-flow-line]',
  templateUrl: './flow-line.component.html',
  styleUrls: ['./flow-line.component.scss']
})
export class FlowLineComponent implements OnInit {

  @Input() y: number;
  @Input() width: number;
  @Input() arrow: boolean;
  @Input() type: string;
  constructor() {
    const self = this;
    self.y = 32;
    self.width = 36;
    self.arrow = false;
    self.type = 'request';
  }

  ngOnInit() {
  }

  get polygonPoints() {
    const self = this;
    return `${self.width - 5},28 ${self.width},32 ${self.width - 5},36`;
  }

}
