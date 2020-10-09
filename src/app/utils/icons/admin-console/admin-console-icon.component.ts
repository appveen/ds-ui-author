import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'odp-admin-console-icon',
  templateUrl: './admin-console-icon.component.html',
  styleUrls: ['./admin-console-icon.component.scss']
})
export class AdminConsoleIconComponent implements OnInit {

  @Input() color: string;
  @Input() size: number;
  constructor() { }

  ngOnInit() {
    if (!this.color) {
      this.color = 'FF6600';
    }
    if (!this.size) {
      this.size = 36;
    }
  }

  get style() {
    return {
      fill: `#${this.color}`
    };
  }

  get dimention() {
    return {
      width: `${this.size}px`,
      height: `${this.size}px`
    };
  }
}
