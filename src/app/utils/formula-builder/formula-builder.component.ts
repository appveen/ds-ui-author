import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, Renderer2 } from '@angular/core';
import { CommonService } from '../services/common.service';
import { FormulaBuilderService } from './formula-builder.service';
import { AppService } from '../services/app.service';
import { Mapping, Definition } from '../mapper/mapper.model';

@Component({
    selector: 'odp-formula-builder',
    templateUrl: './formula-builder.component.html',
    styleUrls: ['./formula-builder.component.scss']
})
export class FormulaBuilderComponent implements OnInit {

    @ViewChild('formulaRT', { static: false }) formulaRT: ElementRef;
    @Input() toggle: boolean;
    @Output() toggleChange: EventEmitter<boolean>;
    @Input() mapping: Mapping;
    @Input() mappingChange: EventEmitter<Mapping>;
    formula: Array<MapperFormula>;
    selectedFunction: MapperFunction;
    selectedArg: MapperFormula;
    functionList: Array<FunctionList>;

    constructor(private renderer: Renderer2,
        private appService: AppService,
        private commonService: CommonService,
        private formulaBuilderService: FormulaBuilderService) {
        const self = this;
        self.toggleChange = new EventEmitter();
        self.mappingChange = new EventEmitter();
        self.functionList = self.formulaBuilderService.getFunctionList();
        self.formula = [];
    }

    ngOnInit() {
        const self = this;
        if (self.mapping && self.mapping.target
            && self.mapping.target.properties._args
            && self.mapping.target.properties._args.length > 0
            && self.mapping.target.properties.operation) {
            const data: MapperFunction = {
                operation: self.mapping.target.properties.operation,
                _args: self.mapping.target.properties._args
            };
            self.formulaBuilderService.patchData(data);
            self.formula.push(data);
        }
    }

    collapseOthers() {
        const self = this;
        self.functionList.forEach(e => {
            e.selected = false;
        });
        return true;
    }

    dragFunction(f, $event) {
        const self = this;
        f.func = true;
        $event.dataTransfer.setData('text/plain', JSON.stringify(f));
    }

    dragAttribute(attribute, $event) {
        const self = this;
        attribute.attr = true;
        $event.dataTransfer.setData('text/plain', JSON.stringify(attribute));
    }

    back() {
        const self = this;
        self.toggleChange.emit(false);
    }

    done() {
        const self = this;
        if (self.formula && self.formula.length > 0) {
            const temp = self.formula[0];
            self.formulaBuilderService.cleanPayload(temp);
            self.mapping.target.properties.operation = temp.operation;
            self.mapping.target.properties._args = temp._args;
        }
        self.mappingChange.emit(self.mapping);
        self.toggleChange.emit(false);
    }


    addFunction(func: MapperFunction) {
        const self = this;
        const temp = self.appService.cloneObject(func);
        if (self.selectedArg) {
            self.selectedArg.type = 'DEDUCED';
            self.selectedArg.operationType = temp.operationType;
            self.selectedArg.label = temp.label;
            self.selectedArg.operation = temp.operation;
            self.selectedArg.description = temp.description;
            self.selectedArg._args = self.appService.cloneObject(temp._args);
            delete self.selectedArg.XPath;
            delete self.selectedArg.value;
        } else {
            if (self.formula.length === 0) {
                self.formula.push(temp);
            }
        }
        self.selectedArg = null;
    }

    removeFunction() {
        const self = this;
        if (self.selectedFunction && self.formula && self.formula.length > 0) {
            const temp: MapperFormula = self.formula[0];
            if (temp.operation === self.selectedFunction.operation) {
                self.formula.pop();
            } else {
                self.formulaBuilderService.removeFunction(temp, self.selectedFunction.operation);
            }
        }
        self.selectedFunction = null;
    }

    selectFunction(func: MapperFunction) {
        const self = this;
        self.selectedFunction = func;
    }

    selectArg(args: MapperFunctionArgs) {
        const self = this;
        self.selectedArg = args;
    }

    addAttribute(attribute: Definition) {
        const self = this;
        if (self.selectedArg) {
            self.selectedArg.type = 'FIXED';
            self.selectedArg.XPath = attribute.xpath;
            self.selectedArg.label = attribute.name;
            self.selectedArg.innerType = attribute.type;
        }
        self.selectedArg = null;
    }

    typedValue(event: KeyboardEvent) {
        const self = this;
        if (self.formulaBuilderService.restrictKey(event)) {
            return false;
        }
        if (self.selectedArg) {
            let val: any = (self.selectedArg.value || '');
            self.selectedArg.type = 'String';
            if (event.key === 'Backspace') {
                val = (val + '').split('');
                val.pop();
                if (!val.join('') || isNaN(val.join(''))) {
                    val = val.join('');
                } else {
                    val = parseFloat(val.join(''));
                    self.selectedArg.type = 'Number';
                }
            } else {
                if (isNaN(event.key as any) || event.key === ' ') {
                    val = val + event.key;
                } else {
                    const num = parseFloat(event.key);
                    const old = parseFloat(val) || 0;
                    self.selectedArg.type = 'Number';
                    val = (old * 10) + num;
                }
            }
            self.selectedArg.value = val;
            if (self.selectedArg.type === 'String' && val) {
                self.selectedArg.label = '"' + val + '"';
            } else {
                self.selectedArg.label = val + '';
            }
        }
    }

    get attributes(): Array<Definition> {
        const self = this;
        if (self.mapping && self.mapping.source) {
            return self.mapping.source;
        } else {
            return [];
        }
    }
}

export interface FunctionList {
    selected?: boolean;
    category?: string;
    items?: Array<MapperFunction>;
}
export interface MapperFunction {
    label?: string;
    type?: string;
    value?: string;
    XPath?: string;
    operation?: string;
    operationType?: string;
    description?: string;
    _args?: Array<MapperFunctionArgs>;
}

export interface MapperFunctionArgs {
    id?: string;
    type?: string;
    description?: string;
    value?: string;
}

export interface MapperFormula {
    id?: string;
    label?: string;
    type?: string;
    value?: string;
    XPath?: string;
    operation?: string;
    operationType?: string;
    description?: string;
    innerType?: string;
    _args?: Array<MapperFormula>;
}
