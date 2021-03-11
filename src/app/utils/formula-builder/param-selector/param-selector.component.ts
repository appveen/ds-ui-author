import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { Definition } from '../../mapper/mapper.model';
import { FormulaBuilderService } from '../formula-builder.service';

@Component({
  selector: 'odp-param-selector',
  templateUrl: './param-selector.component.html',
  styleUrls: ['./param-selector.component.scss']
})
export class ParamSelectorComponent implements OnInit {

  @Input() sources: Array<Definition>;
  @Output() selected: EventEmitter<any>;
  functionList: Array<any>;
  constructor(private formulaService: FormulaBuilderService) {
    this.sources = [];
    this.functionList = this.formulaService.getFunctionList();
    this.selected = new EventEmitter();
  }

  ngOnInit(): void {
  }

  select(val, type) {
    this.selected.emit({
      type,
      val
    });
  }
}
