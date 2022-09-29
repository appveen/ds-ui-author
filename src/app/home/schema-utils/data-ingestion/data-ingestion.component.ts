import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-data-ingestion',
  templateUrl: './data-ingestion.component.html',
  styleUrls: ['./data-ingestion.component.scss']
})
export class DataIngestionComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() edit: any;
  ingestionForm: FormGroup;
  toggleNewEndpintWindow: boolean;
  toggleIncomingFieldsWindow: boolean;
  toggleFormulaWindow: boolean;
  selectedEndpoint: any;
  selectedField: any;
  definition: Array<any>;
  constructor(private fb: FormBuilder,
    private appService: AppService) {
    this.edit = {
      status: false
    }
    this.ingestionForm = this.fb.group({
      name: [null, [Validators.required]],
      api: [null, [Validators.required]],
      contentType: ['application/json', [Validators.required]],
      fileType: ['xlsx'],
      mappings: []
    });
    this.definition = [];
  }

  ngOnInit(): void {
    this.ingestionForm.get('name').valueChanges.subscribe(val => {
      this.ingestionForm.get('api').setValue('/' + this.appService.toCamelCase(val));
    });
    if (this.form && this.form.get('definition') && this.form.get('definition').value) {
      this.definition = this.form.get('definition').value;
    }
  }

  closeWindow() {
    this.toggleNewEndpintWindow = false;
    this.ingestionForm.reset({ contentType: 'application/json', fileType: 'xlsx' });
  }

  createIngestionPoint() {
    this.toggleNewEndpintWindow = false;
    const data = this.ingestionForm.value;
    this.ingestionForm.reset({ contentType: 'application/json', fileType: 'xlsx' });
    this.addIngestionPoint(data);
  }

  addIngestionPoint(data: any) {
    this.selectedEndpoint = data;
    let values = this.form.get('ingestionPoints').value;
    if (!values) {
      values = [];
    }
    const index = values.findIndex(e => e.api == data.api);
    if (index < 0) {
      values.push(data);
    } else {
      values.splice(index, 1, data);
    }
    this.form.get('ingestionPoints').patchValue(values);
  }

  editIngestionPoint(data: any) {
    this.selectedEndpoint = data;
    this.ingestionForm.patchValue(data);
    this.toggleNewEndpintWindow = true;
  }

  removeIngestionPoint(index: number) {
    let values = this.form.get('ingestionPoints').value;
    if (!values) {
      values = [];
    }
    values.splice(index, 1);
    this.form.get('ingestionPoints').patchValue(values);
  }

  addIncomingField() {
    if (!this.selectedField.source) {
      this.selectedField.source = [];
    }
    this.selectedField.source.push({ type: 'String' });
  }
  removeIncomingField(index: number) {
    if (!this.selectedField.source) {
      this.selectedField.source = [];
    }
    this.selectedField.source.splice(index, 1);
  }

  saveIncomingField() {
    this.toggleIncomingFieldsWindow = false;
    this.selectedField = null;
    this.selectedField.mappings = this.definition;
  }

  get formApi() {
    return this.ingestionForm.get('api').value
  }


  get ingestionPoints() {
    if (this.form && this.form.get('ingestionPoints') && this.form.get('ingestionPoints').value) {
      return this.form.get('ingestionPoints').value;
    }
    return [];
  }
}
