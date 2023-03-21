import { Component, Input, Output, EventEmitter, OnInit, ViewChild, HostListener } from '@angular/core';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { B2bFlowService } from '../../b2b-flow.service';

@Component({
  selector: 'odp-path-condition-creator',
  templateUrl: './path-condition-creator.component.html',
  styleUrls: ['./path-condition-creator.component.scss']
})
export class PathConditionCreatorComponent implements OnInit {

  @ViewChild('typeAhead') typeAhead: NgbTypeahead;
  @Input() nodeList: Array<any>;
  @Input() value: string;
  @Input() prevNode: any;
  @Output() valueChange: EventEmitter<string>;
  showConditionWindow: boolean;
  tempValue: string;
  segments: Array<{ label: string, value: string }>;
  logicalConditions: Array<string>;
  selectedSegmentIndex: number;
  textValue: string;
  searchTerm: string = '';
  constructor(private flowService: B2bFlowService) {
    this.nodeList = [];
    this.segments = [];
    this.logicalConditions = ['<', '>', '=', '!', '&&', '||', '(', ')'];
    this.valueChange = new EventEmitter();
  }

  ngOnInit(): void {
    if (this.value) {
      this.segments = this.value.split(' ').map(e => {
        let t = this.variableSuggestions.find(item => item.value == e);
        if (t) {
          return t;
        }
        return { label: e, value: e };
      });
    }
  }

  unsetValue() {
    this.tempValue = null;
    this.value = '';
    this.valueChange.emit(null);
    this.segments.splice(0);
    this.showConditionWindow = false;
  }

  cancel() {
    this.showConditionWindow = false;
  }

  save() {
    // this.value = this.segments.map(e => e.value).join(' ');
    console.log(this.value);
    this.valueChange.emit(this.value);
    this.cancel();
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
        term = term.split(' ').filter((ele) => ele.startsWith("{{") && !ele.endsWith("}")).pop() || '';
        this.searchTerm = term;
        term = term.replace('{{', '');
        if (this.logicalConditions.indexOf(term) > -1) {
          this.segments.push({ label: term, value: term });
          this.typeAhead.writeValue(null);
          return [];
        }
        return term === '' && this.searchTerm === '' ? [] : this.variableSuggestions.filter((v) => v.label.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 15);
      }),
    );


  selectItem(event: any) {
    this.segments.push(event.item);
    setTimeout(() => {
      this.typeAhead.writeValue(null);
    }, 100);
  }

  selectSegment(index: number) {
    this.selectedSegmentIndex = index;
  }

  createSegment(event: any) {
    if (event.target.value && event.target.value.trim()) {
      this.selectItem({ item: { label: event.target.value, value: event.target.value } });
    }
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key == 'Backspace' && this.selectedSegmentIndex > -1) {
      this.segments.splice(this.selectedSegmentIndex, 1);
    }
    this.selectedSegmentIndex = -1;
  }

  isLogicalOperator(seg: { label: string, value: string }) {
    return this.logicalConditions.indexOf(seg.value) > -1;
  }

  get variableSuggestions() {
    return this.flowService.getSuggestions(this.prevNode)
  }

  // getNestedSuggestions(node: any, definition: Array<any>, parentKey?: any) {
  //   let list = [];
  //   if (definition && definition.length > 0) {
  //     definition.forEach((def: any) => {
  //       let key = parentKey ? parentKey + '.' + def.key : def.key;
  //       if (def.type == 'Object') {
  //         list = list.concat(this.getNestedSuggestions(node, def.definition, key));
  //       } else {
  //         let item: any = {};
  //         item.label = (node._id || node.type) + '/body/' + key;
  //         item.value = node._id + '.body.' + key;
  //         list.push(item);
  //         item = {};
  //         item.label = (node._id || node.type) + '/responseBody/' + key;
  //         item.value = node._id + '.responseBody.' + key;
  //         list.push(item);
  //       }
  //     });
  //   }
  //   return list;
  // }

  changeLabel(event) {
    this.textValue = event;
    // const regex = /{{\S+}}/g;
    // const matches = this.textValue.match(regex) || [];
    // if (matches.length > 0) {
    //   matches.forEach((match) => {
    //     const label = match.replace('{{', '').replace('}}', '');
    //     const suggestion = this.variableSuggestions.find(item => item.label === label);
    //     if (suggestion) {
    //       this.textValue = this.textValue.replace(match, suggestion.value);
    //     }
    //   });
    // }
    this.value = this.textValue;
  }

}
