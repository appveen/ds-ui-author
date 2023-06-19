import { Component, OnDestroy, Input, TemplateRef, ViewChild, AfterViewInit, AfterContentChecked } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';

import { SchemaBuilderService } from 'src/app/home/schema-utils/schema-builder.service';
import { CommonService } from '../services/common.service';
import { ToastrService } from 'ngx-toastr';
import { emptyEnum } from 'src/app/home/custom-validators/empty-enum-validator';
import { AppService } from '../services/app.service';

@Component({
  selector: 'odp-structure-field-properties',
  templateUrl: './structure-field-properties.component.html',
  styleUrls: ['./structure-field-properties.component.scss']
})
export class StructureFieldPropertiesComponent implements OnDestroy, AfterViewInit, AfterContentChecked {
  @Input() mainForm: any;
  @Input() isLibrary: boolean;
  @Input() isDataFormat: boolean;
  @Input() formatType: string;
  @Input() edit: any;
  @Input() type: string;
  showProperties: boolean;
  @ViewChild('typeChangeModalTemplate', { static: false }) typeChangeModalTemplate: TemplateRef<any>;
  showDatePicker: boolean;
  showLazyLoader: boolean;
  sampleRegexValue: Array<any> = [];
  formList: Array<UntypedFormGroup>;
  showDataTypes: any;
  _dateFrom: Date;
  form: UntypedFormGroup;
  showCommonFields: boolean;
  private subscriptions: any;
  public get dateFrom(): Date {
    const self = this;
    return self._dateFrom;
  }
  public set dateFrom(value: Date) {
    const self = this;
    self._dateFrom = value;
    self.formList[0].get('properties.default').patchValue(value);
  }
  constructor(private schemaService: SchemaBuilderService,
    private commonService: CommonService,
    private ts: ToastrService,
    private fb: UntypedFormBuilder,
    private appService: AppService) {
    const self = this;
    self.sampleRegexValue = [];
    self.showDatePicker = false;
    self.subscriptions = {};
    self.edit = {
      status: false
    };
    self.formList = [];
    self.showLazyLoader = false;
    self.showDataTypes = {};
    self.showCommonFields = true;
    self.showProperties = false;
  }

  ngAfterViewInit(): void {
    const self = this;
    self.schemaService.activeProperty.subscribe(form => {
      self.sampleRegexValue = [];
      self.formList = [];
      if (form) {
        self.form = form;
        self.showProperties = true;
        self.collectForms();
      } else {
        this.showProperties = false;
      }
    });
    self.schemaService.typechanged.subscribe(() => {
      self.showCommonFields = false;
      setTimeout(() => {
        self.showCommonFields = true;
      }, 50);
    });
  }

  ngAfterContentChecked() {
    const self = this;
    if (self.form) {
      self.collectForms();
    }
  }

  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach(key => {
      if (self.subscriptions[key]) {
        self.subscriptions[key].unsubscribe();
      }
    });
  }

  checkStateModel() {
    const self = this;
    if (self.mainForm && self.mainForm.get(['stateModel', 'enabled']) && self.form.get(['properties', '_detailedType']).value == 'enum') {
      if (self.mainForm.get(['stateModel', 'attribute']).value == self.form.get('key').value) {
        return true;
      }
    }
    return false;
  }



  collectForms() {
    const self = this;
    self.formList = [];
    self.formList.push(self.form);
    if (self.form.get('type').value === 'Array') {
      let subType = self.form.get(['definition', 0]);
      if (subType) {
        while (subType.get('type').value === 'Array') {
          self.formList.push(subType as UntypedFormGroup);
          subType = subType.get(['definition', 0]);
        }
        self.formList.push(subType as UntypedFormGroup);
      }
    }
    if (this.formatType === 'FLATFILE') {
      this.form.get('properties.fieldLength').setValidators([Validators.required, Validators.min(1)]);
    } else {
      this.form.get('properties.fieldLength').setValidators(null);
    }

    if (self.form.get('properties._detailedType').value === 'enum') {
      self.form.get('properties.enum').setValidators([emptyEnum]);
    }
  }

  deleteField() {
    const self = this;
    self.schemaService.deleteField.emit(self.form.get('_fieldId').value);
  }

  cloneField() {
    const self = this;
    self.schemaService.cloneAttribute.emit(self.form.get('_fieldId').value);
  }

  setEnumValue(prop) {
    prop.get('default').setValue(parseFloat(prop.get('default').value));
  }

  validateNumbDefaultValue(type, value, prop) {
    if (prop.get('min').value && (value < prop.get('min').value)) {
      (prop.get('default')).setErrors({ min: true });
    } else if (prop.get('max').value && (value > prop.get('max').value)) {
      (prop.get('default')).setErrors({ max: true });
    } else if (prop.get('precision').value != null || prop.get('precision').value !== undefined) {
      const isDotPresent = (prop.get('default').value + '').split('.').length > 1;
      if (isDotPresent) {
        const precision = (prop.get('default').value + '').split('.')[1].length;
        if (precision > prop.get('precision').value) {
          (prop.get('default')).setErrors({ precision: true });
        }
      }
    }
  }

  validateTextDefaultValue(value, prop) {
    const self = this;
    if (prop.get('minlength').value && (value.length < prop.get('minlength').value)) {
      self.setError('minlength', prop);
    } else if (prop.get('maxlength').value && (value.length > prop.get('maxlength').value)) {
      self.setError('maxlength', prop);
    } else if (prop.get('pattern').value) {
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
  setError(type, prop) {
    let errors = (prop.get('default')).errors;
    if (errors) {
      errors[type] = true;
    } else {
      errors = {};
      errors[type] = true;
    }
    (prop.get('default')).setErrors(errors);
  }

  deleteError(type, prop) {
    let errors = (prop.get('default')).errors;
    if (errors) {
      delete errors[type];
      if (Object.keys(errors).length === 0.) {
        errors = null;
      }
    }
    (prop.get('default')).setErrors(errors);
  }

  toggleCheck(prop: UntypedFormControl, key?: string) {
    const self = this;
    if (self.canEdit) {
      prop.patchValue(!prop.value);
      self.form.markAsDirty();
    }
    if (key && key == 'schemaFree') {
      console.log(this.form);
      if (prop.value) {
        self.form.removeControl('definition');
        // (this.form.get('definition') as UntypedFormArray).controls.splice(0);
      } else {
        const temp = self.schemaService.getDefinitionStructure({ _newField: true });
        self.form.addControl('definition', self.fb.array([temp]));
      }
    }
  }


  toggleCheckUnique(prop) {
    const self = this;

    let field = self.form.value.key;
    if (self.form.value.properties.dataPath) {
      field = self.form.value.properties.dataPath.split('.definition').join('');
    }

    if (self.form.value.properties && self.form.value.properties.password) {
      field = field + '.checksum';
    }
    const options = {
      fields: field,
      filter: { app: this.commonService.app._id }
    }
    if (self.subscriptions['unique-status']) {
      self.subscriptions['unique-status'].unsubscribe();
      self.showLazyLoader = false;
    }
    if (self.canEdit) {
      prop.patchValue(!prop.value);
      self.form.markAsDirty();
    }

    if (prop.value && self.form.value.key && !self.isLibrary && !self.isDataFormat) {
      self.showLazyLoader = true
      self.subscriptions['unique-status'] = self.commonService
        .get('serviceManager', `/${this.commonService.app._id}/service/utils/` + self.edit.id + '/checkUnique', options).subscribe(res => {
          self.showLazyLoader = false;
          if (!res[field]) {
            prop.patchValue(false);
            self.ts.warning('There are duplicate data present in appcenter for this attribute. Please clean up the data before marking the attribute as Unique.')
          }

        }, err => {
          self.showLazyLoader = false;
          self.commonService.errorToast(err, 'Unable to fetch unique status');
        });
    }
  }

  showSecureText(formItem) {
    let props = formItem.get('properties');
    if (formItem.get('type').value == 'String') {
      if (props.get('richText').value || (props.get('longText').value)) {
        return true;
      }
    }
    return false;

  }

  showSecureFile(formItem) {
    if (formItem.get('type').value == 'File') {
      return true;
    }
    return false;
  }

  clearValue() {
    this._dateFrom = null;
    this.formList[0].get('properties.default').patchValue(null);
  }

  displayKey() {
    const connectorsList = this.appService.connectorsList || [];
    const serviceDataConnector = this.schemaService.serviceObj?.connectors?.data || {};
    return connectorsList.find(ele => ele._id === serviceDataConnector._id)?.type !== 'MONGODB' || false;
  }


  get labelError() {
    const self = this;
    if (self.form.get('properties.label') && self.form.get('properties.label').errors) {
      return self.form.get('properties.label').errors.length;
    } else {
      return '';
    }
  }

  get descriptionError() {
    const descControl = this.form.get('properties._description');
    return !!descControl && !!descControl.errors && !!descControl.errors.maxlength
      ? `Description should not be more than ${descControl.errors.maxlength.requiredLength} characters`
      : '';
  }

  get name() {
    const self = this;
    if (self.form && self.form.get('properties.name')) {
      return self.form.get('properties.name').value;
    } else {
      return null;
    }
  }


  get key() {
    const self = this;
    if (self.form && self.form.get('key')) {
      return self.form.get('key').value;
    } else {
      return null;
    }
  }

  // set key(value) {
  //   const self = this;
  //   if (self.form && self.form.get('key')) {
  //     self.form.get('key').setValue(value);
  //   }

  // }

  get canDelete() {
    const self = this;
    if (self.form && self.form.get('type').value !== 'id') {
      return true;
    }
    return false;
  }

  get idField() {
    const self = this;
    if (self.form && self.form.get('type') && self.form.get('type').value === 'id') {
      return true;
    }
    return false;
  }


  get canEdit() {
    const self = this;
    let retValue = false;
    if (self.edit.status && self.type !== 'internal') {
      retValue = true;
    }
    return retValue;
  }
}
