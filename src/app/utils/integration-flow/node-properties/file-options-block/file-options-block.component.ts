import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NodeData, EditConfig, ActivateProperties } from '../../integration-flow.model';
import { IntegrationFlowService } from '../../integration-flow.service';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-file-options-block',
  templateUrl: './file-options-block.component.html',
  styleUrls: ['./file-options-block.component.scss']
})
export class FileOptionsBlockComponent implements OnInit {

  @Input() edit: EditConfig;
  @Input() node: NodeData;
  @Input() nodeList: Array<NodeData>;
  @Input() index: number;
  deleteFilePatternModal: EventEmitter<any>;
  fileExtentionList: Array<string>;
  constructor(private flowService: IntegrationFlowService,
    private commonService: CommonService) {
    const self = this;
    self.node = self.flowService.nodeInstance();
    self.deleteFilePatternModal = new EventEmitter();
    self.fileExtentionList = self.flowService.getFileExtensions();
  }

  ngOnInit() {
    const self = this;
    if (!self.node.meta.fileDetails) {
      self.node.meta.fileDetails = {};
    }
  
  }

  addFilePattern(ele: HTMLInputElement) {
    const self = this;
    const value = ele.value;
    ele.value = null;
    if (!value || !value.trim()) {
      return;
    }
    if (!self.node.meta.fileNameRegexs) {
      self.node.meta.fileNameRegexs = [];
    }
    if (self.node.meta.fileNameRegexs.indexOf(value) > -1) {
      return;
    }
    self.node.meta.fileNameRegexs.push(value);
  }

  removeFilePattern(index: number) {
    const self = this;
    self.deleteFilePatternModal.emit({
      title: 'Delete File Pattern?',
      message: 'Are you sure you want to delete <span class="font-weight-bold text-danger">'
        + self.node.meta.fileNameRegexs[index] + '</span> File Pattern?',
      index
    });
  }

  onDeleteFilePattern(data: any) {
    const self = this;
    if (data) {
      self.node.meta.fileNameRegexs.splice(data.index, 1);
    }
  }

  setFileExtention(checked: boolean, ext: string) {
    const self = this;
    const exts = self.node.meta.fileExtensions || [];
    const index = exts.findIndex(e => e.extension === ext);
    if (checked) {
      exts.push({
        custom: false,
        extension: ext
      });
    } else {
      exts.splice(index, 1);
    }
    self.node.meta.fileExtensions = exts;
  }

  getFileExtention(ext: string) {
    const self = this;
    const exts = self.node.meta.fileExtensions || [];
    const index = exts.findIndex(e => e.extension === ext);
    if (index > -1) {
      return true;
    }
    return false;
  }

  addCustomExtention(extentionEle: HTMLInputElement) {
    const self = this;
    let extention = extentionEle.value;
    extentionEle.value = '';
    if (!self.edit.status) {
      return;
    }
    if (!self.node.meta.fileExtensions) {
      self.node.meta.fileExtensions = [];
    }
    if (!extention || !extention.trim()) {
      return;
    }
    if (extention.startsWith('.')) {
      extention = extention.substr(1, extention.length);
    }
    if (self.node.meta.fileExtensions.findIndex(e => e.extension === extention) > -1) {
      return;
    }
    let custom = true;
    if (self.fileExtentionList.findIndex(e => e === extention) > -1) {
      custom = false;
    }
    self.node.meta.fileExtensions.push({
      custom,
      extension: extention
    });
  }

  removeCustomExtention(extention: string) {
    const self = this;
    if (!self.node.meta.fileExtensions) {
      self.node.meta.fileExtensions = [];
    }
    const index = self.node.meta.fileExtensions.findIndex(e => e.extension === extention);
    if (index > -1) {
      self.node.meta.fileExtensions.splice(index, 1);
    }
  }

  get validFileSize() {
    const self = this;
    const unit: string = self.b2BAgentMaxFileSize.split('').pop();
    let fileMaxSize = parseInt(self.b2BAgentMaxFileSize.substr(0, self.b2BAgentMaxFileSize.length - 1), 10);
    if (unit.toLowerCase() === 'g') {
      fileMaxSize *= 1024 * 1024 * 1024;
    } else if (unit.toLowerCase() === 'm') {
      fileMaxSize *= 1024 * 1024;
    } else if (unit.toLowerCase() === 'k') {
      fileMaxSize *= 1024;
    }
    if (typeof self.node.meta.fileMaxSize === 'number'
      && self.node.meta.fileMaxSize !== 0
      && self.node.meta.fileMaxSize > fileMaxSize) {
      return false;
    }
    return true;
  }

  get showBlock() {
    const self = this;
    if (self.node && self.node.meta.sourceType === 'FILE') {
      return true;
    }
    return false;
  }

  get isInputBlock() {
    const self = this;
    if (self.node && self.node.meta.blockType === 'INPUT') {
      return true;
    }
    return false;
  }

  get showSkipRows() {
    const self = this;
    if (self.node && (self.node.meta.contentType === 'EXCEL'
      || self.node.meta.contentType === 'CSV'
      || self.node.meta.contentType === 'FLATFILE')) {
      return true;
    }
    return false;
  }

  get showExtensions() {
    const self = this;
    if (self.node && (self.node.meta.contentType === 'BINARY')) {
      return true;
    }
    return false;
  }

  get customExtensions() {
    const self = this;
    if (self.node.meta.fileExtensions) {
      return self.node.meta.fileExtensions.filter(e => e.custom);
    }
    return [];
  }

  get b2BAgentMaxFileSize() {
    const self = this;
    return (self.commonService.userDetails.b2BAgentMaxFileSize || '100k');
  }
}
