import { Component, EventEmitter, Input, Output } from '@angular/core';
import { zip } from 'rxjs';
import * as _ from 'lodash';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { B2bFlowService } from '../../../b2b-flow.service';

@Component({
  selector: 'odp-source-selector',
  templateUrl: './source-selector.component.html',
  styleUrls: ['./source-selector.component.scss']
})
export class SourceSelectorComponent {

  @Input() currNode: any;
  @Input() source: any;
  @Input() edit: any;
  @Output() sourceChange: EventEmitter<any>;
  showConverterWindow: boolean;
  sourceList: Array<any>;
  apiOptions: GetOptions;
  searchTerm: string;
  showLoader: boolean;
  searchSubscription: any;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private flowService: B2bFlowService) {
    this.showConverterWindow = false;
    this.sourceList = [];
    this.sourceChange = new EventEmitter();
    this.edit = {
      status: false
    }
  }

  ngOnInit(): void {
    this.sourceList = this.appService.cloneObject(this.flowService.getNodesBefore(this.currNode));
  }

  toggleItem(flag: boolean, item: any) {
    this.sourceList.forEach(df => {
      df._selected = false;
    });
    item._selected = flag;
  }

  selectSource() {
    this.source = this.sourceList.find(e => e._selected);
    this.sourceChange.emit(this.source);
  }

  get issourceSelected() {
    return this.sourceList.some(e => e._selected);
  }
}
