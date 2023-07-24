import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';

import { CommonService } from 'src/app/utils/services/common.service';
import { B2bFlowService } from '../../../b2b-flow.service';
import { MappingService } from '../mapping.service';

@Component({
  selector: 'odp-formula-editor',
  templateUrl: './formula-editor.component.html',
  styleUrls: ['./formula-editor.component.scss']
})
export class FormulaEditorComponent implements OnInit {

  @Input() data: any;
  @Input() edit: any;
  @Output() dataChange: EventEmitter<any>;
  @Output() close: EventEmitter<any>;
  tempData: any;
  fetchingFormulas: boolean;
  availableMethods: Array<any>;
  searchTerm: string;
  usedFormulas: Array<any>;
  selectedSource: any;
  selectedFormula: any;
  selectedParam: any;
  constructor(private flowService: B2bFlowService,
    private mappingService: MappingService,
    private commonService: CommonService) {
    this.dataChange = new EventEmitter();
    this.close = new EventEmitter();
    this.availableMethods = [];
    this.usedFormulas = [];
    this.edit = {
      status: false
    }
  }

  ngOnInit(): void {
    this.tempData = JSON.parse(JSON.stringify(this.data));
    this.usedFormulas = this.data.formulaConfig;
    this.fetchAllFormulas();
  }

  fetchAllFormulas() {
    this.fetchingFormulas = true;
    let options: any = {
      count: 10,
      page: 1,
      noApp: true
    };
    if (this.searchTerm) {
      options.filter = {
        name: `/${this.searchTerm}/`
      };
    }
    this.commonService.get('user', '/admin/metadata/mapper/formula', options).subscribe(res => {
      this.availableMethods = res;
      this.availableMethods.forEach(item => {
        if (!item.params) {
          item.params = [];
        }
        item.params.forEach(p => {
          if (!p.type) {
            p.type = 'String';
          }
        });
      });
      this.fetchingFormulas = false;
    }, err => {
      this.fetchingFormulas = false;
      this.commonService.errorToast(err);
    })
  }

  cancel() {
    this.close.emit(false);
    this.data = this.tempData;
  }

  done() {
    this.close.emit(false);
    if (this.usedFormulas.length > 0) {
      this.data.formulaConfig = this.usedFormulas;
    } else {
      this.data.formulaConfig = null;
    }
    this.dataChange.emit(this.data);
  }

  getDataTypeStyleClass(type: string) {
    switch (type) {
      case 'String':
        return 'text-success';
      case 'Number':
        return 'text-warning';
      case 'Boolean':
        return 'text-info';
      case 'Object':
        return 'text-grey';
      case 'Array':
        return 'text-grey';
      default:
        return 'text-primary';
    }
  }

  getLableAsArray(label: string) {
    if (label) {
      return label.split('/');
    }
    return [];
  }

  get sourceList() {
    return this.data.source || []
  }

  onSourceDrag(event: any, source: any) {
    this.selectedSource = source;
  }

  onFunctionDrag(event: any, fn: any) {
    this.selectedFormula = fn;
  }

  onDrop(event: any) {
    if (!this.usedFormulas) {
      this.usedFormulas = [];
    }
    if (this.selectedFormula && this.usedFormulas.length == 1) {
      let temp = this.usedFormulas[0];
      if (temp && temp.type && temp.properties) {
        this.usedFormulas.splice(0);
        let t = JSON.parse(JSON.stringify(this.selectedFormula));
        t.params[0].substituteVal = temp;
        this.usedFormulas.push(t);
      }
    } else if (this.selectedFormula && this.usedFormulas.length == 0) {
      this.usedFormulas.push(JSON.parse(JSON.stringify(this.selectedFormula)));
    } else if (this.selectedSource && this.usedFormulas.length == 0) {
      this.usedFormulas.push(JSON.parse(JSON.stringify(this.selectedSource)));
    }
    this.selectedFormula = null;
    this.selectedSource = null;
  }

  onParamDrop(event: any, formula: any, param: any) {
    param.over = false;
    console.log(formula, param);
    if (this.selectedSource) {
      param.substituteVal = JSON.parse(JSON.stringify(this.selectedSource));
    } else if (this.selectedFormula) {
      param.substituteFn = JSON.parse(JSON.stringify(this.selectedFormula));
    }
  }

  removeUsedFn(item: any, index: number) {
    this.usedFormulas.splice(index, 1);
  }
}
