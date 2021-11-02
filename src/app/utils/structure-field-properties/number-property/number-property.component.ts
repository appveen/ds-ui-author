import { Component, ViewChild, Input, TemplateRef, OnDestroy, AfterViewChecked } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, FormArray, AbstractControl } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { CommonService } from '../../services/common.service';

@Component({
  selector: 'odp-number-property',
  templateUrl: './number-property.component.html',
  styleUrls: ['./number-property.component.scss']
})
export class NumberPropertyComponent implements AfterViewChecked, OnDestroy {
  @ViewChild('deleteModalTemplate', { static: false }) deleteModalTemplate: TemplateRef<HTMLElement>;
  @Input() mainForm: FormGroup;
  @Input() form: FormGroup;
  @Input() edit: any;
  @Input() isLibrary: boolean;
  @Input() isDataFormat: boolean;
  @Input() type;
  @Input() formatType: string;
  deleteModal: any;
  deleteModalTemplateRef: NgbModalRef;
  editStateListOfValues: number = null;

  constructor(private commonService: CommonService,
    private fb: FormBuilder) {
    const self = this;
    self.edit = {};
    self.deleteModal = {};
  }

  ngAfterViewChecked() {
    const defaultValue = this.form.get('properties.default').value
    if (this.form.get('properties.default') && defaultValue != null && defaultValue != undefined) {
      this.validateNumbDefaultValue(this.form.get('properties.default').value, this.form.get('properties'))
    }
  }

  ngOnDestroy() {
    const self = this;
    if (self.deleteModalTemplateRef) {
      self.deleteModalTemplateRef.close(false);
    }
  }

  sortableOnMove = (event: any) => {
    return !event.related.classList.contains('disabled');
  }

  sortableOnUpdate = (event: any) => {
    const self = this;
    if (this.editStateListOfValues === event.oldIndex) {
      this.editStateListOfValues = event.newIndex;
    } else if (this.editStateListOfValues === event.newIndex) {
      const diff = event.newIndex - (event.oldIndex || 0);
      this.editStateListOfValues = event.newIndex + (diff > 0 ? -1 : 1);
    }

    let enums = self.form.get(['properties', 'enum']).value;

    if (event.newIndex == 0 && self.checkStateModel()) {
      let newInitialState = enums[event.oldIndex];
      self.mainForm.get(['stateModel', 'initialStates']).patchValue([newInitialState]);
    }

    if (self.checkStateModel()) {
      let temp: any = enums[event.oldIndex];
      enums[event.oldIndex] = enums[event.newIndex];
      enums[event.newIndex] = temp;
      (self.form.get(['properties', 'enum']) as FormArray).clear();
      for (let state of enums) {
        (self.form.get(['properties', 'enum']) as FormArray).push(new FormControl(state));
      }
    }

  }

  reCalibrateDefaultValue(type, value, prop: AbstractControl) {
    const self = this;
    if (prop.get('default')) {
      const defaultValue = prop.get('default').value;
      if (type === 'min') {
        if (defaultValue && defaultValue < value) {
          self.setError(type, prop);
        } else if ((prop.get('default')).getError(type)) {
          self.deleteError(type, prop);
        }
      } else if (type === 'max') {
        if (defaultValue && defaultValue > value) {
          self.setError(type, prop);
        } else if ((prop.get('default')).getError(type)) {
          self.deleteError(type, prop);
        }
      } else if (type === 'precision') {
        const isDotPresent = (prop.get('default').value + '').split('.').length > 1;
        if (isDotPresent) {
          const precision = (prop.get('default').value + '').split('.')[1].length;
          if (defaultValue && precision > value) {
            self.setError(type, prop);
          } else if ((prop.get('default')).getError(type)) {
            self.deleteError(type, prop);
          }
        }
      }
    }
  }

  setError(type, prop: AbstractControl) {
    let errors = ((prop as FormGroup).get('default')).errors;
    if (!errors) {
      errors = {};
    }
    errors[type] = true;
    (prop.get('default')).setErrors(errors);
  }

  deleteError(type, prop: AbstractControl) {
    let errors = (prop.get('default')).errors;
    if (errors) {
      delete errors[type];
      if (Object.keys(errors).length === 0) {
        errors = null;
      }
    }
    (prop.get('default')).setErrors(errors);
  }

  checkMinMax(prop: AbstractControl) {
    const self = this;
    if (prop.get('min').value) {
      const control = prop.get('min');
      const prcsn = prop.get('precision');
      if (prcsn && prcsn.value > 0) {
        const precision = Math.pow(10, prcsn.value);
        control.patchValue(Math.round(parseFloat(control.value) * precision) / precision);
      } else {
        control.patchValue(Math.round(parseFloat(control.value)));
      }
    }
    if (prop.get('max').value) {
      const control = prop.get('max');
      const prcsn = prop.get('precision');
      if (prcsn && prcsn.value > 0) {
        const precision = Math.pow(10, prcsn.value);
        control.patchValue(Math.round(parseFloat(control.value) * precision) / precision);
      } else {
        control.patchValue(Math.round(parseFloat(control.value)));
      }
    }
  }

  clearList(control, flag?: boolean) {
    const self = this;
    this.editStateListOfValues = null;
    if (!flag) {
      self.deleteModal.title = 'Clear List';
      self.deleteModal.message = 'Are you sure you want to clear list?';
      self.deleteModal.showButtons = true;
      self.deleteModalTemplateRef = self.commonService.modal(self.deleteModalTemplate);
      self.deleteModalTemplateRef.result.then(close => {
        if (close) {
          const properties = self.form.get('properties') as FormGroup;
          properties.removeControl(control);
          properties.addControl(control, self.fb.array([]));
          if (properties.get('default').value) {
            properties.get('default').patchValue('');
          }
        }
      }, dismiss => { });
    } else {
      const properties = self.form.get('properties') as FormGroup;
      properties.removeControl(control);
      properties.addControl(control, self.fb.array([]));
    }
  }

  pasteOnList(event, control, type?) {
    event.preventDefault();
    let values = event.clipboardData.getData('text/plain').split(/\n/).filter(e => {
      if (e && e.trim() && e.trim() !== ',') {
        return e;
      }
    }).map(e => e.trim());
    if (values && values.length < 2) {
      values = event.clipboardData.getData('text/plain').split(/\t/).filter(e => {
        if (e && e.trim() && e.trim() !== ',') {
          return e;
        }
      }).map(e => e.trim());
    }
    if (values && values.length < 2) {
      values = event.clipboardData.getData('text/plain').split(/,/).filter(e => {
        if (e && e.trim() && e.trim() !== ',') {
          return e;
        }
      }).map(e => e.trim());
    }
    const self = this;
    self.form.markAsDirty();
    for (const i in values) {
      if (type) {
        if (type === 'string') {
          self.addToList(control, values[i]);
        }
        if (type === 'number') {
          self.addToList(control, +values[i]);
        }
      } else {
        self.addToList(control, values[i]);
      }
    }
  }

  addToList(control, value?) {
    const self = this;
    if (!value) {
      value = self.form.get('properties._listInput').value;
    }
    if ((!value || !value.toString().trim()) && (typeof value !== 'number')) {
      return;
    }
    let list: FormArray = self.form.get('properties').get(control) as FormArray;
    self.form.get('properties._listInput').patchValue(null);
    if (!list.value) {
      (self.form.get('properties') as FormGroup).removeControl(control);
      (self.form.get('properties') as FormGroup).addControl(control, self.fb.array([]));
      list = (self.form.get('properties') as FormGroup).get(control) as FormArray;
    }
    if (list.value.length > 0) {
      if (list.value.indexOf(value) > -1) {
        return;
      }
    }
    if (self.checkStateModel()) {
      let enums = self.form.get(['properties', 'enum']).value;
      // initial state logic 
      if (enums.length == 0) {
        self.mainForm.get(['stateModel', 'initialStates']).patchValue([value])
      }
      // add state to state mapping dictionary
      const statesDict = self.mainForm.get(['stateModel', 'states']).value;
      statesDict[value] = [];
      self.mainForm.get(['stateModel', 'states']).patchValue(statesDict);
    }
    list.push(new FormControl(value));
  }

  removeFromList(control, index, prop: AbstractControl) {
    const self = this;
    this.editStateListOfValues = null;
    const list = self.form.getRawValue()['properties'][control];
    const tempValue = list[index];
    self.deleteModal.title = 'Remove ' + list[index];
    self.deleteModal.message = 'Are you sure you want to remove ' + list[index] + '?';
    if (typeof list[index] === 'object') {
      self.deleteModal.title = 'Remove ' + list[index].name;
      self.deleteModal.message = 'Are you sure you want to remove ' + list[index].name + '?';
    }
    self.deleteModal.showButtons = true;
    self.deleteModalTemplateRef = self.commonService.modal(self.deleteModalTemplate);
    self.deleteModalTemplateRef.result.then(close => {
      if (close) {
        let state = self.form.get(['properties', 'enum']).value[index];

        ((self.form.get('properties')).get(control) as FormArray).removeAt(index);
        if (prop.get('default')?.value && tempValue === prop.get('default')?.value) {
          prop.get('default').patchValue('');
        }
        if (self.checkStateModel()) {
          self.deleteStateModelState(index, state);
        }
      }
    }, dismiss => { });
  }

  listEnterKey(event, control) {
    const self = this;
    self.addToList(control);
  }

  getPrecisionExample(val) {
    if (val > 0) {
      const precision = Math.pow(10, val);
      return (Math.round(Math.PI * precision) / precision).toString();
    } else {
      return Math.round(Math.PI).toString();
    }
  }
  minMaxErr(type: string) {
    const self = this;
    return self.form.get(['properties', type]).dirty && self.form.get('properties').hasError('minMax');
  }
  setValue(type: string) {
    const self = this;
    const control = self.form.get('properties').get(type);
    const prcsn = self.form.get('properties').get('precision');
    if (prcsn && prcsn.value > 0) {
      const precision = Math.pow(10, prcsn.value);
      control.patchValue(Math.round(parseFloat(control.value) * precision) / precision);
    } else {
      control.patchValue(Math.round(parseFloat(control.value)));
    }
  }
  isNumber(prop) {
    if (prop.get('_detailedType').value === 'enum' || prop.get('_detailedType').value === 'currency') {
      return false;
    } else {
      return true;
    }
  }
  validateNumbDefaultValue(value, prop) {
    if (prop.get('min').value && value !== null && value !== undefined && (value < prop.get('min').value)) {
      ((prop as FormGroup).get('default')).setErrors({ min: true });
    } else if (prop.get('max').value && value !== null && value !== undefined && (value > prop.get('max').value)) {
      ((prop as FormGroup).get('default')).setErrors({ max: true });
    } else if (prop.get('precision').value != null || prop.get('precision').value !== undefined) {
      const isDotPresent = (prop.get('default').value + '').split('.').length > 1;
      if (isDotPresent) {
        const precision = (prop.get('default').value + '').split('.')[1].length;
        if (precision > prop.get('precision').value) {
          ((prop as FormGroup).get('default')).setErrors({ precision: true });
        }
      }
    }
  }

  setEnumValue(prop) {
    const value = prop.get('default').value;
    if (!value || value === 'null' || value === null) {
      prop.get('default').setValue(null);
    }
    else {
      prop.get('default').setValue(parseFloat(prop.get('default').value));
    }
  }

  get enumList() {
    const self = this;
    if (self.form.get('properties.enum')) {
      return (self.form.get('properties.enum') as FormArray).controls;
    } else {
      return [];
    }
  }

  checkStateModel() {
    const self = this;
    if (self.mainForm && self.mainForm.get(['stateModel', 'enabled']).value) {
      if (self.form.get('key').value === self.mainForm.get(['stateModel', 'attribute']).value) {
        return true;
      }
      else {
        return false;
      }
    }
    return false;
  }

  deleteStateModelState(index, state) {
    const self = this;
    let enums = self.form.get(['properties', 'enum']).value;
    // delete from state model config
    let stateModelConfig = self.mainForm.get(['stateModel', 'states']).value;
    delete stateModelConfig[state];
    // delete state from next set of states 
    Object.keys(stateModelConfig).forEach(key => {
      let stateIndex = stateModelConfig[key].indexOf(state);
      if (stateIndex != -1) {
        stateModelConfig[key].splice(stateIndex, 1);
      }
    });
    self.mainForm.get(['stateModel', 'states']).patchValue(stateModelConfig);
    // initial state logic
    if (enums.length == 0) {
      self.mainForm.get(['stateModel', 'initialStates']).patchValue([]);
    }
    else if (enums.length > 0) {
      if (self.mainForm.get(['stateModel', 'initialStates']).value[0] == state) {
        self.mainForm.get(['stateModel', 'initialStates']).patchValue([enums[0]]);
      }
    }
  }

}
