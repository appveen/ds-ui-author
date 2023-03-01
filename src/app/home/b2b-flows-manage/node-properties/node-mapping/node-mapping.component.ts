import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';

import { AppService } from 'src/app/utils/services/app.service';
import { environment } from 'src/environments/environment';
import { MappingService } from './mapping.service';

@Component({
  selector: 'odp-node-mapping',
  templateUrl: './node-mapping.component.html',
  styleUrls: ['./node-mapping.component.scss']
})
export class NodeMappingComponent implements OnInit {

  @Input() edit: any;
  @Input() currNode: any;
  @Input() nodeList: Array<any>;
  @Output() close: EventEmitter<any>;
  customSourceFields: Array<any>;
  customTargetFields: Array<any>;
  showFormulaBuilder: boolean;

  allSources: Array<any>;
  allTargets: Array<any>;
  tempMappings: Array<any>;
  constructor(private appService: AppService,
    private mappingService: MappingService) {
    this.nodeList = [];
    this.close = new EventEmitter();
    this.customSourceFields = [];
    this.customTargetFields = [];
    this.edit = {
      status: false
    };
    this.allSources = [];
    this.allTargets = [];
  }

  ngOnInit(): void {
    this.customSourceFields = this.appService.cloneObject(this.currNode.dataStructure.incoming.definition) || [];
    this.customTargetFields = this.appService.cloneObject(this.currNode.dataStructure.outgoing.definition) || [];
    this.allSources = this.mappingService.flatten(this.customSourceFields);
    this.allTargets = this.mappingService.flatten(this.customTargetFields);
    if (this.currNode.mappings && this.currNode.mappings.length > 0) {
      this.tempMappings = this.appService.cloneObject(this.currNode.mappings);
      this.allTargets.forEach((item: any) => {
        let temp = this.tempMappings.find((e: any) => e.target.dataPath == item.dataPath);
        if (temp && temp.source) {
          item.source = (temp.source || []).map((source: any) => this.allSources.find((src: any) => src.dataPath == source.dataPath)).filter(e => e);
        }
      });
    }
  }

  cancel() {
    this.close.emit(false);
  }


  done() {
    let mappings = this.allTargets.map(item => this.convertToMapping(item));
    this.currNode.mappings = mappings;
    this.cancel();
    if (!environment.production) {
      console.log(mappings);
    }
  }

  convertToMapping(item: any) {
    const temp: any = {};
    temp.target = {
      type: item.type,
      dataPath: item.dataPath,
    };
    temp.source = (item.source || []).map((s) => {
      let temp: any = {};
      temp.type = s.type;
      temp.dataPath = s.dataPath;
      return temp;
    });
    temp.formula = item.formula;
    return temp;
  }

  doFuzzyMapping() {
    this.mappingService.fuzzyMapping.emit(true);
  }

  doClearMapping() {
    this.mappingService.clearMappings.emit(true);
  }



  get viewBox() {
    return `0 0 1300 670`;
  }
}
