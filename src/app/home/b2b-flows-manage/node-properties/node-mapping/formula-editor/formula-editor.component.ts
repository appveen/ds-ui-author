import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CommonService } from 'src/app/utils/services/common.service';
import { B2bFlowService } from '../../../b2b-flow.service';

@Component({
  selector: 'odp-formula-editor',
  templateUrl: './formula-editor.component.html',
  styleUrls: ['./formula-editor.component.scss']
})
export class FormulaEditorComponent implements OnInit {

  @Input() class: string;
  @Input() disabled: boolean;
  @Input() field: any;
  @Input() currNode: any;
  @Input() data: any;
  @Output() dataChange: EventEmitter<any>;
  @Output() close: EventEmitter<any>;
  searchTerm: string;
  tempData: any;
  variableSuggestions: Array<{ label: string, value: string }>;
  suggestions: any = [];
  availableMethods: Array<any>;
  insertText: EventEmitter<string>;
  nodeList: Array<any>;
  fetchingFormulas: boolean;
  $triggerSearch: Subject<string>;
  constructor(private flowService: B2bFlowService,
    private commonService: CommonService) {
    this.dataChange = new EventEmitter();
    this.close = new EventEmitter();
    this.variableSuggestions = [];
    this.availableMethods = [];
    this.field = {};
    this.insertText = new EventEmitter();
    this.$triggerSearch = new Subject();
  }

  ngOnInit(): void {
    // this.availableMethods = this.flowService.getAvailableTransformMethods();
    this.fetchAllFormulas();
    this.tempData = this.data;
    this.nodeList = this.flowService.getNodesBefore(this.currNode);
    const temp = this.nodeList.map(node => {
      let list = [];
      let statusCode: any = {};
      statusCode.nodeId = node._id;
      statusCode.label = (node.name || node.type) + '/statusCode';
      statusCode.value = `{{${node._id}.statusCode}}`;
      list.push(statusCode);
      let status: any = {};
      status.nodeId = node._id;
      status.label = (node.name || node.type) + '/status';
      status.value = `{{${node._id}.status}}`;
      list.push(status);
      let headers: any = {};
      headers.nodeId = node._id;
      headers.label = (node.name || node.type) + '/headers';
      headers.value = `{{${node._id}.headers}}`;
      list.push(headers);
      if (!node.dataStructure) {
        node.dataStructure = {};
      }
      if (!node.dataStructure.incoming) {
        node.dataStructure.incoming = {};
      }
      if (!node.dataStructure.outgoing) {
        node.dataStructure.outgoing = {};
      }
      if (node.dataStructure.incoming.definition) {
        list = list.concat(this.getNestedSuggestions(node, node.dataStructure.incoming.definition, 'body'));
      }
      if (node.dataStructure.outgoing.definition) {
        list = list.concat(this.getNestedSuggestions(node, node.dataStructure.outgoing.definition, 'responseBody'));
      }
      return list;
    })
    this.variableSuggestions = _.flatten(temp);
    this.$triggerSearch.pipe(debounceTime(200)).subscribe(() => {
      this.fetchAllFormulas();
    });
    this.suggestions = this.flowService.getSuggestions(this.currNode)
  }

  fetchAllFormulas() {
    this.fetchingFormulas = true;
    let options: any = {
      count: 10,
      page: 1,
      noApp: true
    };
    if (this.searchTerm) {
      options.filter = {
        name: `/${this.searchTerm}/`
      };
    }
    this.commonService.get('user', '/admin/metadata/mapper/formula', options).subscribe(res => {
      this.availableMethods = res;
      this.fetchingFormulas = false;
    }, err => {
      this.fetchingFormulas = false;
      this.commonService.errorToast(err);
    })
  }

  placeValue(item: any) {
    this.insertText.emit(item.value);
  }

  placeMethod(item: any) {
    let value = `${item.name}(${item.params.map(e => e.name).join(', ')})`;
    this.insertText.emit(value);
  }

  cancel() {
    this.close.emit(false);
    this.tempData = this.data;
  }

  done() {
    this.close.emit(false);
    this.data = this.tempData;
    this.dataChange.emit(this.data);
  }

  getDataTypeStyleClass(type: string) {
    switch (type) {
      case 'String':
        return 'text-success';
      case 'Number':
        return 'text-warning';
      case 'Boolean':
        return 'text-info';
      case 'Object':
        return 'text-grey';
      case 'Array':
        return 'text-grey';
      default:
        return 'text-primary';
    }
  }

  getLableAsArray(label: string) {
    if (label) {
      return label.split('/');
    }
    return [];
  }

  getNestedSuggestions(node: any, definition: Array<any>, bodyKey: string, parentKey?: any) {
    let list = [];
    if (definition && definition.length > 0) {
      definition.forEach((def: any) => {
        let key = parentKey ? parentKey + '.' + def.key : def.key;
        if (def.type == 'Object') {
          list = list.concat(this.getNestedSuggestions(node, def.definition, bodyKey, key));
        } else {
          let item: any = {};
          item.nodeId = node._id;
          item.label = (node.name || node.type) + `/${bodyKey}/` + key;
          item.value = `{{${node._id}.${bodyKey}.${key}}}`;
          list.push(item);
        }
      });
    }
    return list;
  }

  replaceSelectedText(html: string) {
    var sel, range;
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();

      // Range.createContextualFragment() would be useful here but is
      // non-standard and not supported in all browsers (IE9, for one)
      var el = document.createElement("div");
      el.innerHTML = html;
      var frag = document.createDocumentFragment(), node, lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);

      // Preserve the selection
      if (lastNode) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }
}
