import {
    Component, OnInit, AfterViewInit, AfterContentChecked, OnDestroy, ViewChild, ElementRef, HostListener, ChangeDetectorRef, TemplateRef
} from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormArray } from '@angular/forms';
import { NgbTooltipConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { CanComponentDeactivate } from 'src/app/utils/guards/route.guard';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { SchemaBuilderService } from '../schema-utils/schema-builder.service';
import { GlobalSchemaStructurePipe } from '../schema-utils/global-schema-structure.pipe';
import { sameName } from '../custom-validators/same-name-validator';

@Component({
    selector: 'odp-data-format-manage',
    templateUrl: './data-format-manage.component.html',
    styleUrls: ['./data-format-manage.component.scss'],
    providers: [GlobalSchemaStructurePipe]
})
export class DataFormatManageComponent implements
    OnInit, AfterViewInit, AfterContentChecked, CanComponentDeactivate, OnDestroy {
    @ViewChild('inputNode', { static: false }) inputNode: ElementRef;
    @ViewChild('outputNode', { static: false }) outputNode: ElementRef;
    @ViewChild('deleteModalEle', { static: false }) deleteModalEle: TemplateRef<HTMLElement>;
    @ViewChild('libName', { static: false }) libName: ElementRef;
    @ViewChild('pageChangeModalTemplate', { static: false }) pageChangeModalTemplate: TemplateRef<HTMLElement>;
    deleteModalEleRef: NgbModalRef;
    pageChangeModalTemplateRef: NgbModalRef;
    app: string;
    form: UntypedFormGroup;
    edit: any = {};
    dataFormatPattern = /^[a-zA-Z]/;
    types: Array<any> = [
        { class: 'odp-group', value: 'Object', label: 'Group' },
        { class: 'odp-array', value: 'Array', label: 'Collection' }
    ];
    selectedTypeClass = 'odp-group';
    selectedType = 'Text';
    properties: any = [];
    errMessage: string;
    subscriptions: any = {};
    onfocus: boolean;
    dataFormatTypeFlag = 1;
    dataFormatShow = {
        select: false,
        character: false,
    };
    showSubType: boolean;
    showLazyLoader: boolean;
    breadcrumbPaths: Array<Breadcrumb>;
    formatList: Array<any>;
    toggleFormatSelector: boolean;
    activeTab: number;
    flowSearchTerm: string;
    microflows: Array<any>;
    deleteModal: any;
    showAdvance: boolean;
    showAdvanceSettingsWindow: boolean;
    disableSaveBtn: boolean = true;
    sortableOnMove = (event: any) => {
        return !event.related.classList.contains('disabled');
    }
    showTextarea: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: UntypedFormBuilder,
        private commonService: CommonService,
        private appService: AppService,
        private schemaService: SchemaBuilderService,
        private ts: ToastrService,
        private globalSchemaStructurePipe: GlobalSchemaStructurePipe,
        private cdr: ChangeDetectorRef,
        private ngbToolTipConfig: NgbTooltipConfig) {
        this.edit = {
            status: false,
            id: null,
            view: false
        };
        this.deleteModal = {};
        this.form = this.fb.group({
            name: [null, [Validators.required]],
            description: [null],
            type: ['Object', [Validators.required]],
            strictValidation: [false],
            definition: this.fb.array([
                this.schemaService.getDefinitionStructure()
            ]),
            formatType: ['JSON', [Validators.required]],
            character: [',', [Validators.required]],
            excelType: ['xls', [Validators.required]],
            lineSeparator: ['\\\\n']
        });
        this.breadcrumbPaths = [];
        this.formatList = this.appService.getFormatTypeList();
        this.activeTab = 0;
        this.microflows = [];
    }

    ngOnInit() {
        this.breadcrumbPaths.push({
            active: false,
            label: 'Data Formats',
            url: '/app/' + this.commonService.app._id + '/dfl'
        });
        this.commonService.changeBreadcrumb(this.breadcrumbPaths)
        this.commonService.activeComponent = this;
        this.ngbToolTipConfig.container = 'body';
        this.app = this.commonService.app._id;
        this.commonService.apiCalls.componentLoading = false;
        this.route.params.subscribe(params => {
            if (params.id) {
                this.edit.id = params.id;
                if (this.appService.editLibraryId) {
                    this.appService.editLibraryId = null;
                    this.edit.status = true;
                } else {
                    this.edit.view = true;
                    this.edit.status = false;
                }
                this.fillDetails();
            } else {
                this.breadcrumbPaths.push({
                    active: true,
                    label: 'New Data Format'
                });
                this.commonService.changeBreadcrumb(this.breadcrumbPaths)
                this.edit.status = true;
                if (this.appService.clone) {
                    this.fillDetails(this.appService.clone);
                }
            }
        });
        this.form.get('formatType').valueChanges.subscribe(val => {
            if (val === 'CSV') {
                this.removeGroups();
                this.form.get('character').patchValue(',');
            }
        });
        this.form.get('lineSeparator').valueChanges.subscribe(val => {
            console.log(val);
        });
        this.selectType({ class: 'odp-group', value: 'Object', label: 'Group' });
        this.subscriptions['activeproperty'] = this.schemaService.activeProperty.subscribe(val => {
            this.properties = val;
            this.onfocus = true;
        });
        this.subscriptions['sessionExpired'] = this.commonService.sessionExpired.subscribe(() => {
            this.form.markAsPristine();
        });
        this.subscriptions['userLoggedOut'] = this.commonService.userLoggedOut.subscribe(res => {
            this.form.markAsPristine();
        });
    }

    get libNameErr() {
        return (this.form.get('name').dirty && this.form.get('name').hasError('required') ||
            this.form.get('name').dirty && this.form.get('name').hasError('length'));
    }

    ngAfterViewInit() {
        if (this.libName) {
            this.libName.nativeElement.focus();
        }
    }

    ngOnDestroy() {
        if (this.commonService.activeComponent) {
            this.commonService.activeComponent = null;
        }
        Object.keys(this.subscriptions).forEach(e => {
            this.subscriptions[e].unsubscribe();
        });
        if (this.pageChangeModalTemplateRef) {
            this.pageChangeModalTemplateRef.close();
        }
        if (this.deleteModalEleRef) {
            this.deleteModalEleRef.close();
        }
        this.appService.clone = null;
        this.appService.edit = null;
    }

    ngAfterContentChecked() {
        this.cdr.detectChanges();
    }

    resetForm() {
        const self = this;
        (self.form.get('definition') as UntypedFormArray).controls.splice(0);
        (self.form.get('definition') as UntypedFormArray).push(self.schemaService.getDefinitionStructure());
    }

    fillDetails(id?) {
        this.showLazyLoader = true;
        this.subscriptions['fillDetails'] = this.commonService
            .get('partnerManager', `/${this.commonService.app._id}/dataFormat/` + (id ? id : this.edit.id))
            .subscribe(res => {
                this.showLazyLoader = false;
                let temp;
                if (res.definition && res.definition.length > 0) {
                    temp = {
                        name: res.name,
                        description: res.description,
                        strictValidation: res.strictValidation,
                        excelType: res.excelType
                    };
                    this.form.patchValue(temp);
                    this.form.get('type').patchValue('Object');
                    temp.definition = this.schemaService.generateStructure(res.definition);
                    (this.form.get('definition') as UntypedFormArray).controls.splice(0);
                    temp.definition.forEach((element, i) => {
                        const tempDef = this.schemaService.getDefinitionStructure(temp.definition[i]);
                        if (temp.definition[i].properties && temp.definition[i].properties.name) {
                            tempDef.get('properties.name').patchValue(temp.definition[i].properties.name);
                            this.onfocus = false;
                        } else {
                            tempDef.get('properties.name').patchValue('_self');
                            this.onfocus = false;
                        }
                        (this.form.get('definition') as UntypedFormArray).push(tempDef);
                    });
                } else {
                    temp = {
                        name: res.name,
                        description: res.description
                    };
                    this.form.patchValue(temp);
                }
                if (id) {
                    this.form.controls.name.reset();
                }
                if (res.formatType) {
                    this.formatList.forEach(e => {
                        e.selected = false;
                    });
                    if (res.formatType === 'EXCEL') {
                        temp = this.formatList.find(e => e.formatType === res.formatType && e.excelType === res.excelType);

                    } else {
                        temp = this.formatList.find(e => e.formatType === res.formatType);
                    }
                    if (temp) {
                        temp.selected = true;
                    }
                    this.form.get('formatType').patchValue(res.formatType);
                }
                if (res.character) {
                    this.form.get('character').patchValue(res.character);
                }
                if (res.lineSeparator) {
                    this.form.get('lineSeparator').patchValue(res.lineSeparator);
                }
                if (this.appService.clone) {
                    const name = this.form.get('name').value;
                    this.form.get('name').patchValue(name + ' Copy');
                    this.form.get('description').patchValue(null);
                }
                this.breadcrumbPaths.push({
                    active: true,
                    label: this.form.controls.name.value + (this.edit ? ' (Edit)' : '')
                });
                this.commonService.changeBreadcrumb(this.breadcrumbPaths)
            }, err => {
                this.showLazyLoader = true;
                this.commonService.errorToast(err);
            });
    }

    selectDataFormatType(event) {
        if (event.target.value === 'delimeter') {
            this.showSubType = true;
            this.dataFormatShow.character = true;
        } else if (event.target.value === 'flatfile') {
            this.showSubType = true;
            this.dataFormatShow.character = false;
        } else {
            this.showSubType = false;
        }
    }
    clearSchema() {
        this.deleteModal.title = 'Clear Data Format ';
        this.deleteModal.message = 'Are you sure you want to clear ';
        this.deleteModalEleRef = this.commonService.modal(this.deleteModalEle);
        this.deleteModalEleRef.result.then((close) => {
            if (close) {
                this.resetForm();
            }
        }, dismiss => { });
    }

    onSchemaCreate(schema: any) {
        this.form.get('type').patchValue(schema.type);
        schema.definition = this.schemaService.generateStructure(schema.definition);
        (this.form.get('definition') as UntypedFormArray).controls.splice(0);
        schema.definition.forEach((element, i) => {
            const tempDef = this.schemaService.getDefinitionStructure(schema.definition[i]);
            if (schema.definition[i].properties && schema.definition[i].properties.name) {
                tempDef.get('properties.name').patchValue(schema.definition[i].properties.name);
                this.onfocus = false;
            } else {
                tempDef.get('properties.name').patchValue('_self');
                this.onfocus = false;
            }
            (this.form.get('definition') as UntypedFormArray).push(tempDef);
        });
        this.showTextarea = null;
    }

    cancel() {
        this.deleteModal.title = 'Unsaved Changes';
        this.deleteModal.message = 'Are you sure you want to cancel ';
        if (this.form.dirty) {
            this.deleteModalEleRef = this.commonService.modal(this.deleteModalEle);
            this.deleteModalEleRef.result.then((close) => {
                if (close) {
                    this.form.markAsPristine();
                    if (this.edit.id) {
                        if (this.edit.view && this.edit.status) {
                            this.edit.status = false;
                            this.fillDetails();
                        } else {
                            this.router.navigate(['/app/', this.commonService.app._id, 'dfl']);
                        }
                    } else {
                        this.router.navigate(['/app/', this.commonService.app._id, 'dfl']);
                    }
                }
            }, dismiss => { });
        } else {
            if (this.edit.id) {
                if (this.edit.view && this.edit.status) {
                    this.edit.status = false;
                } else {
                    this.router.navigate(['/app/', this.commonService.app._id, 'dfl']);
                }
            } else {
                this.router.navigate(['/app/', this.commonService.app._id, 'dfl']);
            }
        }
    }
    editSchema(index) {
        this.edit.status = true;
    }

    saveSchema() {
        let response;
        const value = this.form.getRawValue();
        const payload = this.globalSchemaStructurePipe.transform(value, true);
        this.appService.addKeyForDataStructure(payload.definition, 'normal');
        this.commonService.commonSpinner = true;
        payload.app = this.commonService.app._id;
        payload.formatType = this.form.value.formatType;
        payload.excelType = this.selectedFormat.excelType;
        payload.character = this.form.value.character;
        payload.length = this.form.value.length;
        payload.lineSeparator = this.form.value.lineSeparator;
        payload.strictValidation = this.form.value.strictValidation;
        if (this.edit.id) {
            response = this.commonService.put('partnerManager', `/${this.commonService.app._id}/dataFormat/` + this.edit.id, payload);
        } else {
            response = this.commonService.post('partnerManager', `/${this.commonService.app._id}/dataFormat`, payload);
        }
        this.subscriptions['globalschema'] = response.subscribe(res => {
            this.commonService.commonSpinner = false;

            this.ts.success('Data Format saved sucessfully');
            this.form.markAsPristine();
            if (this.edit.id) {
                this.router.navigate(['/app/', this.commonService.app._id, 'dfl']);
            } else {
                this.router.navigate(['/app/', this.commonService.app._id, 'dfl']);
            }
        }, err => {
            this.commonService.commonSpinner = false;
            this.edit.status = true;
            this.commonService.errorToast(err);
        });
    }

    addField(place?: string) {
        if (!place) {
            const tempArr = this.form.get('definition') as UntypedFormArray;
            const temp = this.schemaService.getDefinitionStructure({ _newField: true });
            tempArr.push(temp);
        } else {
            this.schemaService.addAttribute.emit(place);
        }
    }

    selectType(type: any) {
        this.selectedType = type.label;
        this.selectedTypeClass = this._getClass(type.value);
        this.form.controls.type.setValue(type.value);
        this.form.removeControl('definition');
        let key = null;
        if (type.value === 'Object') {
            key = null;
        } else if (type.value === 'Array') {
            key = '_self';
        }
        if (type.value === 'Array' || type.value === 'Object') {
            this.form.addControl('definition', this.fb.array([
                this.schemaService.getDefinitionStructure({ key })
            ]));
            this.form.controls.definition.setValidators([sameName]);
        }
    }

    selectFormat(format: any) {
        if (!this.edit.status) {
            return;
        }
        this.formatList.forEach(e => {
            e.selected = false;
        });
        format.selected = true;
        this.form.get('formatType').patchValue(format.formatType);
        // this.form.get('formatType').markAsDirty();
        if (format.formatType === 'EXCEL') {
            this.form.get('excelType').patchValue(format.excelType);
        }
        this.appService.formatTypeChange.emit(format.formatType);
    }

    canDeactivate(): Promise<boolean> | boolean {
        if (this.changesDone) {
            return new Promise((resolve, reject) => {
                this.pageChangeModalTemplateRef = this.commonService.modal(this.pageChangeModalTemplate);
                this.pageChangeModalTemplateRef.result.then(close => {
                    resolve(close);
                }, dismiss => {
                    resolve(false);
                });
            });
        }
        return true;
    }

    @HostListener('window:beforeunload', ['$event'])
    beforeunloadHandler($event) {
        if (this.form.dirty) {
            $event.returnValue = 'Are you sure?';
        }
    }

    canEditDataFormat(id: string) {
        if (this.commonService.isAppAdmin || this.commonService.userDetails.isSuperAdmin) {
            return true;
        } else {
            const list = this.commonService.getEntityPermissions('DF_' + id);
            if (list.length > 0 && list.find(e => e.id === 'PMDF')) {
                return true;
            } else if (list.length === 0 && this.hasManagePermission('DF')) {
                return true;
            } else {
                return false;
            }
        }
    }


    hasManagePermission(entity: string) {
        const retValue = this.commonService.hasPermission('PMDF', entity);
        return retValue;
    }

    getStatus(status: string) {
        if (status === 'Draft') {
            return 'draft';
        }
        if (status === 'Active') {
            return 'online';
        }
        if (status === 'Error') {
            return 'error';
        }
        if (status === 'Pending') {
            return 'pending';
        }
        return 'offline';
    }

    copyToClipboard(type: string) {
        if (type === 'input') {
            this.inputNode.nativeElement.select();
        } else {
            if (this.outputNode && this.outputNode.nativeElement) {
                this.outputNode.nativeElement.select();
            }
        }
        document.execCommand('copy');
    }

    replacePort(url: string, port: number) {
        if (url && port) {
            const arr = url.split(':');
            arr.pop();
            arr.push(port + '');
            return location.protocol + '//' + arr.join(':') + '/api';
        } else {
            return location.protocol + '//' + url + '/api';
        }
    }

    disableSave(val: string) {
        if (val && val.length) {
            this.form.controls['name'].setErrors({ 'incorrect': true });
        }
    }

    removeGroups() {
        const indexArr = [];
        this.form.value.definition.forEach((ele, index) => {
            if (ele.type === 'Object' || ele.type === 'Array') {
                indexArr.push(index);
            }
        });
        indexArr.reverse().forEach(i => {
            (this.form.get('definition') as UntypedFormArray).removeAt(i);
        });
    }
    get name() {
        if (this.form.get('name')) {
            return this.form.get('name').value;
        }
        return null;
    }
    set name(val) {
        this.form.get('name').patchValue(val);
        this.form.get('name').markAsDirty();
    }

    get description() {
        if (this.form.get('description')) {
            return this.form.get('description').value;
        }
        return null;
    }
    set description(val) {
        this.form.get('description').patchValue(val);
        this.form.get('description').markAsDirty();
    }

    get definitions() {
        return (this.form.get('definition') as UntypedFormArray).controls;
    }

    get changesDone() {
        return this.form.dirty;
    }

    get isValidSchema() {
        return this.form.valid && this.form.dirty;
    }

    private _getClass(type) {
        try {
            return this.types.filter((e, i, a) => {
                if (e.value === type) {
                    return e;
                }
            })[0].class;
        } catch (e) {
            console.log(type, e);
        }
    }

    get selectedFormat() {
        return this.formatList.find(e => e.selected);
    }

    get showAdvanceBtn() {
        return true;
    }

    set strictValidation(val) {
        this.form.get('strictValidation').patchValue(val);
    }

    get strictValidation() {
        return this.form.get('strictValidation').value;
    }

    get formatType() {
        return this.form.get('formatType').value;
    }

    get editable() {
        if (this.edit && this.edit.status) {
            return true;
        }
        return false;
    }
}
