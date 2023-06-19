import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'odp-sftp-connector',
  templateUrl: './sftp-connector.component.html',
  styleUrls: ['./sftp-connector.component.scss']
})
export class SftpConnectorComponent implements OnInit {

  @Input() edit: any;
  @Input() currNode: any;
  @Input() nodeList: Array<any>;
  toggle: any;
  constructor() {
    this.toggle = {};
  }

  ngOnInit(): void {
    if (!this.currNode.options.put && !this.currNode.options.get) {
      this.currNode.options.put = true;
    }
  }

  setSFTPAction(action: string, flag: boolean) {
    if (action == 'get') {
      delete this.currNode.options.put;
    } else {
      delete this.currNode.options.get;
    }
    if (!this.currNode.options.get && !this.currNode.options.put) {
      this.currNode.options.get = true;
    }
  }
}
