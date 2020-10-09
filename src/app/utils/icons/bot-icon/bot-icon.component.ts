import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'odp-bot-icon',
  templateUrl: './bot-icon.component.html',
  styleUrls: ['./bot-icon.component.scss']
})
export class BotIconComponent implements OnInit {

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
        fill: `#${this.color}`,
        stroke: 'none'
      };
    }
    return {
      stroke: 'none'
    };
  }

  get dimention() {
    return {
      width: `${this.size}px`,
      height: `${this.size}px`
    };
  }
}
