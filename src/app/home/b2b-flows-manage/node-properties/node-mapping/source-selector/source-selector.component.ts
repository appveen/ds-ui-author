import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { merge, Observable, OperatorFunction, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'odp-source-selector',
  templateUrl: './source-selector.component.html',
  styleUrls: ['./source-selector.component.scss']
})
export class SourceSelectorComponent implements OnInit {

  @Input() edit: any;
  @Input() sources: Array<any>;
  @Output() selected: EventEmitter<any>;
  flattenDefinition: Array<any>;
  focus$: Subject<string>;
  constructor() {
    this.sources = [];
    this.selected = new EventEmitter();
    this.flattenDefinition = [];
    this.edit = { status: false };
    this.focus$ = new Subject<string>()
  }

  ngOnInit(): void {
    this.flattenDefinition = [];
    console.log(this.sources);
    this.flattenDefinition = JSON.parse(JSON.stringify(this.flatten(this.sources)));
  }

  flatten(definition: any, parentDef?: any) {
    let arr = [];
    if (definition && definition.length > 0) {
      definition.forEach(def => {
        def.name = (parentDef ? parentDef.name + '->' + def.name : def.name) || def.dataPath;
        if (def.type == 'Object') {
          arr = arr.concat(this.flatten(JSON.parse(JSON.stringify(def.definition)), def));
        } else {
          def.definition = [];
          arr.push(def);
        }
      });
    }
    return arr;
  }

  search: OperatorFunction<string, readonly object[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const inputFocus$ = this.focus$;
    return merge(debouncedText$, inputFocus$).pipe(
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
  }

  formatter = (result: any) => result.name;

  selectItem(event: any) {
    this.selected.emit(event.item);
  }
}
