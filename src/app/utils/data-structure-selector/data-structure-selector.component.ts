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
  @Input() hideGeneric: boolean;
  @Input() format: any;
  @Output() formatChange: EventEmitter<any>;

  showLoader: boolean;
  selectedType: string;
  showWindow: boolean;
  tempFormat: any;
  constructor(
    private commonService: CommonService,
    private appService: AppService) {
    this.edit = { status: true };
    this.formatChange = new EventEmitter();
    this.selectedType = 'generic';
  }

  ngOnInit(): void {
    if (this.format) {
      this.tempFormat = this.appService.cloneObject(this.format);
    }
    this.setSelectedType();
  }

  setSelectedType() {
    if (this.format && this.format._id && (this.format._id.startsWith('DF') || this.format._id.startsWith('SRVC'))) {
      this.selectedType = 'dataFormat';
    } else if (this.format && this.format._id) {
      this.selectedType = 'customFormat';
    } else {
      this.selectedType = 'generic';
    }
  }

  onTypeChange(type: string) {
    if (this.selectedType === type) {
      return;
    }
    if (type != 'generic') {
      this.showWindow = true;
    }
    this.selectedType = type;
    this.tempFormat = null;
  }

  onFormatChange(data: any) {
    this.tempFormat = data;
    this.save();
  }

  save() {
    this.showWindow = false;
    this.format = this.tempFormat;
    this.formatChange.emit(this.format);
  }

  closeWindow() {
    this.showWindow = false;
    if (!this.format) {
      this.selectedType = 'generic';
    }
    this.tempFormat = this.format;
    this.setSelectedType();
  }
}
