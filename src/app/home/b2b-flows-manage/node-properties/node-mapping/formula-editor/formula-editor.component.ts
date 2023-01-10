import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'odp-formula-editor',
  templateUrl: './formula-editor.component.html',
  styleUrls: ['./formula-editor.component.scss']
})
export class FormulaEditorComponent implements OnInit {

  @Input() edit: any;
  @Input() definition: any;
  @Input() toggle: boolean;
  @Output() toggleChange: EventEmitter<boolean>;
  constructor() {
    this.toggleChange = new EventEmitter();
    this.edit = { status: false };
  }

  ngOnInit(): void {
    if (!this.definition.formula) {
      this.definition.formula = this.baseCode;
    }
  }

  close(flag: boolean) {
    this.toggleChange.emit(flag);
  }

  get baseCode() {
    return 'return ' + (this.definition.source || []).map((src, i) => {
      return 'input' + (i + 1);
    }).join(' + ') + ';';
  }
}
