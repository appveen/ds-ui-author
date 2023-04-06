import { Injectable, EventEmitter } from '@angular/core';
import { FormArray, FormControl, Validators } from '@angular/forms';
import * as deepmerge from 'deepmerge';
import * as uuid from 'uuid/v1';
import * as _ from 'lodash';
import * as momentTimeZone from 'moment-timezone';

import { ipValidate } from '../validators/ip.validator';
import { RoleModel } from 'src/app/home/schema-utils/manage-permissions/manage-permissions.component';
import { NodeData } from '../integration-flow/integration-flow.model';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AppService {
    cloneServiceId: string;
    editServiceId: string;
    purgeServiceId: string;
    editLibraryId: string;
    cloneLibraryId: string;
    loginComponent: boolean;
    editUser: boolean;
    toggleSideNav: EventEmitter<boolean>;
    detectPermissionChange: EventEmitter<boolean>;
    ldapUserPass: string;
    ldapDN: string;
    userPass: string;
    resetUserPwd: EventEmitter<boolean>;
    openAppSwitcher: EventEmitter<any>;
    edit: boolean;
    clone: boolean;
    azureToken: string;
    setFocus: EventEmitter<any>;
    fqdn: string;
    formatTypeChange: EventEmitter<any>;
    validAuthTypes: string[];
    updateCodeEditorState: EventEmitter<any>;
    connectorsList: Array<any>;
    storageTypes: Array<any>
    cityNames: Array<string>;
    invokeEvent = new Subject()
    constructor() {
        const self = this;
        self.toggleSideNav = new EventEmitter<boolean>();
        self.resetUserPwd = new EventEmitter<boolean>();
        self.openAppSwitcher = new EventEmitter<boolean>();
        self.detectPermissionChange = new EventEmitter<boolean>();
        self.setFocus = new EventEmitter<any>();
        this.formatTypeChange = new EventEmitter<any>();
        this.updateCodeEditorState = new EventEmitter<any>();
        this.cityNames = [
            "ALBANY",
            "NEWARK",
            "JERSEY",
            "HAVANA",
            "MEXICO",
            "PANAMA",
            "DUBLIN",
            "OXFORD",
            "LONDON",
            "CALAIS",
            "MONACO",
            "MADRID",
            "LISBON",
            "MUNICH",
            "BERLIN",
            "VIENNA",
            "PRAGUE",
            "WARSAW",
            "LARVIK",
            "MOSCOW",
            "ZURICH",
            "GENEVA",
            "LUGANO",
            "VENICE",
            "NAPLES",
            "TIRANA",
            "ATHENS",
            "ANKARA",
            "ALMATY",
            "BANJUL",
            "MALABO",
            "SHIRAZ",
            "TEHRAN",
            "YANGON",
            "SAIGON",
            "TAIPEI",
            "DARWIN",
            "CAIRNS",
            "HOBART",
            "SYDNEY",
            "LAHORE",
            "KANPUR",
            "MUMBAI",
            "COCHIN",
            "MYSORE",
            "COONOR",
            "RAJKOT",
            "BARODA",
            "BHOPAL",
            "UJJAIN",
            "JAIPUR",
            "PANAJI",
            "MADRAS",
            "TRICHY",
            "RAIPUR"
        ];
    }

    flattenObject(obj, parent?) {
        const self = this;
        let temp = {};
        if (obj) {
            Object.keys(obj).forEach(key => {
                const fieldKey = parent ? parent + '.' + key : key;
                if (typeof obj[key] !== 'object') {
                    temp[fieldKey] = obj[key];
                } else {
                    temp = Object.assign(temp, self.flattenObject(obj[key], fieldKey));
                }
            });
        }
        return temp;
    }

    unFlattenObject(fields) {
        let temp = {};
        Object.keys(fields).forEach(key => {
            const keys = key.split('.');
            if (keys.length > 1) {
                keys.reverse();
                const tempObj = keys.reduce((p, c) => {
                    return Object.defineProperty({}, c, {
                        value: p,
                        enumerable: true,
                        configurable: true,
                        writable: true
                    });
                }, fields[key]);
                temp = deepmerge(temp, tempObj);
            } else {
                temp[key] = fields[key];
            }
        });
        return temp;
    }

    makeArray(obj) {
        let temp = [];
        Object.keys(obj).forEach(key => {
            if (key && key.match(/[0-9]+/)) {
                temp.push(obj[key]);
            } else if (typeof obj[key] === 'object') {
                obj[key] = this.makeArray(obj[key]);
            } else {
                temp = obj;
            }
        });
        return temp;
    }

    cloneObject(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    rand(index: number) {
        const i = Math.pow(10, index - 1);
        const j = Math.pow(10, index) - 1;
        return Math.floor(Math.random() * (j - i + 1)) + i;
    }

    randomStr(len: number) {
        let str = '';
        const possible =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < len; i++) {
            str += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return str;
    }

    randomID(len: number) {
        let str = '';
        const possible =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < len; i++) {
            str += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return str;
    }

    listenForChildClosed(childWindow: Window): Promise<{ status?: number, body?: any }> {
        return new Promise((resolve, reject) => {
            let timer;
            const checkChild = () => {
                if (!childWindow) {
                    clearInterval(timer);
                    reject(false);
                    return;
                }
                if (childWindow.closed) {
                    clearInterval(timer);
                    let status: any = localStorage.getItem('azure-status');
                    if (status) {
                        status = parseInt(status, 10);
                    }
                    let body: any = localStorage.getItem('azure-body');
                    try {
                        body = unescape(body);
                        body = JSON.parse(body);
                    } catch (e) { }
                    localStorage.removeItem('azure-status');
                    localStorage.removeItem('azure-body');
                    resolve({ status, body });
                }
            };
            timer = setInterval(checkChild, 500);
        });
    }

    getDefaultRoles(): Array<RoleModel> {
        const mp = 'P' + this.rand(10);
        const vp = 'P' + this.rand(10);
        return [
            {
                manageRole: true,
                id: mp,
                name: 'Manage',
                operations: [
                    {
                        method: 'POST'
                    },
                    {
                        method: 'PUT'
                    },
                    {
                        method: 'DELETE'
                    },
                    {
                        method: 'GET'
                    }
                ],
                description: 'This role entitles an authorized user to create, update or delete a record'
            },
            {
                viewRole: true,
                id: vp,
                name: 'View',
                operations: [
                    {
                        method: 'GET'
                    }
                ],
                description: 'This role entitles an authorized user to view the record'
            }
        ];
    }

    getDefaultFields(roleIds: Array<string>, definition: Array<any>, fields: any) {
        if (typeof fields === 'string') {
            fields = JSON.parse(fields);
        }
        definition.forEach(def => {
            if (!def.properties) {
                def.properties = {};
            }
            if (def.key !== '_id') {
                if (def.type === 'Object') {
                    if (!fields[def.key]) {
                        fields[def.key] = {};
                    }
                    this.getDefaultFields(roleIds, def.definition, fields[def.key]);
                } else {
                    if (!fields[def.key]) {
                        fields[def.key] = {};
                    }
                    if (['String', 'Number', 'Boolean', 'Date', 'Array'].indexOf(def.type) > -1) {
                        fields[def.key]['_t'] = def.type;
                    } else if (def.type) {
                        fields[def.key]['_t'] = 'String';
                    }
                    if (!fields[def.key]['_p']) {
                        fields[def.key]['_p'] = {};
                    }
                    roleIds.forEach(id => {
                        if (!fields[def.key]['_p'][id]) {
                            fields[def.key]['_p'][id] = 'R';
                        }
                    });
                }
            } else {
                if (!fields[def.key]) {
                    fields[def.key] = {};
                }
                fields[def.key]['_t'] = 'String';
                if (!fields[def.key]['_p']) {
                    fields[def.key]['_p'] = {};
                }
                roleIds.forEach(id => {
                    if (!fields[def.key]['_p'][id]) {
                        fields[def.key]['_p'][id] = 'R';
                    }
                });
            }
        });
        const keys = Object.keys(fields);
        keys.forEach(key => {
            if (!definition.find(e => e.key === key)) {
                delete fields[key];
            }
        });
        return fields;
    }

    removeField(arr: FormArray, fieldId) {
        const self = this;
        let temp = -1;
        arr.controls.forEach((e, i) => {
            if (!e.get('_id')) {
                if (e.get('_fieldId').value === fieldId) {
                    temp = i;
                } else if (e.get('type').value === 'Object') {
                    self.removeField(e.get('definition') as FormArray, fieldId);
                } else if (e.get('type').value === 'Array' && e.get(['definition', 0, 'type']).value === 'Object') {
                    self.removeField(e.get(['definition', 0, 'definition']) as FormArray, fieldId);
                }
            }
        });
        if (temp > -1) {
            arr.removeAt(temp);
        }
    }

    getValue(key, obj) {
        if (!obj) {
            return null;
        }
        if (obj[key]) {
            return obj[key];
        }
        return key.split('.').reduce((prev, curr) => {
            return prev ? prev[curr] : null;
        }, obj);
    }

    isInvalidFlow(items: Array<NodeData>) {
        const inputBlock = items.find(e => e.meta.blockType === 'INPUT');
        const outputBlock = items.find(e => e.meta.blockType === 'OUTPUT');
        const others = items.filter(e => e.meta.blockType !== 'INPUT' && e.meta.blockType !== 'OUTPUT');
        if (items.length < 2) {
            return true;
        }
        if (outputBlock
            && outputBlock.meta.targetType !== 'FILE'
            && (!outputBlock.meta.connectionDetails.url || !this.isValidURL(outputBlock.meta.connectionDetails.url))) {
            return true;
        }
        if (inputBlock && !inputBlock.source && inputBlock.meta.contentType !== 'BINARY') {
            return true;
        }
        if (inputBlock && inputBlock.meta.sourceType === 'FILE' && !inputBlock.meta.source) {
            return true;
        }
        if (inputBlock && inputBlock.meta.sourceType === 'FILE'
            && inputBlock.meta.uniqueRemoteTransaction
            && inputBlock.meta.uniqueRemoteTransactionOptions
            && !(inputBlock.meta.uniqueRemoteTransactionOptions.fileName || inputBlock.meta.uniqueRemoteTransactionOptions.checksum)) {
            return true;
        }
        if (outputBlock && !outputBlock.target && outputBlock.meta.contentType !== 'BINARY') {
            return true;
        }
        if (outputBlock && outputBlock.meta.targetType === 'FILE' && !outputBlock.meta.target) {
            return true;
        }
        if (others && others.length > 0
            && others.filter(e => (e.source && e.target)
                || (e.targetFormat && e.targetFormat.type === 'binary')
                || (e.sourceFormat && e.sourceFormat.type === 'binary')).length !== others.length) {
            return true;
        }
        const mappings = items.filter((e, i) => {
            if (i > 0) {
                const left = items[i - 1];
                const right = items[i];
                if (left.target !== right.source && !right.meta.xslt && right.meta.contentType !== 'BINARY') {
                    return true;
                }
                return false;
            }
        });
        if (mappings.length > 0) {
            return true;
        }
        return false;
    }

    getDataPath(fullPath: string, type: string, hasRoot: boolean, rootDataKey: string) {
        const segments = fullPath.split('_self');
        let path;
        if (segments[segments.length - 1] === '' && type !== 'Object') {
            path = '.';
        } else {
            path = (segments[segments.length - 1] ? segments[segments.length - 1] : segments[segments.length - 2])
                .split('.definition.').join('.').replace(/^\/(.*)/, '$1');
            if (type === 'Array') {
                path = path + '[]';
            }
            if (path.charAt(path.length - 1) === '/') {
                const arr = path.split('');
                arr.pop();
                arr.push('[]');
                path = arr.join('');
            }
        }
        if (!hasRoot && (segments.length === 1 || type === 'Object')) {
            path = path;
        } else if (path !== '.') {
            if (path.indexOf('$headers') > -1 && hasRoot) {
                path = rootDataKey + '.' + path;
            } else {
                path = path;
            }
        }
        return path;
    }



    getUUID() {
        return uuid();
    }

    // findDefinition(definition: Definition[], id: string) {
    //     const self = this;
    //     let temp: Definition;
    //     for (const def of definition) {
    //         if (def.id === id || def.path === id) {
    //             temp = def;
    //             break;
    //         } else if (def.definition && def.definition.length > 0) {
    //             const temp2 = self.findDefinition(def.definition, id);
    //             if (temp2 && !temp) {
    //                 temp = temp2;
    //             }
    //         }
    //     }
    //     return temp;
    // }

    getFormatTypeList() {
        return [
            {
                label: 'XML',
                formatType: 'XML',
            },
            {
                label: 'xls',
                formatType: 'EXCEL',
                excelType: 'xls'
            },
            {
                label: 'xlsx',
                formatType: 'EXCEL',
                excelType: 'xlsx'
            },
            {
                label: 'Fixed',
                formatType: 'FLATFILE'
            },
            {
                label: 'CSV',
                formatType: 'CSV',
                character: ','
            },
            {
                label: 'Delimiter',
                formatType: 'DELIMITER',
                character: ','
            },
            {
                label: 'JSON',
                formatType: 'JSON',
                selected: true
            }
        ];
    }

    addKeyForDataStructure(definition: any, type: string, parent?: string) {
        if (definition) {
            definition.forEach(def => {
                if (!def.properties) {
                    def.properties = {};
                }
                if (type === 'camelCase') {
                    def.properties.dataKey = def.key;
                } else {
                    def.properties.dataKey = def.properties.name;
                }
                if (def.type === 'Array') {
                    def.properties.dataKey = def.properties.dataKey + '[#]';
                }
                def.properties.dataPath = parent ?
                    (parent + '.' + def.properties.dataKey) : def.properties.dataKey;
                if (def.type === 'Object') {
                    this.addKeyForDataStructure(def.definition, type, def.properties.dataPath);
                } else if (def.type === 'Array' && def.definition[0].type === 'Object') {
                    this.addKeyForDataStructure(def.definition[0].definition, type, def.properties.dataPath);
                }
            });
        }
    }

    patchDataKey(definition: Array<any>, parent?: string): any[] {
        const self = this;
        const defs: any = [];
        if (definition) {
            definition.forEach(def => {
                const properties = def.properties || {};
                if (def.key === '_id') {
                    properties.dataKey = '_id';
                    defs.push({
                        key: '_id',
                        type: 'id',
                        properties
                    });
                } else {
                    if (def.type === 'Relation') {
                        properties.dataKey = (parent ? parent + '.' + def.key : def.key) + '._id';
                    } else {
                        properties.dataKey = parent ? parent + '.' + def.key : def.key;
                    }
                    const tempDef: any = {
                        key: def.key,
                        type: def.type,
                        properties
                    };
                    if (def.type === 'Object' || def.type === 'Array') {
                        tempDef.definition = self.patchDataKey(def.definition, properties.dataKey);
                    }
                    defs.push(tempDef);
                }
            });
        }
        return defs;
    }

    isValidURL(val: string) {
        if (val && val.match(/^https?:\/\/[\w-]{2,}\.([\w-]{2,}\.?)+/)) {
            return true;
        } else if (val && val.match(/^https?:\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}([\w-]{2,}\.?)+/)) {
            return true;
        }
        return false;
    }

    copyToClipboard(text: string) {
        // Create new element
        const el: HTMLTextAreaElement = document.createElement('textarea');
        // Set value (string to be copied)
        el.value = text;
        // Set non-editable to avoid focus and move outside of view
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        // Select text inside element
        el.select();
        // Copy text to clipboard
        document.execCommand('copy');
        // Remove temporary element
        document.body.removeChild(el);
    }

    downloadText(filename: string, text: string) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    toCamelCase(text: string) {
        if (text) {
            return _.camelCase(text);
        }
        return text;
    }

    toCapitalize(text: string) {
        if (text) {
            return _.capitalize(text);
        }
        return text;
    }
    toSnakeCase(text: string) {
        if (text) {
            return _.snakeCase(text);
        }
        return text;
    }

    getSortQuery(model: any): string {
        return Object.keys(model).map(key => model[key] === 'desc' ? '-' + key : key).join(',');
    }

    isEqual(object1: any, object2: any) {
        return _.isEqual(object1, object2);
    }

    getIpFormControl(val?: string) {
        return new FormControl(val, [Validators.required, ipValidate]);
    }

    countAttr(definition) {
        let count = 0;
        if (!!definition && Array.isArray(definition)) {
            definition.forEach(def => {
                if (!!def && def.type === 'Object') {
                    count += this.countAttr(def.definition);
                } else {
                    count++;
                }
            });
            return count;
        } else {
            return count;
        }
    }


    getSortFromModel(sortModel: any) {
        let sort = '';
        if (sortModel) {
            sort = sortModel.map(e => (e.sort === 'asc' ? '' : '-') + e.colId).join(',');
        }
        return sort;
    }

    getTimezones() {
        return momentTimeZone.tz.names();
    }

    getMomentInTimezone(date: Date, timezone: string, adjustment?: 'time:start' | 'time:end' | 'ms:start' | 'ms:end' | 'exact'): moment.Moment {
        const momentDate = momentTimeZone(new Date()).tz(timezone);
        momentDate.year(date.getFullYear());
        momentDate.month(date.getMonth());
        momentDate.date(date.getDate());
        switch (adjustment) {
            case 'time:start':
                momentDate.hours(0);
                momentDate.minutes(0);
                momentDate.seconds(0);
                momentDate.milliseconds(0);
                break;
            case 'time:end':
                momentDate.hours(23);
                momentDate.minutes(59);
                momentDate.seconds(59);
                momentDate.milliseconds(999);
                break;
            case 'ms:start':
                momentDate.hours(date.getHours())
                momentDate.minutes(date.getMinutes());
                momentDate.seconds(date.getSeconds());
                momentDate.milliseconds(0);
                break;
            case 'ms:end':
                momentDate.hours(date.getHours())
                momentDate.minutes(date.getMinutes());
                momentDate.seconds(date.getSeconds());
                momentDate.milliseconds(999);
                break;
            case 'exact':
            default:
                momentDate.hours(date.getHours())
                momentDate.minutes(date.getMinutes());
                momentDate.seconds(date.getSeconds());
                momentDate.milliseconds(date.getMilliseconds());
                break;
        }
        return momentDate;
    }

    fixSchema(parsedDef) {
        if (parsedDef) {
            parsedDef.forEach(def => {
                if (def.properties && def.properties.relatedTo) {
                    def.type = 'Relation';
                    def.properties._typeChanged = 'Relation';
                    delete def.definition;
                } else if (def.properties && def.properties.password) {
                    def.type = 'String';
                    def.properties._typeChanged = 'String';
                    delete def.definition;
                } else if (def.type === 'Array') {
                    this.fixSchema(def.definition);
                } else if (def.type === 'Object') {
                    this.fixSchema(def.definition);
                }
            });
        }
    }

    fixPermissionIdsInRoles(roles) {
        roles.forEach((role) => {
            role.id = 'P' + this.rand(10);
        });
    }

    fixPermissionIdsInWF(makerChecker) {
        if (makerChecker && makerChecker[0] && makerChecker[0].steps) {
            makerChecker[0].steps.forEach((step) => {
                step.id = 'C' + this.rand(10);
            });
        }
    }

    getNodeID(usedIds?: Array<string>) {
        let counter = 0;
        let id = _.sample(this.cityNames);
        if (usedIds && usedIds.length > 0) {
            let usedIndex = usedIds.indexOf(id);
            while (usedIndex > -1) {
                counter++;
                if (counter < this.cityNames.length) {
                    id = _.sample(this.cityNames);
                    usedIndex = usedIds.indexOf(id);
                } else {
                    id = _.upperCase(this.randomID(6));
                    usedIndex = -1;
                }
            }
            return id;
        }
        return id;
        // let id = 'N';
        // for (let i = 0; i < 5; i++) {
        //     const index = Math.floor((Math.random() * 1000) % 26);
        //     id += String.fromCharCode(65 + index);
        // }
        // return id;
    }
}
