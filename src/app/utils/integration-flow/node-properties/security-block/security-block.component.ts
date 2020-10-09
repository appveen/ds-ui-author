import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { NodeData, EditConfig, ActivateProperties } from '../../integration-flow.model';
import { IntegrationFlowService } from '../../integration-flow.service';

@Component({
  selector: 'odp-security-block',
  templateUrl: './security-block.component.html',
  styleUrls: ['./security-block.component.scss']
})
export class SecurityBlockComponent implements OnInit {

  @Input() edit: EditConfig;
  @Input() node: NodeData;
  @Input() nodeList: Array<NodeData>;
  @Input() index: number;
  @Input() partner: FormGroup;
  deleteIPModal: EventEmitter<any>;
  constructor(private flowService: IntegrationFlowService) {
    const self = this;
    self.deleteIPModal = new EventEmitter();
    self.node = self.flowService.nodeInstance();
    self.nodeList = [];
  }

  ngOnInit() {
    const self = this;
    self.flowService.activateProperties.subscribe((data: ActivateProperties) => {
      self.nodeList = data.nodeList;
      self.index = data.index;
      self.node = self.nodeList[data.index];
      self.partner = data.partner;
    });
  }

  addIP(ele: HTMLInputElement, values?: Array<string>) {
    const self = this;
    if (!ele && (!values || values.length === 0)) {
      return;
    }
    if (!values || values.length === 0) {
      values = [ele.value];
    }
    const validValues = values.filter(e => !self.flowService.isInvalidIP(e));
    if (validValues.length === 0) {
      return;
    }
    setTimeout(() => {
      ele.value = null;
    }, 200);
    if (!self.node.meta.ipList) {
      self.node.meta.ipList = [];
    }
    validValues.forEach(value => {
      if (self.node.meta.ipList.indexOf(value) === -1) {
        self.node.meta.ipList.push(value);
      }
    });
  }

  removeIP(index: number) {
    const self = this;
    self.deleteIPModal.emit({
      title: 'Delete IP?',
      message: 'Are you sure you want to delete <span class="font-weight-bold text-danger">' + self.ipList[index] + '</span> IP?',
      index
    });
  }

  pasteIP(event: ClipboardEvent) {
    const self = this;
    const clipboardData = event.clipboardData.getData('text');
    if (clipboardData) {
      self.addIP((event.target as any), clipboardData.split(/[\n\t\s]/).filter(e => e));
    }
  }

  removeAllIP() {
    const self = this;
    self.deleteIPModal.emit({
      title: 'Delete IP(s)?',
      message: 'Are you sure you want to delete <span class="font-weight-bold text-danger">All</span> IP?',
      removeAll: true
    });
  }

  invalidIP(value: string) {
    const self = this;
    return self.flowService.isInvalidIP(value);
  }

  onDeleteIP(data: any) {
    const self = this;
    if (data) {
      if (data.removeAll) {
        self.node.meta.ipList.splice(0);
      } else {
        self.node.meta.ipList.splice(data.index, 1);
      }
    }
  }

  getCertificate(secretId: string) {
    const self = this;
    if (!self.node.meta.secretIds) {
      self.node.meta.secretIds = [];
    }
    return self.node.meta.secretIds.indexOf(secretId) > -1;
  }

  setCertificate(value: boolean, secretId: string) {
    const self = this;
    if (!self.node.meta.secretIds) {
      self.node.meta.secretIds = [];
    }
    const index = self.node.meta.secretIds.indexOf(secretId);
    if (value) {
      if (index === -1) {
        self.node.meta.secretIds.push(secretId);
      }
    } else {
      self.node.meta.secretIds.splice(index, 1);
    }
  }

  configureSSLSettings() {
    const self = this;
    if (self.node) {
      if (self.node.meta.connectionDetails.trustAllCerts) {
        self.node.meta.secretIds = [];
        if (self.twoWaySSL) {
          self.node.meta.connectionDetails.connectionType = 'CERTIFICATE-KEY';
          self.node.meta.connectionDetails.sslType = 'TWO-WAY';
        } else {
          self.node.meta.connectionDetails.connectionType = 'CERTIFICATE-KEY';
          self.node.meta.connectionDetails.sslType = 'ONE-WAY';
        }
      } else {
        if (self.validateServerIdentity || self.validateClientIdentity) {
          if (self.twoWaySSL) {
            self.node.meta.connectionDetails.connectionType = 'CERTIFICATE-KEY';
            self.node.meta.connectionDetails.sslType = 'TWO-WAY';
          } else {
            self.node.meta.connectionDetails.connectionType = 'CERTIFICATE-KEY';
            self.node.meta.connectionDetails.sslType = 'ONE-WAY';
          }
        } else {
          self.node.meta.secretIds = [];
          if (self.twoWaySSL) {
            self.node.meta.connectionDetails.connectionType = 'CERTIFICATE-KEY';
            self.node.meta.connectionDetails.sslType = 'TWO-WAY';
          } else {
            self.node.meta.connectionDetails.connectionType = 'PLAIN';
            self.node.meta.connectionDetails.sslType = null;
          }
        }
      }
    }
  }

  get hasHttps() {
    const self = this;
    if (self.node && self.node.meta.connectionDetails.url) {
      return self.node.meta.connectionDetails.url.startsWith('https:');
    }
    return false;
  }

  get trustAllCerts() {
    const self = this;
    if (self.node && self.node.meta.connectionDetails.trustAllCerts) {
      return true;
    } else {
      return false;
    }
  }

  set trustAllCerts(val) {
    const self = this;
    if (self.node) {
      self.node.meta.connectionDetails.trustAllCerts = val;
      self.configureSSLSettings();
    }
  }

  get validateServerIdentity() {
    const self = this;
    if (self.node && self.node.meta.connectionDetails.validateServerIdentity) {
      return true;
    } else {
      return false;
    }
  }

  set validateServerIdentity(val) {
    const self = this;
    if (self.node) {
      self.node.meta.connectionDetails.validateServerIdentity = val;
      self.configureSSLSettings();
    }
  }


  get validateClientIdentity() {
    const self = this;
    if (self.node && self.node.meta.connectionDetails.validateClientIdentity) {
      return true;
    } else {
      return false;
    }
  }

  set validateClientIdentity(val) {
    const self = this;
    if (self.node) {
      self.node.meta.connectionDetails.validateClientIdentity = val;
      self.configureSSLSettings();
    }
  }

  get twoWaySSL() {
    const self = this;
    if (self.node && self.node.meta.connectionDetails.twoWaySSL) {
      return true;
    } else {
      return false;
    }
  }
  set twoWaySSL(val) {
    const self = this;
    if (self.node) {
      self.node.meta.connectionDetails.twoWaySSL = val;
      self.configureSSLSettings();
    }
  }

  get enableIPWhitelist() {
    const self = this;
    if (self.node.meta.ipWhitelistEnabled) {
      return true;
    } else {
      return false;
    }
  }
  set enableIPWhitelist(val) {
    const self = this;
    if (self.node) {
      self.node.meta.ipWhitelistEnabled = val;
      if (!val) {
        self.node.meta.ipList = [];
      }
    }
  }

  get ipList() {
    const self = this;
    return self.node.meta.ipList || [];
  }

  get showTwoWaySSL() {
    const self = this;
    if (self.node && self.node.meta.blockType === 'INPUT' && self.node.meta.sourceType === 'REST') {
      return true;
    }
    return false;
  }

  get certificates() {
    const self = this;
    if (self.partner && self.partner.get('secrets') && self.partner.get('secrets').value) {
      return self.partner.get('secrets').value.filter(e => e.type === 'certificate');
    }
    return [];
  }

}
