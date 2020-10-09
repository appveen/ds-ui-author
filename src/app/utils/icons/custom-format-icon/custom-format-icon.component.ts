import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'odp-custom-format-icon',
  templateUrl: './custom-format-icon.component.html',
  styleUrls: ['./custom-format-icon.component.scss']
})
export class CustomFormatIconComponent implements OnInit {

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
          fill: `#${this.color}`
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
