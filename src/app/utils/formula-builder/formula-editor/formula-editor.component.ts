import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Definition } from '../../mapper/mapper.model';
import { MapperFunction } from '../formula-builder';

@Component({
  selector: 'odp-formula-editor',
  templateUrl: './formula-editor.component.html',
  styleUrls: ['./formula-editor.component.scss']
})
export class FormulaEditorComponent implements OnInit {

  @Input() function: MapperFunction;
  @Output() functionChange: EventEmitter<MapperFunction>;
  @Input() sources: Array<Definition>;
  toggleSelector: any;
  oldArgs: Array<any>;
  constructor() {
    this.functionChange = new EventEmitter();
    this.sources = [];
    this.toggleSelector = {};
    this.oldArgs = [];
  }

  ngOnInit(): void {
    console.log(this.function);
    if (this.function.args) {
      this.function.args.forEach(e => {
        delete e.type;
      });
      this.oldArgs = JSON.parse(JSON.stringify(this.function.args));
    }
  }

  removeArg(index) {
    this.function.args[index] = this.oldArgs[index];
  }

  selectedParam(item, arg) {
    this.hideSelector();
    if (item.type === 'DEDUCED') {
      Object.assign(arg, item.val);
    } else if (item.type === 'FIXED') {
      arg.value = item.val.properties.dataPath;
    } else {
      arg.value = item.val;
    }
    arg.type = item.type;
    console.log(item, arg);
  }

  hideSelector() {
    Object.keys(this.toggleSelector).forEach(key => {
      this.toggleSelector[key] = false;
    });
  }

  getSourceName(arg) {
    const temp = this.sources.find(e => e.properties.dataPath === arg.value);
    if (temp) {
      return temp.properties.name;
    }
    return 'N.A.';
  }
}
