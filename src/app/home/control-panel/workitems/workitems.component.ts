import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'odp-workitems',
  templateUrl: './workitems.component.html',
  styleUrls: ['./workitems.component.scss']
})
export class WorkitemsComponent implements OnInit {

  columnDefs: Array<any>;
  wfData: Array<any>; // currently filling this with dummy data. once API is ready we can use original data

  constructor() {
    const self = this;
    self.columnDefs = [
      {
        show: true,
        key: 'checkbox',
        dataKey: 'checkbox',
        type: 'checkbox',
        width: 30,
        properties: {
          name: 'search'
        }
      },
      {
        show: true,
        properties: {
          name: '#',
        },
        type: 'serial',
        width: 30,
        key: 'count',
        dataKey: 'count'
      },
      {
        show: true,
        properties: {
          name: 'ID',
        },
        type: 'string',
        width: 120,
        key: '_id',
        dataKey: '_id'
      },
      {
        show: true,
        properties: {
          name: 'Type',
        },
        type: 'type',
        width: 50,
        key: 'operation',
        dataKey: 'operation'
      },
      {
        show: true,
        properties: {
          name: 'Component',
        },
        type: 'component',
        width: 150,
        key: 'type',
        dataKey: 'type'
      },
      {
        show: true,
        properties: {
          name: 'Created by',
        },
        type: 'string',
        width: 200,
        key: 'requestedBy',
        dataKey: 'requestedBy'
      },
      {
        show: true,
        properties: {
          name: 'Last Updated',
        },
        type: 'lastUpdated',
        width: 150,
        key: '_metadata.lastUpdated',
        dataKey: '_metadata.lastUpdated'
      },
      {
        show: true,
        properties: {
          name: 'Message',
        },
        type: 'string',
        width: 250,
        key: 'message',
        dataKey: 'message'
      },
      {
        show: true,
        properties: {
          name: 'Action',
        },
        type: 'action',
        width: 50,
        key: 'action',
        dataKey: 'action'
      }
    ];
    self.wfData = [{
      app: 'Bijay-App',
      approvers: [],
      audit: [],
      data: {old: null, new: null},
      documentId: null,
      operation: 'POST',
      requestedBy: 'USR1006',
      serviceId: null,
      status: 'Pending',
      __v: 1,
      _id: 'WF1002',
      type: 'user'
    },
      {
        app: 'Bijay-App',
        approvers: [],
        audit: [],
        data: {old: null, new: null},
        documentId: null,
        operation: 'PUT',
        requestedBy: 'USR1006',
        serviceId: null,
        status: 'Pending',
        __v: 1,
        _id: 'USR1002',
        type: 'group'
      },
      {
        app: 'Bijay-App',
        approvers: [],
        audit: [],
        data: {old: null, new: null},
        documentId: null,
        operation: 'DELETE',
        requestedBy: 'USR1006',
        serviceId: null,
        status: 'Pending',
        __v: 1,
        _id: 'USR1003',
        type: 'user'
      }];
  }

  ngOnInit() {
  }

}
