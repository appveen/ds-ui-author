import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import Fuse from 'fuse.js';

@Component({
  selector: 'odp-target-fields',
  templateUrl: './target-fields.component.html',
  styleUrls: ['./target-fields.component.scss']
})
export class TargetFieldsComponent implements OnInit {

  @Input() fuzzyMapping: EventEmitter<any>;
  @Input() clearMapping: EventEmitter<any>;
  @Input() definition: any;
  @Input() sources: any;
  showAddSource: boolean;
  showFormulaEditor: boolean;
  constructor() {
    this.fuzzyMapping = new EventEmitter();
    this.clearMapping = new EventEmitter();
  }

  ngOnInit(): void {
    this.fuzzyMapping.subscribe(event => {
      const options = {
        includeScore: true,
        keys: ['dataPath', 'definition.dataPath']
      }
      const fuse = new Fuse(this.sources, options);
      const result = fuse.search(this.definition.dataPath);
      if (!this.definition.source) {
        this.definition.source = [];
      }
      if (this.definition.source.length == 0) {
        result.forEach(e => {
          this.definition.source.push(e.item);
        });
      }
    });
    this.clearMapping.subscribe(event => {
      if (this.definition.source.length > 0) {
        this.definition.source.splice(0);
      }
    });
  }

  removeSource(def: any, index: number) {
    if (def && def.source && def.source.length > 0) {
      def.source.splice(index, 1);
    }
  }

  sourceSelected(source: any) {
    if (!this.definition.source) {
      this.definition.source = [];
    }
    const index = this.definition.source.findIndex(e => e.dataPath == source.dataPath);
    if (index == -1) {
      this.definition.source.push(source);
    }
    this.showAddSource = false;
  }
}
