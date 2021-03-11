import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormulaBuilderService } from '../formula-builder.service';

@Component({
  selector: 'odp-function-selector',
  templateUrl: './function-selector.component.html',
  styleUrls: ['./function-selector.component.scss']
})
export class FunctionSelectorComponent implements OnInit {

  @Output() selectedFunction: EventEmitter<any>;
  functionList: Array<any>;
  constructor(private formulaService: FormulaBuilderService) {
    this.functionList = this.formulaService.getFunctionList();
    this.selectedFunction = new EventEmitter();
  }

  ngOnInit(): void {
  }

  selectFunction(obj) {
    this.selectedFunction.emit(obj);
  }
}
