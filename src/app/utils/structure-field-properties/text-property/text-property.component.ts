import { Component, Input, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as RandExp from 'randexp';

import { CommonService } from '../../services/common.service';

@Component({
  selector: 'odp-text-property',
  templateUrl: './text-property.component.html',
  styleUrls: ['./text-property.component.scss']
})
export class TextPropertyComponent implements OnDestroy {

  @ViewChild('deleteModalTemplate', { static: false }) deleteModalTemplate: TemplateRef<HTMLElement>;
  @Input() mainForm: FormGroup;
  @Input() form: FormGroup;
  @Input() edit: any;
  @Input() isLibrary: boolean;
  @Input() isDataFormat: boolean;
  sampleRegexValue: Array<any>;
  deleteModal: any;
  deleteModalTemplateRef: NgbModalRef;
  @Input() type;
  @Input() formatType: string;
  editStateListOfValues: number = null;

  constructor(private commonService: CommonService,
    private fb: FormBuilder) {
    const self = this;
    self.edit = {};
    self.sampleRegexValue = [];
    self.deleteModal = {};
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

    if(self.checkStateModel()){
      let temp: any = enums[event.oldIndex];
      enums[event.oldIndex] = enums[event.newIndex];
      enums[event.newIndex] = temp;
      (self.form.get(['properties', 'enum']) as FormArray).clear();  
      for (let state of enums) {
        (self.form.get(['properties', 'enum']) as FormArray).push(new FormControl(state));
      }
    }

   

  }

  changeDefault(event) {
    const self = this;
    const value = event.target.value;
    if (!value || value === 'null' || value === null) {
      self.form.get('properties.default').patchValue(null);
    } else {
      self.form.get('properties.default').patchValue(value);
    }
  }

  generateSampleRegex(value) {
    const self = this;
    self.sampleRegexValue = [];
    if (value) {
      for (let i = 0; i < 3; i++) {
        self.sampleRegexValue.push(self.generate(value));
      }
    }
  }

  generate(value) {
    const randexp = new RandExp(value);
    const sampleValue = randexp.gen();
    return sampleValue;
  }

  reCalibrateTextDefaultValue(type, value, prop) {
    value = parseInt(value, 10);
    const self = this;
    if (prop.get('default')) {
      const deafaultValue = prop.get('default').value;
      if (deafaultValue && type === 'minlength') {
        if (deafaultValue.length < value) {
          self.setError(type, prop);
        } else if ((prop.get('default')).getError(type)) {
          self.deleteError(type, prop);
        }
      } else if (type === 'maxlength') {
        if (deafaultValue && deafaultValue.length > value) {
          self.setError(type, prop);
        } else if ((prop.get('default')).getError(type)) {
          self.deleteError(type, prop);
        }
      } else if (type === 'pattern') {
        const re = new RegExp(prop.get('pattern').value);
        if (deafaultValue && prop.get('pattern').value && !re.test(deafaultValue)) {
          self.setError(type, prop);
        } else if ((prop.get('default')).getError(type)) {
          self.deleteError(type, prop);
        }
      }
    }
  }

  setError(type, prop) {
    let errors = (prop.get('default')).errors;
    if (!errors) {
      errors = {};
    }
    errors[type] = true;
    (prop.get('default')).setErrors(errors);
  }

  deleteError(type, prop) {
    let errors = (prop.get('default')).errors;
    if (errors) {
      delete errors[type];
      if (Object.keys(errors).length === 0) {
        errors = null;
      }
    }
    (prop.get('default')).setErrors(errors);
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
    let list: FormArray = (self.form.get('properties')).get(control) as FormArray;
    self.form.get('properties._listInput').patchValue(null);
    if (!list.value) {
      (self.form.get('properties') as FormGroup).removeControl(control);
      (self.form.get('properties') as FormGroup).addControl(control, self.fb.array([]));
      list = (self.form.get('properties')).get(control) as FormArray;
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


  removeFromList(control, index) {
    const self = this;
    this.editStateListOfValues = null;
    // const list = (self.form.get('properties')).get(control) as FormArray;
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
        if ((self.form.get('properties') as FormGroup).get('default').value
          && tempValue === (self.form.get('properties') as FormGroup).get('default').value) {
          (self.form.get('properties') as FormGroup).get('default').patchValue('');
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
  isPlainString(prop) {
    if ((prop.get('email').value ||
      prop.get('longText').value ||
      prop.get('richText').value || prop.get('password').value
      || prop.get('_detailedType').value === 'enum')) {
      return false;
    } else {
      return true;
    }
  }
  validateTextDefaultValue(value, prop) {
    const self = this;
    if (prop.get('minlength').value && value && (value.length < prop.get('minlength').value)) {
      self.setError('minlength', prop);
    } else if (prop.get('maxlength').value && value && (value.length > prop.get('maxlength').value)) {
      self.setError('maxlength', prop);
    } else if (prop.get('pattern').value && value) {
      const re = new RegExp(prop.get('pattern').value);
      if (!re.test(value)) {
        self.setError('pattern', prop);
      }
    }
  }
  validateEmail(type, value, prop) {
    const self = this;
    // const regexStr = new RegExp(`/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@
    // ((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i`);
    const regexStr = /[\w]+@[a-zA-Z0-9-]{2,}(\.[a-z]{2,})+/;
    if (value && !(value.match(regexStr))) {
      self.setError(type, prop);
    } else if ((prop.get('default')).getError(type)) {
      self.deleteError(type, prop);
    }
  }

  get hasTokensList() {
    const self = this;
    if (self.form.get('properties.hasTokens')) {
      return (self.form.get('properties.hasTokens') as FormArray).controls;
    } else {
      return [];
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

  get canEdit() {
    const self = this;
    let retValue = false;
    if (self.edit.status && self.type !== 'internal') {
      retValue = true;
    }
    return retValue;
  }


  checkStateModel() {
    const self = this;
    if (self.mainForm.get(['stateModel', 'enabled']).value) {
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