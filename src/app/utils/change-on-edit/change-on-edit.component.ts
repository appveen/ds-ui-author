import { Component, forwardRef, ViewChild, Output, EventEmitter, Input, ElementRef} from '@angular/core';
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

  @ViewChild('inputField') inputField: ElementRef;
  value: any;
  onChange: Function;
  onTouched: Function;
  isDisabled: boolean;
  oldValue: any;
  editEnabled: boolean;
  @Input() errorMessage: string;
  @Input() isTimeout: boolean;
  @Output() tempValue: EventEmitter<string>;
  constructor() {
    this.tempValue = new EventEmitter();
    this.errorMessage = '';
  }

  ngAfterViewInit() {
    if(this.isTimeout){
      this.inputField.nativeElement.type = 'number';
    }
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
    if(this.isTimeout){
      if (+data <= 60) {
        this.errorMessage = "Timeout (sec) should be a number greater than 60";
        this.value = data;
      } else {
        this.errorMessage = null;
        this.value = data;
        this.tempValue.emit(this.value);
      }
    } else {
        this.value = data;
        this.tempValue.emit(this.value);
    }
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
    this.errorMessage = null;
    this.tempValue.emit(this.value);
  }

}
