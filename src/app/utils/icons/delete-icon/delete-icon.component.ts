import { Component, Input } from '@angular/core';

@Component({
  selector: 'odp-delete-icon',
  templateUrl: './delete-icon.component.html',
  styleUrls: ['./delete-icon.component.scss']
})
export class DeleteIconComponent {

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
