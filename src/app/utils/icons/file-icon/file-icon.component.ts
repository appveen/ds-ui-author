import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'odp-file-icon',
  templateUrl: './file-icon.component.html',
  styleUrls: ['./file-icon.component.scss']
})
export class FileIconComponent implements OnInit {

  @Input() active: boolean;
  @Input() color: string;
  @Input() size: number;
  constructor() { }

  ngOnInit() {
    if (!this.color) {
      this.color = 'aaa';
    }
    if (!this.size) {
      this.size = 36;
    }
  }

  get style() {
    return {
      fill: `#${this.color}`,
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
