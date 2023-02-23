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
    this.colors = ['F44336', 'E91E63', '9C27B0', '3F51B5','2196F3', '26C6DA', '009688', '4CAF50', 'FFEB3B', 'FF9800', '795548', '78909C'];
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
