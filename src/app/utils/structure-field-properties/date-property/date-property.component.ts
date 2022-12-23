import { Component, OnInit, OnDestroy, Input, ViewChild, TemplateRef } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from '../../services/app.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'odp-date-property',
  templateUrl: './date-property.component.html',
  styleUrls: ['./date-property.component.scss']
})
export class DatePropertyComponent implements OnInit, OnDestroy {

  @ViewChild('deleteModalTemplate', { static: false }) deleteModalTemplate: TemplateRef<HTMLElement>;
  @Input() form: UntypedFormGroup;
  @Input() edit: any;
  @Input() isLibrary: boolean;
  @Input() isDataFormat: boolean;
  @Input() type;
  @Input() formatType: string;
  sampleRegexValue: Array<any>;
  deleteModal: any;
  deleteModalTemplateRef: NgbModalRef;
  editStateListOfValues: number = null;
  timezones: Array<string>;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private fb: UntypedFormBuilder) {
    this.edit = {};
    this.sampleRegexValue = [];
    this.deleteModal = {};
    this.timezones = this.appService.getTimezones();
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    if (this.deleteModalTemplateRef) {
      this.deleteModalTemplateRef.close(false);
    }
  }

  sortableOnMove = (event: any) => {
    return !event.related.classList.contains('disabled');
  }

  sortableOnUpdate = (event: any) => {
    if (this.editStateListOfValues === event.oldIndex) {
      this.editStateListOfValues = event.newIndex;
    } else if (this.editStateListOfValues === event.newIndex) {
      const diff = event.newIndex - (event.oldIndex || 0);
      this.editStateListOfValues = event.newIndex + (diff > 0 ? -1 : 1);
    }
  }


  clearList(control, flag?: boolean) {
    this.editStateListOfValues = null;
    if (!flag) {
      this.deleteModal.title = 'Clear List';
      this.deleteModal.message = 'Are you sure you want to clear list?';
      this.deleteModal.showButtons = true;
      this.deleteModalTemplateRef = this.commonService.modal(this.deleteModalTemplate);
      this.deleteModalTemplateRef.result.then(close => {
        if (close) {
          const properties = this.form.get('properties') as UntypedFormGroup;
          properties.removeControl(control);
          properties.addControl(control, this.fb.array([]));
          if (properties.get('default').value) {
            properties.get('default').patchValue('');
          }
        }
      }, dismiss => { });
    } else {
      const properties = this.form.get('properties') as UntypedFormGroup;
      properties.removeControl(control);
      properties.addControl(control, this.fb.array([]));
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
    this.form.markAsDirty();
    for (const i in values) {
      if (type) {
        if (type === 'string') {
          this.addToList(control, values[i]);
        }
        if (type === 'number') {
          this.addToList(control, +values[i]);
        }
      } else {
        this.addToList(control, values[i]);
      }
    }
  }

  addToList(control, value?) {
    if (!value) {
      value = this.form.get('properties._listInput').value;
    }
    if ((!value || !value.toString().trim()) && (typeof value !== 'number')) {
      return;
    }
    let list: UntypedFormArray = (this.form.get('properties')).get(control) as UntypedFormArray;
    this.form.get('properties._listInput').setValue(null);
    if (!list.value) {
      (this.form.get('properties') as UntypedFormGroup).removeControl(control);
      (this.form.get('properties') as UntypedFormGroup).addControl(control, this.fb.array([]));
      list = (this.form.get('properties')).get(control) as UntypedFormArray;
    }
    if (list.value.length > 0) {
      if (list.value.indexOf(value) > -1) {
        return;
      }
    }
    list.push(new UntypedFormControl(value));
  }


  removeFromList(control, index) {
    this.editStateListOfValues = null;
    // const list = (this.form.get('properties')).get(control) as FormArray;
    const list = this.form.getRawValue()['properties'][control];
    const tempValue = list[index];
    this.deleteModal.title = 'Remove ' + list[index];
    this.deleteModal.message = 'Are you sure you want to remove ' + list[index] + '?';
    if (typeof list[index] === 'object') {
      this.deleteModal.title = 'Remove ' + list[index].name;
      this.deleteModal.message = 'Are you sure you want to remove ' + list[index].name + '?';
    }
    this.deleteModal.showButtons = true;
    this.deleteModalTemplateRef = this.commonService.modal(this.deleteModalTemplate);
    this.deleteModalTemplateRef.result.then(close => {
      if (close) {
        ((this.form.get('properties')).get(control) as UntypedFormArray).removeAt(index);
        if ((this.form.get('properties') as UntypedFormGroup).get('default').value
          && tempValue === (this.form.get('properties') as UntypedFormGroup).get('default').value) {
          (this.form.get('properties') as UntypedFormGroup).get('default').patchValue('');
        }
      }
    }, dismiss => { });
  }

  listEnterKey(event, control) {
    this.addToList(control);
  }

  get supportedTimezonesList() {
    if (this.form.get('properties.supportedTimezones')) {
      return (this.form.get('properties.supportedTimezones') as UntypedFormArray).controls;
    } else {
      return [];
    }
  }

  get canEdit() {
    let retValue = false;
    if (this.edit.status && this.type !== 'internal') {
      retValue = true;
    }
    return retValue;
  }

}
