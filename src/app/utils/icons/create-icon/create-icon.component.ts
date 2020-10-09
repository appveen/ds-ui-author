import { Component, Input } from '@angular/core';

@Component({
  selector: 'odp-create-icon',
  templateUrl: './create-icon.component.html',
  styleUrls: ['./create-icon.component.scss']
})
export class CreateIconComponent {

  @Input() size: number;
  constructor() { }

  get style() {
    return {
      'min-width': (this.size ? this.size : 60) + 'px',
      'max-width': (this.size ? this.size : 60) + 'px',
      'min-height': (this.size ? this.size : 60) + 'px',
      'max-height': (this.size ? this.size : 60) + 'px'
    };
  }
}
