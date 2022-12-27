import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'odp-id-property',
  templateUrl: './id-property.component.html',
  styleUrls: ['./id-property.component.scss']
})
export class IdPropertyComponent implements OnInit {
  @Input() form: UntypedFormGroup;
  @Input() edit: any;
  @Input() isLibrary: boolean;
  @Input() isDataFormat: boolean;
  @Input() type;
  constructor() {
    const self = this;
    self.edit = {};
  }

  ngOnInit() {
    const self = this;
    self.form.get('padding').setValidators([Validators.min(0),Validators.max(15)]);
  }
  get idPreview() {
    const self = this;
    let zeros = '';
    const arr = [];
    if (self.form.get('padding').value > 15) {
      return;
    }
    const size = parseInt(self.form.get('counter').value ? self.form.get('counter').value.toString().length : 0, 10);
    const sub = parseInt(self.form.get('padding').value ? self.form.get('padding').value : 0, 10);
    if (sub - size > 0) {
      const a = sub - size;
      for (let i = 0; i < a; i++) {
        arr.push('0');
        zeros = arr.toString().replace(/\,/g, '');
      }
    }
    if (self.form.get('prefix').value !== null) {
      const counter = self.form.get('counter').value ? self.form.get('counter').value : '';
      const prefix = self.form.get('prefix').value ? self.form.get('prefix').value : '';
      const suffix = self.form.get('suffix').value ? self.form.get('suffix').value : '';
      const id = prefix + zeros + counter + suffix;
      return id;
    }
  }

  get counterError() {
    const self = this;
    if (self.form.get('counter') && self.form.get('counter').errors) {
      return self.form.get('counter').errors.counter;
    } else {
      return '';
    }
  }

  get paddingError() {
    const self = this;
    if (self.form.get('padding') && self.form.get('padding').dirty && self.form.get('padding').errors) {
      return true;
    } else {
      return false;
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
}
