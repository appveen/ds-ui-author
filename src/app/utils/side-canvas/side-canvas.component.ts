import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'odp-side-canvas',
  templateUrl: './side-canvas.component.html',
  styleUrls: ['./side-canvas.component.scss']
})
export class SideCanvasComponent {

  @Input() wide: boolean;
  @Input() toggle: boolean;
  @Output() toggleChange: EventEmitter<boolean>;
  constructor() {
    this.toggleChange = new EventEmitter();
  }
}
