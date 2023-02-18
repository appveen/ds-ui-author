import { Component, Input, Output, EventEmitter, OnInit, ViewChild, HostListener } from '@angular/core';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'odp-path-condition-creator',
  templateUrl: './path-condition-creator.component.html',
  styleUrls: ['./path-condition-creator.component.scss']
})
export class PathConditionCreatorComponent implements OnInit {

  @ViewChild('typeAhead') typeAhead: NgbTypeahead;
  @Input() nodeList: Array<any>;
  @Input() value: string;
  @Output() valueChange: EventEmitter<string>;
  showConditionWindow: boolean;
  tempValue: string;
  segments: Array<{ label: string, value: string }>;
  logicalConditions: Array<string>;
  selectedSegmentIndex: number;
  constructor() {
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
    this.value = null;
    this.valueChange.emit(null);
    this.segments.splice(0);
    this.showConditionWindow = false;
  }

  cancel() {
    this.showConditionWindow = false;
  }

  save() {
    this.value = this.segments.map(e => e.value).join(' ');
    console.log(this.value);
    this.valueChange.emit(this.value);
    this.cancel();
  }

  formatter(result: any) {
    if (result && typeof result == 'object') {
      return result.label.toUpperCase();
    }
    return result;
  };

  search: OperatorFunction<string, readonly { label: string, value: string }[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) => {
        if (this.logicalConditions.indexOf(term) > -1) {
          this.segments.push({ label: term, value: term });
          this.typeAhead.writeValue(null);
          return [];
        }
        return term === '' ? [] : this.variableSuggestions.filter((v) => v.label.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10);
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

  get variableSuggestions(): Array<{ label: string, value: string }> {
    if (!this.nodeList || this.nodeList.length == 0) {
      return [];
    }
    const temp = this.nodeList.map(node => {
      let list = [];
      let statusCode: any = {};
      statusCode.label = (node.name || node.type) + '/statusCode'
      statusCode.value = `node['${node._id}']` + '.statusCode'
      list.push(statusCode);
      let status: any = {};
      status.label = (node.name || node.type) + '/status'
      status.value = `node['${node._id}']` + '.status'
      list.push(status);
      let headers: any = {};
      headers.label = (node.name || node.type) + '/headers'
      headers.value = `node['${node._id}']` + '.headers'
      list.push(headers);
      node.dataStructure.outgoing.definition.forEach(def => {
        let item: any = {};
        item.label = (node.name || node.type) + '/body/' + def.key;
        item.value = `node['${node._id}']` + '.body.' + def.key;
        list.push(item);
      });
      return list;
    })
    return _.flatten(temp);
  }
}
