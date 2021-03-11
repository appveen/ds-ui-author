import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Definition } from '../../mapper/mapper.model';

@Component({
  selector: 'odp-source-selector',
  templateUrl: './source-selector.component.html',
  styleUrls: ['./source-selector.component.scss']
})
export class SourceSelectorComponent implements OnInit {

  @Input() sources: Array<Definition>;
  @Output() selectedSource: EventEmitter<Definition>;
  constructor() {
    this.sources = [];
    this.selectedSource = new EventEmitter();
  }

  ngOnInit(): void {
  }

  selectSource(def) {
    this.selectedSource.emit(def);
  }
}
