import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'odp-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent implements OnInit {

  @Input() color: string;
  @Output() colorChange: EventEmitter<string>;
  colors: Array<string>;
  selected: string;
  prevColor: string;
  constructor() {
    this.colorChange = new EventEmitter();
    this.colors = ['E91E63', '9C27B0', '673AB7', '3F51B5', '009688', '00BCD4', '03A9F4', '0082C9', '4CAF50', '8BC34A', 'CDDC39', 'EB5F66'];
  }

  ngOnInit() {
    this.prevColor = this.color;
  }

  getColorStyle(color: string) {
    return {
      background: '#' + color
    };
  }

  selectColor(color: string) {
    this.selected = color;
    this.colorChange.emit(color);
  }

  cancel() {
    this.selectColor(this.prevColor);
  }
}
