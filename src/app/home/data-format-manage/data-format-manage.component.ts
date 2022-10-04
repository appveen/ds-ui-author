import {
    Component, OnInit, AfterViewInit, AfterContentChecked, OnDestroy, ViewChild, ElementRef, HostListener, ChangeDetectorRef, TemplateRef
} from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NgbTooltipConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CanComponentDeactivate } from 'src/app/utils/guards/route.guard';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { SchemaAttributesPipe } from '../schema-utils/schema-attributes.pipe';
import { SchemaBuilderService } from '../schema-utils/schema-builder.service';
import { GlobalSchemaStructurePipe } from '../schema-utils/global-schema-structure.pipe';
import { sameName } from '../custom-validators/same-name-validator';
import { OrderByPipe } from 'src/app/utils/pipes/order-by/order-by.pipe';

@Component({
    selector: 'odp-data-format-manage',
    templateUrl: './data-format-manage.component.html',
    styleUrls: ['./data-format-manage.component.scss'],
    providers: [GlobalSchemaStructurePipe, SchemaAttributesPipe, OrderByPipe]
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
    form: FormGroup;
    edit: any = {};
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
    sortableOnMove = (event: any) => {
        return !event.related.classList.contains('disabled');
    }
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private commonService: CommonService,
        private appService: AppService,
        private schemaAttributesPipe: SchemaAttributesPipe,
        private schemaService: SchemaBuilderService,
        private ts: ToastrService,
        private globalSchemaStructurePipe: GlobalSchemaStructurePipe,
        private cdr: ChangeDetectorRef,
        private ngbToolTipConfig: NgbTooltipConfig,
        private orderBy: OrderByPipe) {
        const self = this;
        self.edit = {
            status: false,
            id: null,
            view: false
        };
        self.deleteModal = {};
        self.form = self.fb.group({
            name: [null, [Validators.required]],
            description: [null],
            type: ['Object', [Validators.required]],
            strictValidation: [false],
            definition: self.fb.array([
                self.schemaService.getDefinitionStructure()
            ]),
            formatType: ['JSON', [Validators.required]],
            character: [',', [Validators.required]],
            excelType: ['xls', [Validators.required]],
            lineSeparator: ['\\\\n']
        });
        self.breadcrumbPaths = [];
        self.formatList = self.appService.getFormatTypeList();
        self.activeTab = 0;
        self.microflows = [];
    }

    ngOnInit() {
        const self = this;
        self.breadcrumbPaths.push({
            active: false,
            label: 'Data Formats',
            url: '/app/' + self.commonService.app._id + '/dfl'
        });
        this.commonService.changeBreadcrumb(this.breadcrumbPaths)
        self.commonService.activeComponent = this;
        self.ngbToolTipConfig.container = 'body';
        self.app = self.commonService.app._id;
        self.commonService.apiCalls.componentLoading = false;
        self.route.params.subscribe(params => {
            if (params.id) {
                self.edit.id = params.id;
                if (self.appService.editLibraryId) {
                    self.appService.editLibraryId = null;
                    self.edit.status = true;
                } else {
                    self.edit.view = true;
                    self.edit.status = false;
                }
                self.fillDetails();
            } else {
                self.breadcrumbPaths.push({
                    active: true,
                    label: 'New Data Format'
                });
                this.commonService.changeBreadcrumb(this.breadcrumbPaths)
                self.edit.status = true;
                if (self.appService.clone) {
                    self.fillDetails(self.appService.clone);
                }
            }
        });
        self.form.get('formatType').valueChanges.subscribe(val => {
            if (val === 'CSV') {
                self.removeGroups();
                self.form.get('character').patchValue(',');
            }
        });
        self.form.get('lineSeparator').valueChanges.subscribe(val => {
            console.log(val);
        });
        self.selectType({ class: 'odp-group', value: 'Object', label: 'Group' });
        self.subscriptions['activeproperty'] = self.schemaService.activeProperty.subscribe(val => {
            self.properties = val;
            self.onfocus = true;
        });
        self.subscriptions['sessionExpired'] = self.commonService.sessionExpired.subscribe(() => {
            self.form.markAsPristine();
        });
        self.subscriptions['userLoggedOut'] = self.commonService.userLoggedOut.subscribe(res => {
            self.form.markAsPristine();
        });
    }

    get libNameErr() {
        const self = this;
        return (self.form.get('name').dirty && self.form.get('name').hasError('required') ||
            self.form.get('name').dirty && self.form.get('name').hasError('length'));
    }

    ngAfterViewInit() {
        const self = this;
        if (self.libName) {
            self.libName.nativeElement.focus();
        }
    }

    ngOnDestroy() {
        const self = this;
        if (self.commonService.activeComponent) {
            self.commonService.activeComponent = null;
        }
        Object.keys(self.subscriptions).forEach(e => {
            self.subscriptions[e].unsubscribe();
        });
        if (self.pageChangeModalTemplateRef) {
            self.pageChangeModalTemplateRef.close();
        }
        if (self.deleteModalEleRef) {
            self.deleteModalEleRef.close();
        }
        self.appService.clone = null;
        self.appService.edit = null;
    }

    ngAfterContentChecked() {
        const self = this;
        self.cdr.detectChanges();
    }

    resetForm() {
        const self = this;
        (self.form.get('definition') as FormArray).controls.splice(0);
        (self.form.get('definition') as FormArray).push(self.schemaService.getDefinitionStructure());
    }

    fillDetails(id?) {
        const self = this;
        self.showLazyLoader = true;
        self.subscriptions['fillDetails'] = self.commonService
            .get('partnerManager', `/${this.commonService.app._id}/dataFormat/` + (id ? id : self.edit.id))
            .subscribe(res => {
                self.showLazyLoader = false;
                let temp;
                if (res.definition && res.definition.length > 0) {
                    temp = {
                        name: res.name,
                        description: res.description,
                        strictValidation: res.strictValidation,
                        excelType: res.excelType
                    };
                    self.form.patchValue(temp);
                    self.form.get('type').patchValue('Object');
                    temp.definition = self.schemaService.generateStructure(res.definition);
                    (self.form.get('definition') as FormArray).controls.splice(0);
                    temp.definition.forEach((element, i) => {
                        const tempDef = self.schemaService.getDefinitionStructure(temp.definition[i]);
                        if (temp.definition[i].properties && temp.definition[i].properties.name) {
                            tempDef.get('properties.name').patchValue(temp.definition[i].properties.name);
                            self.onfocus = false;
                        } else {
                            tempDef.get('properties.name').patchValue('_self');
                            self.onfocus = false;
                        }
                        (self.form.get('definition') as FormArray).push(tempDef);
                    });
                } else {
                    temp = {
                        name: res.name,
                        description: res.description
                    };
                    self.form.patchValue(temp);
                }
                if (id) {
                    self.form.controls.name.reset();
                }
                if (res.formatType) {
                    self.formatList.forEach(e => {
                        e.selected = false;
                    });
                    if (res.formatType === 'EXCEL') {
                        temp = self.formatList.find(e => e.formatType === res.formatType && e.excelType === res.excelType);

                    } else {
                        temp = self.formatList.find(e => e.formatType === res.formatType);
                    }
                    if (temp) {
                        temp.selected = true;
                    }
                    self.form.get('formatType').patchValue(res.formatType);
                }
                if (res.character) {
                    self.form.get('character').patchValue(res.character);
                }
                if (res.lineSeparator) {
                    self.form.get('lineSeparator').patchValue(res.lineSeparator);
                }
                if (self.appService.clone) {
                    const name = self.form.get('name').value;
                    self.form.get('name').patchValue(name + ' Copy');
                    self.form.get('description').patchValue(null);
                }
                self.breadcrumbPaths.push({
                    active: true,
                    label: self.form.controls.name.value + (self.edit ? ' (Edit)' : '')
                });
                this.commonService.changeBreadcrumb(this.breadcrumbPaths)
            }, err => {
                self.showLazyLoader = true;
                self.commonService.errorToast(err);
            });
    }

    selectDataFormatType(event) {
        const self = this;
        if (event.target.value === 'delimeter') {
            self.showSubType = true;
            self.dataFormatShow.character = true;
        } else if (event.target.value === 'flatfile') {
            self.showSubType = true;
            self.dataFormatShow.character = false;
        } else {
            self.showSubType = false;
        }
    }
    clearSchema() {
        const self = this;
        self.deleteModal.title = 'Clear Data Format ';
        self.deleteModal.message = 'Are you sure you want to clear ';
        self.deleteModalEleRef = self.commonService.modal(self.deleteModalEle);
        self.deleteModalEleRef.result.then((close) => {
            if (close) {
                self.resetForm();
            }
        }, dismiss => { });
    }

    cancel() {
        const self = this;
        self.deleteModal.title = 'Unsaved Changes';
        self.deleteModal.message = 'Are you sure you want to cancel ';
        if (self.form.dirty) {
            self.deleteModalEleRef = self.commonService.modal(self.deleteModalEle);
            self.deleteModalEleRef.result.then((close) => {
                if (close) {
                    self.form.markAsPristine();
                    if (self.edit.id) {
                        if (self.edit.view && self.edit.status) {
                            self.edit.status = false;
                            self.fillDetails();
                        } else {
                            self.router.navigate(['/app/', self.commonService.app._id, 'dfl']);
                        }
                    } else {
                        self.router.navigate(['/app/', self.commonService.app._id, 'dfl']);
                    }
                }
            }, dismiss => { });
        } else {
            if (self.edit.id) {
                if (self.edit.view && self.edit.status) {
                    self.edit.status = false;
                } else {
                    self.router.navigate(['/app/', self.commonService.app._id, 'dfl']);
                }
            } else {
                self.router.navigate(['/app/', self.commonService.app._id, 'dfl']);
            }
        }
    }
    editSchema(index) {
        const self = this;
        self.edit.status = true;
    }

    saveSchema() {
        const self = this;
        let response;
        const value = self.form.getRawValue();
        const payload = self.globalSchemaStructurePipe.transform(value, true);
        self.appService.addKeyForDataStructure(payload.definition, 'normal');
        self.commonService.commonSpinner = true;
        payload.app = self.commonService.app._id;
        payload.formatType = self.form.value.formatType;
        payload.excelType = self.form.value.excelType;
        payload.character = self.form.value.character;
        payload.length = self.form.value.length;
        payload.lineSeparator = self.form.value.lineSeparator;
        payload.strictValidation = self.form.value.strictValidation;
        if (self.edit.id) {
            response = self.commonService.put('partnerManager', `/${this.commonService.app._id}/dataFormat/` + self.edit.id, payload);
        } else {
            response = self.commonService.post('partnerManager', `/${this.commonService.app._id}/dataFormat`, payload);
        }
        self.subscriptions['globalschema'] = response.subscribe(res => {
            self.commonService.commonSpinner = false;

            self.ts.success('Data Format saved sucessfully');
            self.form.markAsPristine();
            if (self.edit.id) {
                self.router.navigate(['/app/', self.commonService.app._id, 'dfl']);
            } else {
                self.router.navigate(['/app/', self.commonService.app._id, 'dfl']);
            }
        }, err => {
            self.commonService.commonSpinner = false;
            self.edit.status = true;
            self.commonService.errorToast(err);
        });
    }

    addField(place?: string) {
        const self = this;
        if (!place) {
            const tempArr = self.form.get('definition') as FormArray;
            const temp = self.schemaService.getDefinitionStructure({ _newField: true });
            tempArr.push(temp);
        } else {
            self.schemaService.addAttribute.emit(place);
        }
    }

    selectType(type: any) {
        const self = this;
        self.selectedType = type.label;
        self.selectedTypeClass = self._getClass(type.value);
        self.form.controls.type.setValue(type.value);
        self.form.removeControl('definition');
        let key = null;
        if (type.value === 'Object') {
            key = null;
        } else if (type.value === 'Array') {
            key = '_self';
        }
        if (type.value === 'Array' || type.value === 'Object') {
            self.form.addControl('definition', self.fb.array([
                self.schemaService.getDefinitionStructure({ key })
            ]));
            self.form.controls.definition.setValidators([sameName]);
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
        const self = this;
        if (this.changesDone) {
            return new Promise((resolve, reject) => {
                self.pageChangeModalTemplateRef = this.commonService.modal(this.pageChangeModalTemplate);
                self.pageChangeModalTemplateRef.result.then(close => {
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
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        } else {
            const list = self.commonService.getEntityPermissions('DF_' + id);
            if (list.length > 0 && list.find(e => e.id === 'PMDF')) {
                return true;
            } else if (list.length === 0 && self.hasManagePermission('DF')) {
                return true;
            } else {
                return false;
            }
        }
    }


    hasManagePermission(entity: string) {
        const self = this;
        const retValue = self.commonService.hasPermission('PMDF', entity);
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
        const self = this;
        if (type === 'input') {
            self.inputNode.nativeElement.select();
        } else {
            if (self.outputNode && self.outputNode.nativeElement) {
                self.outputNode.nativeElement.select();
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

    removeGroups() {
        const self = this;
        const indexArr = [];
        self.form.value.definition.forEach((ele, index) => {
            if (ele.type === 'Object' || ele.type === 'Array') {
                indexArr.push(index);
            }
        });
        indexArr.reverse().forEach(i => {
            (self.form.get('definition') as FormArray).removeAt(i);
        });
    }
    get name() {
        const self = this;
        if (self.form.get('name')) {
            return self.form.get('name').value;
        }
        return null;
    }
    set name(val) {
        const self = this;
        self.form.get('name').patchValue(val);
        self.form.get('name').markAsDirty();
    }

    get description() {
        const self = this;
        if (self.form.get('description')) {
            return self.form.get('description').value;
        }
        return null;
    }
    set description(val) {
        const self = this;
        self.form.get('description').patchValue(val);
        self.form.get('description').markAsDirty();
    }

    get definitions() {
        const self = this;
        return (self.form.get('definition') as FormArray).controls;
    }

    get changesDone() {
        const self = this;
        return self.form.dirty;
    }

    get isValidSchema() {
        const self = this;
        return self.form.valid && self.form.dirty;
    }

    private _getClass(type) {
        const self = this;
        try {
            return self.types.filter((e, i, a) => {
                if (e.value === type) {
                    return e;
                }
            })[0].class;
        } catch (e) {
            console.log(type, e);
        }
    }

    get selectedFormat() {
        const self = this;
        return self.formatList.find(e => e.selected);
    }

    get showAdvanceBtn() {
        return true;
    }

    set strictValidation(val) {
        const self = this;
        self.form.get('strictValidation').patchValue(val);
    }

    get strictValidation() {
        const self = this;
        return self.form.get('strictValidation').value;
    }

    get formatType() {
        const self = this;
        return self.form.get('formatType').value;
    }

    get editable() {
        const self = this;
        if (self.edit && self.edit.status) {
            return true;
        }
        return false;
    }
}
