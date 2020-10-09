import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'odp-fingerprint-icon',
  templateUrl: './fingerprint-icon.component.html',
  styleUrls: ['./fingerprint-icon.component.scss']
})
export class FingerprintIconComponent implements OnInit {

  @Input() color: string;
  @Input() size: number;
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
    return {
      stroke: `#${this.color}`
    };
  }

  get dimention() {
    return {
      width: `${this.size}px`,
      height: `${this.size}px`
    };
  }

}
