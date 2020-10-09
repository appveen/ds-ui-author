import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: '[odp-add-node]',
  templateUrl: './add-node.component.html',
  styleUrls: ['./add-node.component.scss']
})
export class AddNodeComponent implements OnInit {

  @Input() index: number;
  @Output() add: EventEmitter<any>;
  constructor() {
    const self = this;
    self.index = 0;
    self.add = new EventEmitter();
  }

  ngOnInit() {
    const self = this;
  }

  onClick(event: any) {
    const self = this;
    self.add.emit(self.index);
  }
}
