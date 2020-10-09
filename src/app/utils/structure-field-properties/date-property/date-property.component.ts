import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'odp-date-property',
  templateUrl: './date-property.component.html',
  styleUrls: ['./date-property.component.scss']
})
export class DatePropertyComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() edit: any;
  @Input() isLibrary: boolean;
  @Input() isDataFormat: boolean;
  constructor() { }

  ngOnInit() {
  }

}
