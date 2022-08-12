import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SchemaBuilderService } from '../../schema-builder.service';

@Component({
  selector: 'odp-step-fields',
  templateUrl: './step-fields.component.html',
  styleUrls: ['./step-fields.component.scss']
})
export class StepFieldsComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() edit: any;

  constructor(private schemaService: SchemaBuilderService,
    private fb: FormBuilder) { }

  ngOnInit(): void {

  }

  addToStep(field, index) {
    (this.form.get(['wizard', 'steps', this.selectedStepIndex, 'fields']) as FormArray).push(field);
    (this.form.get('wizard.usedFields') as FormArray).push(field);
    this.form.get('wizard').markAsDirty();
    this.form.markAsDirty();
  }

  removeFromStep(index) {
    const temp = (this.form.get(['wizard', 'steps', this.selectedStepIndex, 'fields']) as FormArray).at(index);
    this.removeFromUsed(temp);
    (this.form.get(['wizard', 'steps', this.selectedStepIndex, 'fields']) as FormArray).removeAt(index);
    this.form.get('wizard').markAsDirty();
    this.form.markAsDirty();
  }

  removeFromUsed(field) {
    const i = (this.form.get('wizard.usedFields') as FormArray).controls.findIndex(e => {
      if (e.value.key === field.value.key) {
        return true;
      }
    });
    if (i > -1) {
      (this.form.get('wizard.usedFields') as FormArray).removeAt(i);
    }
  }

  moveUp(index) {
    if (index === 0) {
      return;
    }
    const temp = this.selectedStepFields.splice(index, 1);
    this.selectedStepFields.splice(index - 1, 0, temp[0]);
  }

  moveDown(index) {
    if (index === this.selectedStepFields.length - 1) {
      return;
    }
    const temp = this.selectedStepFields.splice(index, 1);
    this.selectedStepFields.splice(index + 1, 0, temp[0]);
  }

  get selectedStepIndex() {
    return this.form ? this.form.get('wizard.selectedStep').value : 0;
  }

  set selectedStepIndex(val) {
    this.form ? this.form.get('wizard.selectedStep').patchValue(val) : null
  }

  get definitions() {
    return (this.form.get('definition') as FormArray).controls;
  }

  get steps() {
    return (this.form.get('wizard.steps') as FormArray).controls;
  }

  get selectedStepFields() {
    const temp = (this.form.get(['wizard', 'steps', this.selectedStepIndex, 'fields']) as FormArray);
    return temp ? temp.controls : [];
  }

  get remainingFields() {
    let temp = [];
    if ((this.form.get('wizard.usedFields') as FormArray).controls.length === 0) {
      temp = this.definitions.slice();
    } else {
      this.definitions.forEach(e => {
        const index = (this.form.get('wizard.usedFields') as FormArray).controls.findIndex(f => f.value.key === e.value.key);
        if (e.get('key').value === '_id') {
          if (index === -1) {
            temp.push(this.schemaService.getDefinitionStructure({
              key: '_id',
              type: 'id',
              properties: {
                name: this.definitions.find(fg => fg.value.key === '_id').value.properties.name
              }
            }));
          }
        } else {
          if (index === -1) {
            temp.push(e);
          }
        }
      });
    }
    return temp;
  }
}
