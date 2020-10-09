import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'odp-key-icon',
  templateUrl: './key-icon.component.html',
  styleUrls: ['./key-icon.component.scss']
})
export class KeyIconComponent implements OnInit {

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
