import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

import { CommonService } from '../services/common.service';
import { AppService } from '../services/app.service';

@Component({
  selector: 'odp-data-structure-selector',
  templateUrl: './data-structure-selector.component.html',
  styleUrls: ['./data-structure-selector.component.scss']
})
export class DataStructureSelectorComponent implements OnInit {

  @Input() edit: any;
  @Input() restrictToFormat: Array<string>;
  @Input() format: any;
  @Output() formatChange: EventEmitter<any>;

  showLoader: boolean;
  selectedType: string;
  constructor(
    private commonService: CommonService,
    private appService: AppService) {
    this.edit = { status: true };
    this.formatChange = new EventEmitter();
    this.selectedType = 'generic';
  }

  ngOnInit(): void {
    if (this.format && this.format._id && (this.format._id.startsWith('DF') || this.format._id.startsWith('SRVC'))) {
      this.selectedType = 'dataFormat';
    } else if (this.format && this.format._id) {
      this.selectedType = 'customFormat';
    } else {
      this.selectedType = 'generic';
    }
  }


  onTypeChange(type: string) {
    this.selectedType = type;
    this.format = null;
    this.formatChange.emit(null);
    if (type == 'dataFormat') {

    } else if (type == 'customFormat') {

    }
  }

  onFormatChange(data: any) {
    console.log(data);
    this.format = data;
    this.formatChange.emit(data);
  }

  get showWindow() {
    return this.selectedType !== 'generic' && !this.format;
  }
}
