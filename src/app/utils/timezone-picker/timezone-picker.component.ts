import { Component, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { AppService } from '../services/app.service';

@Component({
  selector: 'odp-timezone-picker',
  templateUrl: './timezone-picker.component.html',
  styleUrls: ['./timezone-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimezonePickerComponent),
      multi: true
    }
  ]
})
export class TimezonePickerComponent implements OnInit, ControlValueAccessor {

  @ViewChild('timezone', { static: false }) timezone: NgbTypeahead;
  @Input() edit: any;
  focus$: Subject<string>;
  click$: Subject<string>;
  timezones: Array<any>;
  isDisabled: boolean;
  onChange: any;
  onTouch: any;
  value: any;
  constructor(private appService: AppService) {
    this.edit = {};
    this.focus$ = new Subject<string>();
    this.click$ = new Subject<string>();
    this.timezones = this.appService.getTimezones();
  }

  ngOnInit(): void { }

  searchTimezone = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.timezone.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(map(term => (term === '' ? this.timezones
      : this.timezones.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  }

  onSelectItem(event) {
    this.onChange(event.item);
  }

  writeValue(obj: any): void {
    this.value = obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  get canEdit() {
    let retValue = false;
    if (this.edit.status && this.edit.type !== 'internal') {
      retValue = true;
    }
    return retValue;
  }
}
