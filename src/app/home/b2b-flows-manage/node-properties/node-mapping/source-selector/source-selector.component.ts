import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'odp-source-selector',
  templateUrl: './source-selector.component.html',
  styleUrls: ['./source-selector.component.scss']
})
export class SourceSelectorComponent implements OnInit {

  @Input() sources: Array<any>;
  @Output() selected: EventEmitter<any>;
  flattenDefinition: Array<any>;
  constructor() {
    this.sources = [];
    this.selected = new EventEmitter();
    this.flattenDefinition = [];
  }

  ngOnInit(): void {
    this.flattenDefinition = this.flatten(this.sources);
  }

  flatten(definition: any) {
    let arr = [];
    if (definition && definition.length > 0) {
      definition.forEach(def => {
        if (def.type == 'Object') {
          arr = arr.concat(this.flatten(def.definition));
        } else {
          def.definition = [];
          arr.push(def);
        }
      });
    }
    return arr;
  }

  search: OperatorFunction<string, readonly object[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) => {
        return this.flattenDefinition.filter((e) => {
          if (e.name) {
            return e.name.toLowerCase().indexOf(term.toLowerCase()) > -1
          } else if (e.dataPath) {
            return e.dataPath.toLowerCase().indexOf(term.toLowerCase()) > -1
          } else {
            return e.key.toLowerCase().indexOf(term.toLowerCase()) > -1
          }
        }).slice(0, 10)
      }),
    );

  formatter = (result: any) => result.name;

  selectItem(event: any) {
    this.selected.emit(event.item);
  }
}
