import {
    Component,
    OnInit,
    ViewChild,
    HostListener,
    OnDestroy,
    AfterContentChecked,
    ChangeDetectorRef,
    AfterViewInit,
    ElementRef,
    TemplateRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NgbTooltipConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { CommonService } from '../../utils/services/common.service';
import { SchemaBuilderService } from '../schema-utils/schema-builder.service';
import { sameName } from '../custom-validators/same-name-validator';
import { GlobalSchemaStructurePipe } from '../schema-utils/global-schema-structure.pipe';
import { SchemaAttributesPipe } from '../schema-utils/schema-attributes.pipe';
import { AppService } from '../../utils/services/app.service';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { CanComponentDeactivate } from 'src/app/utils/guards/route.guard';

@Component({
    selector: 'odp-global-schemas',
    templateUrl: './global-schemas.component.html',
    styleUrls: ['./global-schemas.component.scss'],
    providers: [GlobalSchemaStructurePipe, SchemaAttributesPipe]
})

export class GlobalSchemasComponent implements
    OnInit, AfterViewInit, AfterContentChecked, CanComponentDeactivate, OnDestroy {
    @ViewChild('deleteModalEle', { static: false }) deleteModalEle: TemplateRef<HTMLElement>;
    @ViewChild('pageChangeModalTemplate', { static: false }) pageChangeModalTemplate: TemplateRef<HTMLElement>;
    @ViewChild('libName', { static: false }) libName: ElementRef;
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
    dataFormatShow = {
        select: false,
        character: false,
    };
    showSubType: boolean;
    showLazyLoader: boolean;
    breadcrumbPaths: Array<Breadcrumb>;
    deleteModal: any;
    @HostListener('window:beforeunload', ['$event'])
    public beforeunloadHandler($event) {
        if (this.form.dirty) {
            $event.returnValue = 'Are you sure?';
        }
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
        private ngbToolTipConfig: NgbTooltipConfig) {
        const self = this;
        self.edit = {
            status: false,
            id: null,
            view: false
        };
        self.form = self.fb.group({
            name: [null, [Validators.required]],
            description: [null],
            type: ['Object', [Validators.required]],
            definition: self.fb.array([
                self.schemaService.getDefinitionStructure()
            ])
        });
        self.breadcrumbPaths = [];
        self.deleteModal = {};
    }

    ngOnInit() {
        const self = this;
        self.breadcrumbPaths.push({
            active: false,
            label: 'Libraries',
            url: '/app/' + self.commonService.app._id + '/lib'
        });
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
                    label: 'New Library'
                });
                self.edit.status = true;
            }
        });
        if (self.appService.cloneLibraryId) {
            self.edit.id = null;
            self.fillDetails(self.appService.cloneLibraryId);
            self.appService.cloneLibraryId = null;
            self.edit.status = true;
        }
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
        if (self.deleteModalEleRef) {
            self.deleteModalEleRef.close();
        }
        if (self.pageChangeModalTemplateRef) {
            self.pageChangeModalTemplateRef.close();
        }
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

    selectDataFormatType(event) {
        const self = this;
        if (event.target.value === 'delimeter') {
            self.showSubType = true;
            self.dataFormatShow.character = true;
        } else if (event.target.value === 'FLATFILE') {
            self.showSubType = true;
            self.dataFormatShow.character = false;
        } else {
            self.showSubType = false;
        }
    }
    clearSchema() {
        const self = this;
        self.deleteModal.title = 'Clear library ';
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
                            self.router.navigate(['/app/', self.commonService.app._id, 'lib']);
                        }
                    } else {
                        self.router.navigate(['/app/', self.commonService.app._id, 'lib']);
                    }
                }
            }, dismiss => { });
        } else {
            if (self.edit.id) {
                if (self.edit.view && self.edit.status) {
                    self.edit.status = false;
                } else {
                    self.router.navigate(['/app/', self.commonService.app._id, 'lib']);
                }
            } else {
                self.router.navigate(['/app/', self.commonService.app._id, 'lib']);
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
        const payload = self.globalSchemaStructurePipe.transform(self.form.value);
        self.commonService.commonSpinner = true;
        payload.app = self.commonService.app._id;
        self.appService.addKeyForDataStructure(payload.definition[0].definition, 'camelCase');
        if (self.edit.id) {
            response = self.commonService.put('serviceManager', '/globalSchema/' + self.edit.id, payload);
        } else {
            response = self.commonService.post('serviceManager', '/globalSchema', payload);
        }
        self.subscriptions['globalschema'] = response.subscribe(res => {
            self.commonService.commonSpinner = false;
            self.ts.success('Library saved sucessfully');
            self.form.markAsPristine();
            if (self.edit.id) {
                self.router.navigate(['/app/', self.commonService.app._id, 'lib']);
            } else {
                self.router.navigate(['/app/', self.commonService.app._id, 'lib']);
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

    selectType(type) {
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

    private fillDetails(id?) {
        const self = this;
        self.showLazyLoader = true;
        self.subscriptions['fillDetails'] = self.commonService
            .get('serviceManager', '/globalSchema/' + (id ? id : self.edit.id), { filter: { app: this.commonService.app._id } })
            .subscribe(res => {
                self.showLazyLoader = false;
                let temp: any;
                if (res.definition) {
                    temp = {
                        name: res.name,
                        type: res.definition[0].type,
                        description: res.description
                    };
                    delete res.definition.type;
                } else {
                    temp = {
                        name: res.name,
                        description: res.description
                    };
                }
                if (res.definition && res.definition[0].definition) {
                    temp.definition = self.schemaService.generateStructure(res.definition[0].definition);
                } else {
                    temp.definition = [];
                }
                self.form.patchValue(temp);
                const typeCtrl = self.form.get('type');
                if (!typeCtrl.value && !!temp.definition?.length && !!temp.definition[0].type) {
                    typeCtrl.setValue(temp.definition[0].type);
                    typeCtrl.updateValueAndValidity();
                }
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
                if (temp.definition && temp.definition.length === 0) {
                    (self.form.get('definition') as FormArray).push(self.schemaService.getDefinitionStructure({ key: null }));
                }
                if (id && self.edit.view && self.edit.status) {
                    const libname = self.form.get('name').value;
                    self.form.get('name').patchValue(libname + ' Copy');
                    self.name = self.form.controls.name.value;
                    self.form.controls.definition.markAsDirty();
                    self.breadcrumbPaths.push({
                        active: true,
                        label: self.form.controls.name.value
                    });
                } else if (self.edit.view && !self.edit.status && id === undefined) {
                    self.breadcrumbPaths.push({
                        active: true,
                        label: self.form.controls.name.value,
                    });
                } else {
                    if (!self.edit.view && self.edit.status && id === undefined) {
                        self.breadcrumbPaths.push({
                            active: true,
                            label: self.form.controls.name.value + (self.edit ? ' (Edit)' : '')
                        });
                    }
                }
            }, err => {
                self.showLazyLoader = true;
                self.commonService.errorToast(err);
            });
    }

    set name(val) {
        const self = this;
        self.form.get('name').patchValue(val);
    }

    get name() {
        const self = this;
        if (self.form && self.form.get('name')) {
            return self.form.get('name').value;
        }
        return null;
    }
    set description(val) {
        const self = this;
        self.form.get('description').patchValue(val);
    }
    get description() {
        const self = this;
        if (self.form && self.form.get('description')) {
            return self.form.get('description').value;
        }
        return null;
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

    get hasWritePermission() {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        }
        const list = self.commonService.getEntityPermissions('GS_' + self.edit.id);
        if (list.length === 0 && self.commonService.hasPermission('PML')) {
            return true;
        } else if (list.length > 0 && list.find(e => e.id === 'PML')) {
            return true;
        } else {
            return false;
        }
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
}
