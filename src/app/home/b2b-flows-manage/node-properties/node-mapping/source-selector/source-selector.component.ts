import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'odp-source-selector',
  templateUrl: './source-selector.component.html',
  styleUrls: ['./source-selector.component.scss']
})
export class SourceSelectorComponent implements OnInit {

  @Input() sources: Array<any>;
  @Output() selected: EventEmitter<any>;
  constructor() {
    this.sources = [];
    this.selected = new EventEmitter();
  }

  ngOnInit(): void {
  }

  selectItem(item: any) {
    this.selected.emit(item);
  }
}
