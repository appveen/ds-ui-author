import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'odp-radio-chip',
  templateUrl: './radio-chip.component.html',
  styleUrls: ['./radio-chip.component.scss']
})
export class RadioChipComponent {
  @Input() label: boolean;
  @Input() checked: boolean;
  @Input() editable: boolean = true;
  @Input() loading: boolean = false;
  @Output() checkedChange: EventEmitter<boolean>;

  constructor() {
    this.checkedChange = new EventEmitter();
  }

  onChange() {
    this.checkedChange.emit(!this.checked);
  }

}
