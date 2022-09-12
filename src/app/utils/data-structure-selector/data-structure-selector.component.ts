import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';

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
    if (this.format && this.format._id && this.format._id.startsWith('DF')) {
      this.selectedType = 'dataFromat';
    } else if (this.format && this.format._id) {
      this.selectedType = 'customFormat';
    }
  }


  onTypeChange(type: string) {
    this.selectedType = type;
    this.format = null;
    if (type == 'dataFromat') {

    } else if (type == 'customFormat') {

    }
  }

  get showWindow() {
    return this.selectedType !== 'generic' && !this.format;
  }
}
