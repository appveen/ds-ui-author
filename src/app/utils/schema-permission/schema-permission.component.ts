import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

@Component({
    selector: 'odp-schema-permission',
    templateUrl: './schema-permission.component.html',
    styleUrls: ['./schema-permission.component.scss']
})
export class SchemaPermissionComponent implements OnInit {

    @Input() schema: any;
    @Input() edit: any;
    @Output() close: EventEmitter<any> = new EventEmitter<any>();
    permissions: any;
    defintion: any = [];


    constructor() { }
    ngOnInit() {
        this.edit = { status: true }
        this.schema = {
            "_id": "SRVC2014",
            "name": "TestDS",
            "attributeCount": 11,
            "definition": [
                {
                    "key": "_id",
                    "type": "String",
                    "prefix": "TES",
                    "suffix": null,
                    "padding": null,
                    "counter": 1001,
                    "properties": {
                        "label": null,
                        "readonly": false,
                        "errorMessage": null,
                        "name": "ID",
                        "required": false,
                        "fieldLength": 10,
                        "_description": null,
                        "_typeChanged": "id",
                        "_isParrentArray": null,
                        "_isGrpParentArray": null,
                        "dataPath": "_id",
                        "_detailedType": "",
                        "dataPathSegs": [
                            "_id"
                        ]
                    },
                    "_id": "64995e53eb9415121551ddb5"
                },
                {
                    "key": "name",
                    "type": "String",
                    "properties": {
                        "name": "Name",
                        "fieldLength": 10,
                        "_typeChanged": "String",
                        "dataPath": "name",
                        "dataPathSegs": [
                            "name"
                        ]
                    },
                    "_id": "64995e53eb9415121551ddb6"
                },
                {
                    "key": "phone",
                    "type": "String",
                    "properties": {
                        "name": "Phone",
                        "fieldLength": 10,
                        "_typeChanged": "String",
                        "dataPath": "phone",
                        "dataPathSegs": [
                            "phone"
                        ]
                    },
                    "_id": "64995e53eb9415121551ddb7"
                },
                {
                    "key": "address",
                    "type": "String",
                    "properties": {
                        "name": "Address",
                        "fieldLength": 10,
                        "_typeChanged": "String",
                        "dataPath": "address",
                        "dataPathSegs": [
                            "address"
                        ]
                    },
                    "_id": "64995e53eb9415121551ddb8"
                },
                {
                    "key": "date",
                    "type": "Date",
                    "properties": {
                        "name": "Date",
                        "fieldLength": 10,
                        "_typeChanged": "Date",
                        "dateType": "date",
                        "defaultTimezone": "Zulu",
                        "supportedTimezones": [],
                        "dataPath": "date",
                        "dataPathSegs": [
                            "date"
                        ]
                    },
                    "_id": "64995e53eb9415121551ddb9"
                },
                {
                    "key": "dateTime",
                    "type": "Date",
                    "properties": {
                        "name": "DateTime",
                        "fieldLength": 10,
                        "_typeChanged": "Date",
                        "dateType": "datetime-local",
                        "defaultTimezone": "Zulu",
                        "supportedTimezones": [],
                        "dataPath": "dateTime",
                        "dataPathSegs": [
                            "dateTime"
                        ]
                    },
                    "_id": "64995e53eb9415121551ddba"
                },
                {
                    "key": "testField3",
                    "type": "String",
                    "properties": {
                        "name": "TestField3",
                        "fieldLength": 10,
                        "_typeChanged": "String",
                        "dataPath": "testField3",
                        "dataPathSegs": [
                            "testField3"
                        ]
                    },
                    "_id": "64995e53eb9415121551ddbb"
                },
                {
                    "key": "testGroup",
                    "type": "Object",
                    "definition": [
                        {
                            "type": "String",
                            "key": "name",
                            "properties": {
                                "name": "Name",
                                "fieldLength": 10,
                                "_typeChanged": "String",
                                "dataPathSegs": [
                                    "testGroup",
                                    "name"
                                ],
                                "dataPath": "testGroup.name"
                            }
                        },
                        {
                            "type": "String",
                            "key": "phone",
                            "properties": {
                                "name": "Phone",
                                "fieldLength": 10,
                                "_typeChanged": "String",
                                "dataPathSegs": [
                                    "testGroup",
                                    "phone"
                                ],
                                "dataPath": "testGroup.phone"
                            }
                        },
                        {
                            "type": "String",
                            "key": "email",
                            "properties": {
                                "name": "Email",
                                "fieldLength": 10,
                                "_typeChanged": "String",
                                "dataPathSegs": [
                                    "testGroup",
                                    "email"
                                ],
                                "dataPath": "testGroup.email"
                            }
                        },
                        {
                            "type": "Array",
                            "key": "testGroup2",
                            "properties": {
                                "name": "TestGroup2",
                                "fieldLength": 10,
                                "_typeChanged": "Array",
                                "dataPathSegs": [
                                    "testGroup",
                                    "testGroup2"
                                ],
                                "dataPath": "testGroup.testGroup2"
                            },
                            "definition": [
                                {
                                    "type": "Object",
                                    "key": "_self",
                                    "properties": {
                                        "fieldLength": 10,
                                        "_typeChanged": "Object",
                                        "dataPathSegs": [
                                            "testGroup",
                                            "testGroup2",
                                            "[#]"
                                        ],
                                        "dataPath": "testGroup.testGroup2[#]"
                                    },
                                    "definition": [
                                        {
                                            "type": "String",
                                            "key": "keys",
                                            "properties": {
                                                "name": "Keys",
                                                "fieldLength": 10,
                                                "_typeChanged": "String",
                                                "dataPathSegs": [
                                                    "testGroup",
                                                    "testGroup2",
                                                    "[#]",
                                                    "keys"
                                                ],
                                                "dataPath": "testGroup.testGroup2[#].keys"
                                            }
                                        },
                                        {
                                            "type": "Object",
                                            "key": "values",
                                            "properties": {
                                                "name": "Values",
                                                "fieldLength": 10,
                                                "_typeChanged": "Object",
                                                "dataPathSegs": [
                                                    "testGroup",
                                                    "testGroup2",
                                                    "[#]",
                                                    "values"
                                                ],
                                                "dataPath": "testGroup.testGroup2[#].values"
                                            },
                                            "definition": [
                                                {
                                                    "type": "String",
                                                    "key": "key",
                                                    "properties": {
                                                        "name": "Key1",
                                                        "fieldLength": 10,
                                                        "_typeChanged": "String",
                                                        "dataPathSegs": [
                                                            "testGroup",
                                                            "testGroup2",
                                                            "[#]",
                                                            "values",
                                                            "key"
                                                        ],
                                                        "dataPath": "testGroup.testGroup2[#].values.key"
                                                    }
                                                },
                                                {
                                                    "type": "String",
                                                    "key": "vol1",
                                                    "properties": {
                                                        "name": "Vol1",
                                                        "fieldLength": 10,
                                                        "_typeChanged": "String",
                                                        "dataPathSegs": [
                                                            "testGroup",
                                                            "testGroup2",
                                                            "[#]",
                                                            "values",
                                                            "vol1"
                                                        ],
                                                        "dataPath": "testGroup.testGroup2[#].values.vol1"
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    "properties": {
                        "name": "TestGroup",
                        "fieldLength": 10,
                        "_typeChanged": "Object",
                        "dataPath": "testGroup",
                        "dataPathSegs": [
                            "testGroup"
                        ]
                    },
                    "_id": "64995e53eb9415121551ddbc"
                }
            ],
            "formatType": "JSON",
            "_selected": true
        }

        this.addPermission(this.schema)
        console.log('this.schema:', this.schema)
        this.defintion = this.schema.definition;


    }

    addPermission(obj: any) {
        if (obj.definition && obj.definition.length > 0) {
            obj.definition.forEach(ele => {
                if (ele.definition && ele.definition.length > 0) {
                    this.addPermission(ele)
                }
                else {
                    ele['permission'] = ''
                }
            });
        }
    }

    closeWindow() {
        // if (!this.format) {
        //   this.selectedType = 'generic';
        // }
        // this.tempFormat = this.format;
        // this.setSelectedType();
        this.close.emit();

    }


    onTypeChange(type, def) {

    }
}
