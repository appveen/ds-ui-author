import {
    Component,
    OnInit,
    ElementRef,
    ViewChild,
    Input,
    OnDestroy,
    AfterContentInit,
    KeyValueDiffers,
    KeyValueDiffer,
    DoCheck,
    KeyValueChangeRecord,
    TemplateRef,
    EventEmitter,
    Output
} from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { NgbTooltip, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as uuid from 'uuid/v1';

import { AppService } from 'src/app/utils/services/app.service';
import { SchemaBuilderService } from 'src/app/home/schema-utils/schema-builder.service';
import { CommonService, GetOptions } from '../services/common.service';
import { sameName } from 'src/app/home/custom-validators/same-name-validator';


@Component({
    selector: 'odp-structure-field',
    templateUrl: './structure-field.component.html',
    styleUrls: ['./structure-field.component.scss']
})
export class StructureFieldComponent implements OnInit, AfterContentInit, OnDestroy, DoCheck {
    @Output() deleteStateModel = new EventEmitter<boolean>();
    @Output() viewStateModel = new EventEmitter<boolean>();
    @Input() stateModelAttr: any;
    @Input() isLibrary: boolean;
    @Input() isDataFormat: boolean;
    @Input() all: FormArray;
    @Input() index: number;
    @Input() first: boolean;
    @Input() edit: any;
    @Input() level: number;
    @Input() isDataFormatUsed: boolean;
    @Input() type: string;
    @Input() formatType: string;
    @ViewChild('tooltip', { static: false }) tooltip: NgbTooltip;
    @ViewChild('inputField', { static: false }) inputField: ElementRef;
    @ViewChild('nameChangeModal', { static: false }) nameChangeModal: TemplateRef<HTMLElement>;
    @ViewChild('flowDeployAlertModal', { static: false }) flowDeployAlertModal: TemplateRef<HTMLElement>;
    form: FormGroup;
    searchingRelation: boolean;
    active: boolean;
    collapse: boolean;
    nameChange: any;
    nameChangeModalRef: NgbModalRef;
    flowDeployAlertModalRef: NgbModalRef;
    oldKey: string;
    invalidFieldName: boolean;
    isInvalidKey: boolean;
    private autoLink: any;
    private relatedTo: string;
    private subscriptions: any;
    private oldName: string;
    private editDiffer: KeyValueDiffer<string, any>;
    app: any;
    service: any;
    constructor(private fb: FormBuilder,
        private schemaService: SchemaBuilderService,
        private commonService: CommonService,
        private appService: AppService,
        private keyValDiff: KeyValueDiffers) {
        const self = this;
        self.autoLink = {};
        self.relatedTo = '';
        self.subscriptions = {};
        self.nameChange = {};
        this.formatType = 'JSON';
    }

    ngOnInit() {
        const self = this;

        if (!self.level) {
            self.level = 0;
        }
        self.app = self.commonService.app._id;
        self.service = self.commonService.activeComponent['edit'].id;
        self.editDiffer = self.keyValDiff.find(self.edit).create();
        self.nameChange.title = 'Change attribute name?';
        self.nameChange.message = 'Data under old attribute name wont be accessible. Are you sure you want to continue?';
        self.form = self.all.at(self.index) as FormGroup;
        if (self.form.get('key').value === '_id') {
            const tempUuid = uuid();
            self.schemaService.idFieldId = tempUuid;
            self.form.addControl('_fieldId', new FormControl(tempUuid));
            self.form.addControl('_placeholder', new FormControl('Untitled Identifier'));
            self.form.addControl('key', new FormControl('_id'));
            self.form.addControl('type', new FormControl('id'));
            self.form.addControl('properties', self.fb.group({
                name: [self.oldName ? self.oldName : 'ID', [Validators.required]],
                _type: ['id', [Validators.required]]
            }));
        }
        if (!self.form.get('definition')) {
            if (self.form.get('type').value === 'Object') {
                self.selectType({ value: 'Object', label: 'Group' });
            }
        }
        if (self.form.get('key').value) {
            self.oldKey = self.form.get('key').value;
        }
        self.subscriptions['formatTypeChange'] = self.appService.formatTypeChange.subscribe(formatType => {
            this.formatType = formatType;
            this.validateFieldName(this.form.get('properties.name').value);
        });
        self.subscriptions['addAttribute'] = self.schemaService.addAttribute.subscribe(place => {
            if (self.schemaService.selectedFieldId && self.schemaService.selectedFieldId === self.fieldId) {
                const temp = self.schemaService.getDefinitionStructure({ key: null, _newField: true });
                if (place === 'before') {
                    if (!self.idField) {
                        self.all.insert(self.index, temp);
                    }
                } else {
                    self.all.insert(self.index + 1, temp);
                }
            }
        });
        self.subscriptions['activeField'] = self.schemaService.activeField.subscribe(fieldId => {
            if (fieldId !== self.fieldId) {
                self.active = false;
            } else {
                self.active = true;
                self.schemaService.activeProperty.emit(self.form);
                if (self.editable && self.inputField) {
                    self.inputField.nativeElement.focus();
                }
                if (self.isEdit && self.form.get('properties.name')) {
                    self.oldName = self.form.get('properties.name').value;
                }
            }
        });
        self.subscriptions['cloneAttribute'] = self.schemaService.cloneAttribute.subscribe(fieldId => {
            if (fieldId && fieldId === self.fieldId) {
                self.cloneField();
            }
        });
        self.subscriptions['deleteField'] = self.schemaService.deleteField.subscribe(fieldId => {
            if (fieldId && fieldId === self.fieldId) {
                self.remove();
            }
        });
    }

    ngAfterContentInit() {
        const self = this;
        setTimeout(() => {
            if (self.first) {
                self.schemaService.selectedFieldId = self.fieldId;
                // self.schemaService.activeField.emit(self.fieldId);
            }
        }, 200);
    }

    ngOnDestroy() {
        const self = this;
        Object.keys(self.subscriptions).forEach(e => {
            self.subscriptions[e].unsubscribe();
        });
        if (self.nameChangeModalRef) {
            self.nameChangeModalRef.close(false);
        }
        if (self.flowDeployAlertModalRef) {
            self.flowDeployAlertModalRef.close(false);
        }
    }

    ngDoCheck() {
        const self = this;
        const changes = self.editDiffer.diff(self.edit);
        if (changes) {
            changes.forEachChangedItem((r: KeyValueChangeRecord<string, any>) => {
                if (self.active && r.key === 'status' && r.currentValue === true) {
                    setTimeout(() => {
                        self.schemaService.selectedFieldId = self.fieldId;
                        // self.schemaService.activeField.emit(self.fieldId);
                    }, 200);
                }
            });
        }
    }

    _viewStateModel($event) {
        const self = this;
        self.viewStateModel.emit($event);
    }

    checkStateModel() {
        const self = this;
        if (self.stateModelAttr && self.stateModelAttr.value && self.form.get(['properties', '_detailedType']).value == 'enum') {
            return self.form.get('key').value == self.stateModelAttr.value
        }
        return false;
    }

    addField(required?: boolean) {
        const self = this;
        if (self.isDataFormat && self.isEdit && self.isDataFormatUsed) {
            self.flowDeployAlertModalRef = self.commonService.modal(self.flowDeployAlertModal, { centered: true });
            self.flowDeployAlertModalRef.result.then(close => {
                if (close) {
                    self.triggerAddField(required);
                }
            }, dismiss => { });
        } else {
            self.triggerAddField(required);
        }
    }

    triggerAddField(required?: boolean) {
        const self = this;
        const val: any = {
            key: null,
            _newField: true,
            properties: {
                required,
                _isParrentArray: self.form.get('properties._isParrentArray') ? self.form.get('properties._isParrentArray').value : false,
                _isGrpParentArray: self.form.get('properties._isGrpParentArray') ? self.form.get('properties._isGrpParentArray').value : false
            }
        };
        if (self.inputField) {
            self.inputField.nativeElement.focus();
        }
        const temp = self.schemaService.getDefinitionStructure(val);
        (self.all as FormArray).insert(self.index + 1, temp);
        setTimeout(() => {
            self.schemaService.selectedFieldId = temp.value._fieldId;
            self.schemaService.activeField.emit(temp.value._fieldId);
        }, 200);
    }

    cloneField() {
        const self = this;
        const val: any = self.appService.cloneObject(self.form.value);
        val.key = null;
        val.properties.name = null;
        const temp = self.schemaService.getDefinitionStructure(val);
        (self.all as FormArray).insert(self.index + 1, temp);
        self.schemaService.selectedFieldId = temp.value._fieldId;
        self.schemaService.activeField.emit(temp.value._fieldId);
    }

    deleteField(event: KeyboardEvent) {
        const self = this;
        if (event.shiftKey) {
            self.remove();
        }
    }

    closeTooltip() {
        const self = this;
        if (self.tooltip && self.tooltip.isOpen) {
            self.tooltip.close();
        }
    }

    checkType(val: string) {
        const self = this;
        if (self.isNewField) {
            let index = val.toLowerCase().split(' ').indexOf('amount');
            if (index < 0) {
                index = val.toLowerCase().split('_').indexOf('amount')
            }
            if (!self.autoLink['number'] && index > -1) {
                self.selectType({ value: 'Number', label: 'Number' });
                self.form.get('properties._detailedType').patchValue('currency');
                self.autoLink['number'] = true;
                self.tooltip.open({ message: 'Currency type applied' });
                setTimeout(() => {
                    self.closeTooltip();
                }, 3000);
            }
            index = val.toLowerCase().split(' ').indexOf('date');
            if (index < 0) {
                index = val.toLowerCase().split('_').indexOf('date')
            }
            if (!self.autoLink['date'] && index > -1) {
                self.selectType({ value: 'Date', label: 'Date' });
                self.autoLink['date'] = true;
                self.tooltip.open({ message: 'Date type applied' });
                setTimeout(() => {
                    self.closeTooltip();
                }, 3000);
            }
        }
        if (self.isDataFormat) {
            if (self.oldName !== val && self.isDataFormatUsed) {
                self.nameChange.message = 'Running flows would require remapping and re-deployment. Please check the Integration Flows tab to know which flows might get affected. Are you sure you want to continue?';
                self.nameChangeModalRef = self.commonService.modal(self.nameChangeModal);
                self.nameChangeModalRef.result.then((close) => {
                    if (close) {
                        return;
                    } else {
                        self.form.get('properties.name').patchValue(self.oldName);
                    }
                }, dismiss => { });
            }
            this.validateFieldName(val);
        } else {
            if (self.oldName && self.oldName !== val && self.isOldField && !self.isNewField) {
                self.nameChange.title = 'Change attribute name?';
                self.nameChange.message = 'Data under old attribute name wont be accessible. Are you sure you want to continue?';
                self.nameChangeModalRef = self.commonService.modal(self.nameChangeModal);
                self.nameChangeModalRef.result.then((close) => {
                    if (close) {
                        return;
                    } else {
                        self.form.get('properties.name').patchValue(self.oldName);
                    }
                }, dismiss => { });
            }
        }
        if (val && !val.match("^.*[a-zA-Z0-9]+.*$")) {
            this.isInvalidKey = true;
        } else {
            this.isInvalidKey = false;
        }
    }

    validateFieldName(val: string) {
        if (val && !val.match(/^[a-zA-Z0-9\.$_-\s]*$/)) {
            this.invalidFieldName = true;
        } else {
            if (val && this.formatType === 'XML' && !val.match(/^[a-zA-Z0-9\.$_-]*$/)) {
                this.invalidFieldName = true;
            } else {
                this.invalidFieldName = false;
            }
        }
    }

    activateProperty() {
        const self = this;
        self.active = true;
        self.schemaService.selectedFieldId = self.fieldId;
        self.schemaService.activeField.emit(self.fieldId);
    }

    searchService() {
        const self = this;
        if (self.isNewField) {
            const value = self.form.get('properties.name').value;
            if (!self.isLibrary && !self.isDataFormat) {
                if (self.relatedTo && value.toLowerCase() === self.relatedTo.toLowerCase()) {
                    return;
                }
                self.searchingRelation = true;
                const options: GetOptions = {
                    select: 'name,version,definition',
                    filter: {
                        name: value,
                        app: this.commonService.app._id,
                        status: {
                            $in: ['Active', 'Undeployed']
                        },
                        schemaFree: false
                    }
                };
                self.subscriptions['service'] = self.commonService.get('serviceManager', `/${this.commonService.app._id}/service`, options).subscribe(res => {
                    self.searchingRelation = false;
                    if (res && res.length > 0) {
                        self.selectType({ value: 'Relation', label: 'Relation' });
                        self.relatedTo = res[0].name;
                        (self.form.get('properties.relatedTo')).patchValue(res[0]._id);
                        (self.form.get('properties.relatedToName')).patchValue(res[0].name);
                        (self.form.get('properties.relatedSearchField')).patchValue(res[0].definition[0].key);
                        self.tooltip.open({ message: 'Relationship created with the schema' });
                        setTimeout(() => {
                            self.closeTooltip();
                        }, 3000);
                    }
                }, err => {
                    self.searchingRelation = false;
                });
            }
        }
    }

    selectType(type) {
        const self = this;
        self.form.get('type').patchValue(type.value);
        self.form.get('type').markAsDirty();
        self.form.removeControl('definition');
        const tempProp = self.schemaService
            .getPropertiesStructure({
                name: self.form.get('properties.name').value,
                type: type.value
            });
        for (const i in (self.form.get('properties') as FormGroup).controls) {
            if (i === 'name') {
                continue;
            }
            (self.form.get('properties') as FormGroup).removeControl(i);
        }
        for (const i in tempProp.controls) {
            if (i === 'name') {
                continue;
            }
            (self.form.get('properties') as FormGroup).addControl(i, tempProp.controls[i]);
        }
        if (type.value === 'Object') {
            const temp = self.schemaService.getDefinitionStructure({ _newField: true });
            self.form.addControl('definition', self.fb.array([temp]));
        }
        if (type.value === 'Array') {
            const temp = self.schemaService.getDefinitionStructure({ key: '_self', _newField: true });
            self.form.addControl('definition', self.fb.array([temp]));
        }
        if (type.value === 'Array' || type.value === 'Object') {
            self.form.get('definition').setValidators([sameName]);
        }
    }

    remove() {
        const self = this;
        if (self.index === 0 && self.all.length === 1) {
            return;
        }
        if (self.isOldField) {
            if (self.isDataFormat && this.isDataFormatUsed) {
                self.flowDeployAlertModalRef = self.commonService.modal(self.flowDeployAlertModal);
                self.flowDeployAlertModalRef.result.then(close => {
                    if (close) {
                        self.triggerRemove();
                    }
                }, dismiss => { });
            } else {
                self.nameChange.title = 'Delete attribute?';
                self.nameChange.message = 'Data under this attribute name won\'t be accessible. Are you sure you want to continue?';
                self.nameChangeModalRef = self.commonService.modal(self.nameChangeModal);
                self.nameChangeModalRef.result.then(close => {
                    if (close) {
                        self.triggerRemove();
                    }
                }, dismiss => { });
            }
        } else {
            self.triggerRemove();
        }
    }

    triggerRemove() {
        const self = this;
        self.schemaService.selectedFieldId = null;
        if (self.index === 0) {
            self.schemaService.selectedFieldId = self.all.at(self.index).get('_fieldId').value;
        } else {
            self.schemaService.selectedFieldId = self.all.at(self.index - 1).get('_fieldId').value;
        }
        // self.schemaService.activeField.emit(self.schemaService.selectedFieldId);
        if (self.all.at(self.index).get('key').value == self.stateModelAttr?.value && self.all.at(self.index).get(['properties', '_detailedType']).value == 'enum') {
            self.deleteStateModel.emit(true);
        }
        self.all.removeAt(self.index);
        self.all.markAsDirty();
    }

    _deleteStateModel($event) {
        const self = this;
        self.deleteStateModel.emit($event);
    }

    pasteOnField(e) {
        const self = this;
        // self.schemaService.selectedFieldId = null;
        self.schemaService.activeProperty.emit(null);
        if (!self.all.get([self.index, '_id'])) {
            let val = e.clipboardData.getData('text/plain');
            try {
                val = JSON.parse(val);
                self.createSchema(val);
            } catch (err) {
                self._createField(val);
            }
        }
    }

    _createField(val) {
        const self = this;
        let def = val.split(/\n/).filter(e => {
            if (e && e.trim() && e.trim() !== ',') {
                return e;
            }
        }).map(e => e.trim());
        if (def && def.length < 2) {
            def = val.split(/\t/).filter(e => {
                if (e && e.trim() && e.trim() !== ',') {
                    return e;
                }
            }).map(e => e.trim());
        }
        if (def && def.length < 2) {
            def = val.split(/,/).filter(e => {
                if (e && e.trim() && e.trim() !== ',') {
                    return e;
                }
            }).map(e => e.trim());
        }
        const json = {};
        def.forEach(element => {
            self.getJSON(element, json);
        });
        self.createSchema(json);
    }

    getJSON(field, value) {
        const self = this;
        if (!value) {
            value = {};
        }
        const fields = field.split('.').map(e => e.trim());
        if (fields.length > 1) {
            if (!value[fields[0]]) {
                value[fields[0]] = {};
            }
            if (value[fields[0]] === 'String') {
                value[fields[0]] = {};
                value[fields[0]][fields[0]] = 'String';
            }
            self.getJSON(fields.splice(1).join('.'), value[fields[0]]);
        } else {
            value[fields[0]] = 'String';
        }
        return value;
    }

    createSchema(json) {
        const self = this;
        const fields = self.schemaService.createSchema(json, self.isDataFormat);
        fields.forEach((field, i) => {
            const temp = fields[i];
            const tempDef = self.schemaService.getDefinitionStructure(temp);
            (tempDef.get('properties.name') as FormGroup).patchValue(temp.properties.name);
            self.all.push(tempDef);
        });
        self.all.removeAt(self.index);
        self.schemaService.activeProperty.emit(null);
    }

    getSpacing() {
        const self = this;
        let width = self.level * 28;
        if (self.level > 1) {
            width += (self.level - 1) * 16;
        }
        if (width > 0) {
            return {
                'min-width': width + 'px',
                'min-height': '36px',
                'margin-right': '16px'
            };
        } else {
            return {};
        }
    }
    setReadOnly(field) {
        const self = this;
        field.patchValue(!field.value);
    }
    get style() {
        const self = this;
        const margin = self.level * 16;
        return {
            marginLeft: margin + 'px'
        };
    }

    get fieldId() {
        const self = this;
        if (self.form.get('_fieldId')) {
            return self.form.get('_fieldId').value;
        }
        return null;
    }

    get hasError() {
        const self = this;
        return self.form.get('properties.name').touched
            && self.form.get('properties.name').dirty
            && (self.form.get('key').hasError('required')
                || self.form.get('properties.name').hasError('length')
                || self.form.hasError('sameName'))
            || (self.form.get('properties.relatedTo')
                && self.form.get('properties.relatedTo').hasError('required'))
            || this.invalidFieldName;
    }

    get idField() {
        const self = this;
        return Boolean(self.all.get([self.index, '_id']));
    }

    get objectFields() {
        const self = this;
        if (self.form.get('type') && self.form.get('type').value === 'Object') {
            return (self.form.get('definition') as FormArray);
        }
        return null;
    }

    get arrayFields() {
        const self = this;
        if (self.form.get('type') && self.form.get('type').value === 'Array' && self.form.get(['definition', 0, 'definition'])) {
            return (self.form.get(['definition', 0, 'definition']) as FormArray);
        }
        return null;
    }

    get canCollapse() {
        const self = this;
        if (self.form.get('type').value === 'Object') {
            return true;
        }
        if (self.form.get('type').value === 'Array' && self.form.get(['definition', 0, 'type']).value === 'Object') {
            return true;
        }
        return false;
    }

    get field() {
        const self = this;
        return self.form.value;
    }

    get isNewField() {
        const self = this;
        if (self.form.get('_newField')) {
            return self.form.get('_newField').value;
        }
        return true;
    }

    get isEdit() {
        const self = this;
        if (self.edit && self.edit.id) {
            return true;
        }
        return false;
    }

    get editable() {
        const self = this;
        if (self.edit && self.edit.status) {
            return true;
        }
        return false;
    }

    get placeholder() {
        const self = this;
        return self.form.get('_placeholder').value;
    }

    get canDelete() {
        const self = this;
        if (self.all.length > 1 && self.form.get('type').value !== 'id') {
            return true;
        }
        return false;
    }

    get canAdd() {
        const self = this;
        if (self.all.length - 1 === self.index && self.level > 0) {
            return true;
        }
        return false;
    }

    get isOldField() {
        const self = this;
        if (self.oldKey) {
            return true;
        }
        return false;
    }

}
