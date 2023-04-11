import { Component, EventEmitter, Input, OnInit, Output, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as _ from 'lodash';
import { OperatorFunction, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { B2bFlowService } from '../../home/b2b-flows-manage/b2b-flow.service';


@Component({
  selector: 'odp-autocomplete-on-edit',
  templateUrl: './autocomplete-on-edit.component.html',
  styleUrls: ['./autocomplete-on-edit.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteOnEditComponent),
      multi: true
    }
  ]
})
export class AutocompleteOnEditComponent implements OnInit, ControlValueAccessor {
  @Input() regex: RegExp = /({{\S+}})/g;
  @Output() finalValue: EventEmitter<any> = new EventEmitter();

  @Input() suggestions: any = [];
  @Input() ngbTypeahead: any;
  @Input() resultFormatter: any;
  @Input() inputFormatter: any;
  @Input() searchTerm: any;
  @Input() class: any;
  @Input() type: string = "text";
  @Input() placeholder: string = '';
  @Input() pattern: RegExp = /.*/g;
  @Input() currNode: any;
  @Output() onPaste: EventEmitter<any> = new EventEmitter();
  @Output() onEnter: EventEmitter<any> = new EventEmitter();
  @ViewChild('renderer') renderer: any;
  @ViewChild('styledInputText') styledInputText: any;
  value: any;
  onChange: Function;
  onTouched: Function;
  isDisabled: boolean = true;
  oldValue: any;
  tmpValue: any;
  editEnabled: boolean;
  @Input() errorMessage: string;
  @Output() tempValue: EventEmitter<string>;
  constructor(private flowService: B2bFlowService) { }

  ngOnInit() {
    if (!this.value) {
      this.value = ''
    }
  }

  // onChange = (event) => {
  //   this.value = event.target.value;
  //   this.finalValue.emit(this.value);
  // };

  get valueArray() {
    return this.value ? this.value.split(this.regex) : [];
  }

  regexMatch(word) {
    return String(word).match(this.regex) !== null;
  }

  selectItem(event) {
    // console.log(event)
    this.patchValue(`{{${event.item.value}}}`);
  }

  getCursor() {
    let cursor = this.styledInputText.nativeElement;
    let start = cursor.selectionStart;
    let end = cursor.selectionEnd;
    return [start, end];
  }

  patchValue(selectedValue) {
    let currentValue = this.value;
    let cursor = this.getCursor();
    let patchedValue = currentValue.substring(0, cursor[0] - this.searchTerm.length) + selectedValue + currentValue.substring(cursor[1]);
    this.value = patchedValue;
    this.tmpValue = patchedValue;
    // this.onValueChange(patchedValue);
    this.finalValue.emit(this.value);
  }


  handleScroll(event) {
    this.renderer.nativeElement.scrollTop = event.target.scrollTop;
    this.renderer.nativeElement.scrollLeft = event.target.scrollLeft;
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

  onValueChange(event?) {
    if (event) {
      this.value = event.target.value;
      this.tmpValue = event.target.value;
    }
    else {
      this.value = this.tmpValue;
    }
    // this.tempValue.emit(this.value);
    this.onChange(this.value);
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
    // this.tempValue.emit(this.value);
  }

  formatter(result: any) {
    if (result && typeof result == 'object') {
      return result.label;
    }
    return result;
  };


  search: OperatorFunction<string, readonly { label: string, value: string }[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) => {
        const regex = /{{(?!.*}})(.*)/g;
        const matches = term.match(regex) || [];
        this.searchTerm = matches.length > 0 ? _.cloneDeep(matches).pop() : '';
        // term = term.split(' ').filter((ele) => ele.startsWith("{{") && !ele.endsWith("}")).pop() || '';
        // this.searchTerm = term;
        if (this.searchTerm) {
          term = this.searchTerm.replace('{{', '');
        }
        return matches.length === 0 && this.searchTerm === '' ? [] : this.variableSuggestions.filter((v) => v.label.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 15);
      }),
    );


  get variableSuggestions() {
    return this.flowService.getSuggestions(this.currNode)
  }




}

