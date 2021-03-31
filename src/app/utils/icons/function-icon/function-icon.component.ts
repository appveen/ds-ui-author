import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'odp-function-icon',
  templateUrl: './function-icon.component.html',
  styleUrls: ['./function-icon.component.scss']
})
export class FunctionIconComponent implements OnInit {

  @Input() color: string;
  @Input() size: number;
  @Input() active: boolean;
  constructor() { }

  ngOnInit() {
    if (!this.color) {
      this.color = '666';
    }
    if (!this.size) {
      this.size = 36;
    }
  }

  get style() {
    if (!this.active) {
      return {
        stroke: `#${this.color}`
      };
    }
    return {};
  }

  get dimention() {
    return {
      width: `${this.size}px`,
      height: `${this.size}px`
    };
  }

}
