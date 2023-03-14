import { Component, forwardRef, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'odp-change-on-edit',
  templateUrl: './change-on-edit.component.html',
  styleUrls: ['./change-on-edit.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChangeOnEditComponent),
      multi: true
    }
  ]
})
export class ChangeOnEditComponent implements ControlValueAccessor {

  @ViewChild('inputField') inputField: HTMLInputElement;
  value: any;
  onChange: Function;
  onTouched: Function;
  isDisabled: boolean;
  oldValue: any;
  editEnabled: boolean;
  @Input() errorMessage: string;
  @Output() tempValue: EventEmitter<string>;
  constructor() {
    this.tempValue = new EventEmitter();
    this.errorMessage = '';
  }

  writeValue(obj: any): void {
    this.value = obj;
    this.oldValue = obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onValueChange(data: string) {
    this.value = data;
    this.tempValue.emit(this.value);
  }

  save() {
    this.editEnabled = false;
    this.oldValue = this.value;
    this.onChange(this.value);
    this.cancel();
  }

  cancel() {
    this.value = this.oldValue;
    this.editEnabled = false;
    this.tempValue.emit(this.value);
  }

}
