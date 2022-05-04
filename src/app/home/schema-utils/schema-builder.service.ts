import { EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn, FormArray } from '@angular/forms';
import { Injectable } from '@angular/core';
import { positiveNumber } from '../../home/custom-validators/positive-number-validator';
import { maxLenValidator, minMax, minMaxLength, patternValidator } from '../../home/custom-validators/min-max-validator';
import { CommonService } from '../../utils/services/common.service';

import * as _ from 'lodash';
import * as uuid from 'uuid/v1';
import { FieldType } from 'src/app/utils/interfaces/fieldType';

@Injectable()
export class SchemaBuilderService {

    activeField: EventEmitter<string>;
    activeProperty: EventEmitter<FormGroup>;
    addAttribute: EventEmitter<any>;
    cloneAttribute: EventEmitter<any>;
    deleteField: EventEmitter<any>;
    selectedFieldId: string;
    typechanged: EventEmitter<any>;
    idFieldId: string;
    constructor(
        private fb: FormBuilder,
        private commonService: CommonService) {
        const self = this;
        self.activeProperty = new EventEmitter();
        self.addAttribute = new EventEmitter();
        self.activeField = new EventEmitter();
        self.cloneAttribute = new EventEmitter();
        self.deleteField = new EventEmitter();
        self.typechanged = new EventEmitter();
    }

    getPropertiesStructure(value?: any): FormGroup {
        const self = this;
        const temp = self.fb.group({
            _type: [value.type],
            label: [value.properties && value.properties.label ? value.properties.label : null, [maxLenValidator(40)]],
            readonly: [value.properties && value.properties.readonly ? value.properties.readonly : false],
            errorMessage: [value.properties && value.properties.errorMessage ? value.properties.errorMessage : null],
            name: [value.properties && value.properties.name ? value.properties.name : null, [maxLenValidator(40)]],
            required: [value.properties && value.properties.required ? value.properties.required : false],
            fieldLength: [value.properties && value.properties.fieldLength ? value.properties.fieldLength : 10],
            _description: [value.properties && value.properties._description ? value.properties._description : null, [Validators.maxLength(240)]],
            _typeChanged: [value.type],
            _isParrentArray: [value.properties && value.properties._isParrentArray ? value.properties._isParrentArray : null],
            _isGrpParentArray: [value.properties && value.properties._isGrpParentArray ? value.properties._isGrpParentArray : null],
            dataPath: [value.properties && value.properties.dataPath ? value.properties.dataPath : null],

        });
        if (value.properties && value.properties.enum && value.properties.enum.length) {
            temp.addControl('_detailedType', new FormControl('enum'));
        } else if (value.properties && value.properties.richText) {
            temp.addControl('_detailedType', new FormControl('rich'));
        } else if (value.properties && value.properties.longText) {
            temp.addControl('_detailedType', new FormControl('long'));
        } else if (value.properties && value.properties.password) {
            temp.addControl('_detailedType', new FormControl('password'));
        } else if (value.properties && value.properties.email) {
            temp.addControl('_detailedType', new FormControl('email'));
        } else if (value.properties && value.properties.currency && value.properties._detailedType !== '') {
            temp.addControl('_detailedType', new FormControl('currency'));
        } else if (value.properties && value.properties.natural) {
            temp.addControl('_detailedType', new FormControl('natural'));
        } else if (value.properties && value.properties.relatedTo) {
            temp.addControl('_detailedType', new FormControl(''));
            value.type = 'Relation';
        } else if (value.properties && value.properties.schema) {
            temp.addControl('_detailedType', new FormControl(''));
            value.type = 'Global';
        } else {
            temp.addControl('_detailedType', new FormControl(''));
        }
        if (value.type === 'String'
            || value.type === 'Number'
            || value.type === 'Relation'
            || value.type === 'Boolean'
            || value.type === 'Date'
            || value.type === 'User'
        ) {
            temp.addControl('default', new FormControl(value.properties
                && (value.properties.default !== null || value.properties.default !== undefined) ? value.properties.default : null));
        }
        if (value.type === 'String'
            || value.type === 'Number'
            || value.type === 'Date'
            || value.type === 'Relation'
            || value.type === 'User'
            || value.type === 'Array'
            || value.type === 'File'
            || value.type === 'Boolean'
        ) {
            temp.addControl('createOnly', new FormControl(value.properties
                && value.properties.createOnly ? value.properties.createOnly : false));
        }
        if (value.type === 'String'
            || value.type === 'Number'
            || value.type === 'Relation'
            || value.type === 'User') {
            temp.addControl('unique', new FormControl(value.properties
                && value.properties.unique ? value.properties.unique : false));
        }
        if (value.type === 'String' || value.type === 'Number') {
            temp.addControl('_listInput', new FormControl(null));
            const arr = [];
            if (value.properties && value.properties.enum) {
                for (const i of value.properties.enum) {
                    arr.push(new FormControl(i));
                }
            }
            temp.addControl('enum', new FormArray(arr));
        }
        if (value.type === 'String') {
            temp.addControl('minlength', new FormControl(value.properties
                && value.properties.minlength ? value.properties.minlength : null, [positiveNumber]));
            temp.addControl('maxlength', new FormControl(value.properties
                && value.properties.maxlength ? value.properties.maxlength : null, [positiveNumber]));
            temp.addControl('pattern', new FormControl(value.properties
                && value.properties.pattern ? value.properties.pattern : null, [patternValidator]));
            temp.addControl('email', new FormControl(value.properties
                && value.properties.email ? value.properties.email : false));
            temp.addControl('password', new FormControl(value.properties
                && value.properties.password ? value.properties.password : false));
            temp.addControl('longText', new FormControl(value.properties
                && value.properties.longText ? value.properties.longText : false));
            temp.addControl('richText', new FormControl(value.properties
                && value.properties.richText ? value.properties.richText : false));
            temp.addControl('fieldLength', new FormControl(value.properties
                && value.properties.fieldLength ? value.properties.fieldLength : null));
            const arr = [];
            if (value.properties && value.properties.hasTokens) {
                for (const i of value.properties.hasTokens) {
                    arr.push(new FormControl(i));
                }
            }
            temp.addControl('hasTokens', new FormArray(arr));
        }
        if (value.type === 'Number') {
            temp.addControl('min', new FormControl(value.properties
                ? value.properties.min : null));
            temp.addControl('max', new FormControl(value.properties
                ? value.properties.max : null));
            temp.addControl('currency', new FormControl(value.properties
                && value.properties.currency ? value.properties.currency : 'INR'));
            temp.addControl('natural', new FormControl(value.properties
                && value.properties.natural ? value.properties.natural : false));
            temp.addControl('fieldLength', new FormControl(value.properties
                && value.properties.fieldLength ? value.properties.fieldLength : null));
            temp.addControl('precision', new FormControl(value.properties
                && value.properties.precision !== undefined ? value.properties.precision : 2));
        }
        if (value.type === 'Date') {
            temp.addControl('dateType', new FormControl(value.properties
                && value.properties.dateType ? value.properties.dateType : 'date'));
            temp.addControl('defaultTimezone', new FormControl(value.properties
                && value.properties.defaultTimezone ? value.properties.defaultTimezone :
                (this.commonService.app.defaultTimezone || this.commonService.userDetails.defaultTimezone)));
            temp.addControl('_listInput', new FormControl(null));
            const arr = [];
            if (value.properties && value.properties.supportedTimezones) {
                for (const i of value.properties.supportedTimezones) {
                    arr.push(new FormControl(i));
                }
            }
            temp.addControl('supportedTimezones', new FormArray(arr));
            // temp.addControl('min', new FormControl(value.properties && value.properties.min ? value.properties.min : null));
            // temp.addControl('max', new FormControl(value.properties && value.properties.max ? value.properties.max : null));
        }
        if (value.type === 'Object') {
            temp.removeControl('required');
        }
        if (value.type === 'Array') {
            temp.removeControl('required');
            temp.addControl('maxlength', new FormControl(value.properties
                && value.properties.maxlength ? value.properties.maxlength : null, [positiveNumber]));
        }
        if (value.type === 'Relation') {
            temp.get('_type').patchValue('Relation');
            temp.addControl('deleteAction', new FormControl(value.properties &&
                value.properties.deleteAction ? value.properties.deleteAction : 'restrict', [Validators.required]));
            temp.addControl('relatedTo', new FormControl(value.properties &&
                value.properties.relatedTo ? value.properties.relatedTo : '', [Validators.required]));
            temp.addControl('relatedToName', new FormControl(value.properties &&
                value.properties.relatedToName ? value.properties.relatedToName : ''));
            temp.addControl('relatedSearchField', new FormControl(value.properties &&
                value.properties.relatedSearchField ? value.properties.relatedSearchField : '', [Validators.required]));
            temp.addControl('_listInput', new FormControl(null));
            const arr = [];
            if (value.properties && value.properties.relatedViewFields) {
                self.commonService
                    .get('serviceManager', `/${this.commonService.app._id}/service/` + value.properties.relatedTo, { select: 'name', filter: { app: this.commonService.app._id } })
                    .subscribe(res => {
                        temp.get('relatedToName').patchValue(res.name);
                    }, err => { });
                for (const i of value.properties.relatedViewFields) {
                    arr.push(new FormControl(i));
                }
            }
            temp.addControl('relatedViewFields', new FormArray(arr));
        }

        if (value.type === 'User') {
            temp.get('_type').patchValue('User');
            temp.addControl('deleteAction', new FormControl(value.properties &&
                value.properties.deleteAction ? value.properties.deleteAction : 'restrict', [Validators.required]));
            temp.addControl('relatedSearchField', new FormControl(value.properties &&
                value.properties.relatedSearchField ? value.properties.relatedSearchField : '_id', [Validators.required]));
            temp.addControl('_listInput', new FormControl(null));

            const arr = [];
            if (value.properties && value.properties.relatedViewFields) {
                for (const i of value.properties.relatedViewFields) {
                    arr.push(new FormControl(i));
                }
            }
            temp.addControl('relatedViewFields', new FormArray(arr));
        }

        if (value.type === 'Global') {
            temp.removeControl('required');
            temp.get('_type').patchValue('Global');
            temp.addControl('schema', new FormControl(value.properties
                && value.properties.schema ? value.properties.schema : '', [Validators.required]));
            temp.addControl('schemaName', new FormControl(value.properties
                && value.properties.schemaName ? value.properties.schemaName : ''));
            if (value.properties && value.properties.schema) {
                const apiOptions = {
                    select: 'name',
                    filter: {
                        app: this.commonService.app._id,
                        definition: { $ne: null, $not: { $size: 0 } }
                    },
                    noApp: true
                };
                self.commonService
                    .get('serviceManager', `/${this.commonService.app._id}/globalSchema/` + value.properties.schema, apiOptions)
                    .subscribe(res => {
                        temp.get('schemaName').patchValue(res.name);
                    }, err => { });
            }
        }
        if (value.type === 'Geojson') {
            temp.addControl('geoType', new FormControl(value.properties
                && value.properties.geoType ? value.properties.geoType : 'point'));
        }
        if (value.type === 'File') {
            temp.addControl('fileType', new FormControl(value.properties
                && value.properties.fileType ? value.properties.fileType : 'All'));
            // temp.removeControl('required');
        }

        if (value && value.properties && value.properties._isParrentArray) {
            temp.removeControl('unique');
        }
        if (value && value.properties && value.properties._isGrpParentArray) {
            temp.removeControl('createOnly');
            temp.removeControl('unique');
        }

        temp.setValidators([minMax, minMaxLength]);
        return temp;
    }


    getDefinitionStructure(value?: any, _isGrpParentArray?: boolean): FormGroup {
        const key = value && value.key ? value.key : '';
        const type = value && value.type ? value.type : 'String';
        const tempForm = this.fb.group({
            _fieldId: [uuid()],
            _placeholder: ['Untitled Attribute'],
            type: [type, [Validators.required]],
            key: [key ? key : null, [Validators.required]],
            _newField: [value && value._newField === false ? value._newField : true]
        });
        const options = { type, key };
        if (value && value.properties) {
            options['properties'] = value.properties;
        }

        tempForm.addControl('properties', this.getPropertiesStructure(options));
        if (value && value.properties && value.properties.relatedTo) {
            tempForm.get('type').patchValue('Relation');
        }
        if (value && value.properties && value.properties.schema) {
            value.type = 'Global';
            tempForm.get('type').patchValue('Global');
            delete value.definition;
        }
        if (value && value.properties && value.properties.relatedTo) {
            value.type = 'Relation';
            tempForm.get('type').patchValue('Relation');
            delete value.definition;
        }
        if (value && value.properties && value.properties.password) {
            value.type = 'String';
            tempForm.get('type').patchValue('String');
            delete value.definition;
        }
        if (value && value.type && value.type === 'User') {
            tempForm.get('type').patchValue('User');
            delete value.definition;
        }
        if (value && value.definition) {
            const tempArr = this.fb.array([]);
            value.definition.filter(d => d.key !== '_id').forEach((element, i) => {
                if (value.properties && value.properties.readonly) {
                    value.definition[i].properties.readonly = true;
                }
                if (value.type === 'Array') {
                    value.definition[i].properties._isParrentArray = true;
                }
                if (value.properties && (value.properties._isParrentArray || value.properties._isGrpParentArray)) {
                    value.definition[i].properties._isGrpParentArray = true;
                }
                const tempDef = this.getDefinitionStructure(value.definition[i]);
                if (value.definition[i].properties && value.definition[i].properties.name) {
                    tempDef.get('properties.name').patchValue(value.definition[i].properties.name);
                } else {
                    tempDef.get('properties.name').patchValue('_self');
                }
                tempArr.push(tempDef);
            });

            if (tempForm.get('type').value === 'Array' && tempForm.get('properties.readonly').value && value.definition[0].type === 'Object') {
                tempForm.get('properties.readonly').patchValue(false)
            }
            if (tempForm.get('type').value === 'Object' && tempForm.get('properties.readonly').value) {
                tempForm.get('properties.readonly').patchValue(false)
            }
            tempForm.addControl('definition', tempArr);
        }
        tempForm.get('properties.name').valueChanges.subscribe(val => {
            tempForm.get('key').patchValue(val === '_self' ? '_self' : _.camelCase(val));
        });
        if (value && value.disableType) {
            tempForm.addControl('_disableType', new FormControl(true));
        }
        return tempForm;
    }

    generateStructure(definitions) {
        if (!definitions) {
            return [];
        }
        return definitions.map(def => {
            const tempDef = JSON.parse(JSON.stringify(def));
            if (tempDef.key !== '_id') {
                tempDef._newField = false;
                if (tempDef.definition) {
                    tempDef.definition = this.generateStructure(tempDef.definition);
                }
            }
            return tempDef;
        });
    }

    createSchema(json, noCaseChange?: boolean) {
        let arr = [];
        // tslint:disable-next-line:max-line-length
        const dateRegex = new RegExp(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/g);
        try {
            if (Array.isArray(json)) {
                arr = this.createSchema({ _self: json[0] || 'String' });
            } else {
                Object.keys(json).forEach(i => {
                    if (json[i] === null) {
                        json[i] = 'String';
                    }
                    const temp: any = {};
                    temp.key = i;
                    temp.properties = {
                        name: i === '_self' || noCaseChange ? i : _.startCase(i)
                    };
                    temp.type = _.capitalize(typeof json[i]);
                    if (i.toLowerCase().split(' ').indexOf('date') > -1) {
                        temp.type = 'Date';
                    }
                    if (i.toLowerCase().split(' ').indexOf('amount') > -1) {
                        temp.type = 'Number';
                        temp.properties.currency = 'INR';
                    }
                    if (temp.type === 'String' && json[i] && dateRegex.test(json[i])) {
                        temp.type = 'Date';
                    }
                    if (typeof json[i] === 'object') {
                        if (Array.isArray(json[i])) {
                            temp.type = 'Array';
                            temp.definition = this.createSchema(json[i], noCaseChange);
                        } else {
                            temp.type = 'Object';
                            temp.definition = this.createSchema(json[i], noCaseChange);
                        }
                    }
                    arr.push(temp);
                });
            }
        } catch (e) {
            console.log(e);
        }
        return arr;
    }

    createDefiniition(json) {
        if (Array.isArray(json)) {
            return this.createDefiniition({ _self: json[0] });
        } else {
            return Object.keys(json).map(i => {
                const temp: any = {};
                temp.key = i;
                temp.properties = {
                    name: i === '_self' || _.startCase(i)
                };
                temp.type = _.capitalize(typeof json[i]);
                if (i.toLowerCase().split(' ').indexOf('date') > -1) {
                    temp.type = 'Date';
                }
                if (i.toLowerCase().split(' ').indexOf('amount') > -1) {
                    temp.type = 'Number';
                    temp.properties.currency = 'INR';
                }
                if (typeof json[i] === 'object') {
                    if (Array.isArray(json[i])) {
                        temp.type = 'Array';
                        temp.definition = this.createDefiniition(json[i]);
                    } else {
                        temp.type = 'Object';
                        temp.definition = this.createDefiniition(json[i]);
                    }
                }
                return temp;
            });
        }
    }

    getSchemaTypes(): Array<FieldType> {
        return [
            { class: 'odp-id', value: 'id', label: 'Identifier' },
            { class: 'odp-abc', value: 'String', label: 'Text' },
            { class: 'odp-123', value: 'Number', label: 'Number' },
            { class: 'odp-boolean', value: 'Boolean', label: 'True/False' },
            { class: 'odp-calendar', value: 'Date', label: 'Date' },
            { class: 'odp-group', value: 'Object', label: 'Group' },
            { class: 'odp-array', value: 'Array', label: 'Collection' },
            { class: 'odp-location', value: 'Geojson', label: 'Location' },
            { class: 'odp-attach', value: 'File', label: 'File' },
            { class: 'odp-references', value: 'Relation', label: 'Relation' },
            { class: 'odp-library', value: 'Global', label: 'Library' },
            { class: 'far fa-user-circle', value: 'User', label: 'User' }
        ];
    }
    countAttr(def) {
        let count = 0;
        if (def && typeof def === 'object') {
            Object.keys(def).forEach(key => {
                if (def[key] && def[key].type === 'Object') {
                    count += this.countAttr(def[key].definition);
                } else {
                    count++;
                }
            });
            return count;
        } else {
            return count;
        }
    }

    initialState(res: any) {
        if (!res.definition) {
            res.definition = [
                {
                    key: '_id',
                    prefix: _.toUpper(_.camelCase(res.name.substring(0, 3))),
                    suffix: null,
                    padding: null,
                    counter: 1001,
                    properties: {
                        name: 'ID',
                        dataKey: '_id',
                        dataPath: '_id'
                    }
                }
            ];
        }
        if (!res.tags) {
            res.tags = [];
        }
        if (!res.roles) {
            res.roles = [];
        }
    }

    patchType(definition: any) {
        if (definition && !!definition.length) {
            definition.forEach(def => {
                if (def.key !== '_id') {
                    if (def.type === 'Object') {
                        if (def.properties.relatedTo) {
                            def.type = 'Relation';
                            delete def.definition;
                        } else if (def.properties.schema) {
                            def.type = 'Global';
                        } else if (def.properties.password) {
                            def.type = 'String';
                            delete def.definition;
                        } else {
                            this.patchType(def.definition);
                        }
                    } else if (def.type === 'User') {
                        delete def.definition;
                    } else if (def.type === 'Array') {
                        if (def.definition.find(d => d.key === '_self').properties.password) {
                            this.patchType(def.definition);
                        } else if (def.definition.find(d => d.key === '_self').type === 'Object') {
                            this.patchType(def.definition.find(d => d.key === '_self').definition);
                        } else {
                            this.patchType(def.definition);
                        }
                    }
                } else {
                    def.type = 'id';
                }
            });
        }
        return definition;
    }
}

export function enumCheck(type: string): ValidatorFn {
    return (control: FormControl) => {
        if (control.value) {
            if (Array.isArray(control.value)) {
                return null;
            }
            if (type === 'Number') {
                if (!control.value[control.value.length - 1].match(/^[0-9,]$/)) {
                    control.patchValue(control.value.substr(0, control.value.length - 1));
                }
            }
        }
        return null;
    };
}
