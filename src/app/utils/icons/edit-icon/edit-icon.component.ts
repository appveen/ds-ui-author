import { Component, Input } from '@angular/core';

@Component({
  selector: 'odp-edit-icon',
  templateUrl: './edit-icon.component.html',
  styleUrls: ['./edit-icon.component.scss']
})
export class EditIconComponent {

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
