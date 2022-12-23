import {
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    EventEmitter,
    HostListener,
    ChangeDetectorRef,
    AfterViewChecked,
    ElementRef,
    AfterViewInit,
    TemplateRef
} from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbTooltipConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

import * as _ from 'lodash';

import { SchemaBuilderService } from '../schema-utils/schema-builder.service';
import { environment } from '../../../environments/environment';
import { CommonService } from '../../utils/services/common.service';
import { SchemaStructurePipe } from '../schema-utils/schema-structure.pipe';
import { sameName } from '../../home/custom-validators/same-name-validator';
import { SchemaAttributesPipe } from '../schema-utils/schema-attributes.pipe';
import { ManagePermissionsComponent } from '../schema-utils/manage-permissions/manage-permissions.component';
import { AppService } from '../../utils/services/app.service';
import { ShortcutService } from '../../utils/shortcut/shortcut.service';
import { maxLenValidator } from 'src/app/home/custom-validators/min-max-validator';
import { CanComponentDeactivate } from 'src/app/utils/guards/route.guard';
import { IntegrationComponent } from 'src/app/home/schema-utils/integration/integration.component';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { EditConfig, ActionConfig, VersionConfig, DeleteModalConfig } from 'src/app/utils/interfaces/schemaBuilder';
import { SchemaValuePipe } from '../schema-utils/schema-value.pipe';
import { PrettyJsonPipe } from 'src/app/utils/pretty-json/pretty-json.pipe';
import { wizardSteps } from '../custom-validators/wizard-steps.validator';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'odp-schema-builder',
    templateUrl: './schema-builder.component.html',
    styleUrls: ['./schema-builder.component.scss'],
    providers: [SchemaStructurePipe, SchemaAttributesPipe, SchemaValuePipe, PrettyJsonPipe]
})

export class SchemaBuilderComponent implements
    OnInit, OnDestroy, AfterViewChecked, CanComponentDeactivate, AfterViewInit {

    @ViewChild('deleteModalTemplate') deleteModalTemplate: TemplateRef<HTMLElement>;
    @ViewChild('pageChangeModalTemplate') pageChangeModalTemplate: TemplateRef<HTMLElement>;
    @ViewChild('schemaToggleTemplate') schemaToggleTemplate: TemplateRef<HTMLElement>;
    @ViewChild('permissionsComponent') permissionsComponent: ManagePermissionsComponent;
    @ViewChild('integrationComponent') integrationComponent: IntegrationComponent;
    @ViewChild('schemaName') schemaName: ElementRef;
    deleteModalTemplateRef: NgbModalRef;
    pageChangeModalTemplateRef: NgbModalRef;
    schemaToggleTemplateRef: NgbModalRef;
    toggleTemplateRef: NgbModalRef;
    app: string;
    form: UntypedFormGroup;
    showLazyLoader: boolean;
    cloneServiceId: string;
    editServiceId: string;
    deleteModal: DeleteModalConfig;
    toggleSchemaModal: any;
    edit: EditConfig;
    action: ActionConfig;
    version: 1;
    activeTab = 0;
    experienceSideNavActiveTab = 0;
    errMessage: string;
    permissions: any = {};
    clickCount = 0;
    clickTimeout: any;
    schemaFieldheight: number;
    serviceObj: any = {};
    subscriptions: any = {};
    versionConfig: VersionConfig;
    defaultVersionValues: Array<any> = [null, '', '-1', '10', '25', '50', '100', '1 months', '3 months', '6 months', '1 years'];
    nameChange: EventEmitter<any>;
    detectPermissionChange: EventEmitter<any>;
    breadcrumbPaths: Array<Breadcrumb>;
    roleChange: boolean;
    exampleJSON: any;
    exampleSchema: any;
    roleData: any;
    oldRoleData: any;
    blockInvalidRole: any = {};
    manageRolesFirstInit = true;

    sortableOnMove = (event: any) => {
        return !event.related.classList.contains('disabled');
    }

    @HostListener('window:beforeunload', ['$event'])
    public beforeunloadHandler($event) {
        if (this.form.dirty) {
            $event.returnValue = 'Are you sure?';
        }
    }

    constructor(private fb: UntypedFormBuilder,
        private router: Router,
        private schemaService: SchemaBuilderService,
        private commonService: CommonService,
        private appService: AppService,
        private route: ActivatedRoute,
        private prettyJsonPipe: PrettyJsonPipe,
        private schemaStructurePipe: SchemaStructurePipe,
        private schemaValuePipe: SchemaValuePipe,
        private schemaAttributesPipe: SchemaAttributesPipe,
        private ts: ToastrService,
        private shortcutService: ShortcutService,
        private ngbToolTipConfig: NgbTooltipConfig,
        private cd: ChangeDetectorRef) {
        const self = this;
        self.roleChange = false;
        self.edit = {
            loading: true,
            status: false
        };
        self.deleteModal = {
            title: 'Delete record(s)',
            message: 'Are you sure you want to delete self record(s)?',
            falseButton: 'No',
            trueButton: 'Yes',
            showButtons: true
        };

        self.toggleSchemaModal = {
            title: '',
            message: '',
            info: ''
        };

        self.action = {
            loading: false,
            status: false,
            message: null
        };
        const connectorForm = this.fb.group({
            data: [{}],
            file: [{}]
        })
        self.form = self.fb.group({
            name: ['', [Validators.required, maxLenValidator(40)]],
            description: [null, [maxLenValidator(250)]],
            api: ['/', [Validators.required]],
            permanentDeleteData: [true],
            allowedFileTypes: [[]],
            schemaFree: [false],
            wizard: self.fb.group({
                steps: self.fb.array([], [wizardSteps]),
                selectedStep: [0],
                usedFields: self.fb.array([])
            }),
            stateModel: self.fb.group(
                {
                    attribute: [''],
                    initialStates: [[]],
                    states: [{}],
                    enabled: [false]
                }
            ),
            workflowConfig: self.fb.group({
                enabled: [false],
                makerCheckers: self.fb.array([])
            }),
            definition: self.fb.array([
                self.fb.group(
                    {
                        key: ['_id'],
                        type: ['id'],
                        prefix: [null],
                        suffix: [null],
                        padding: [null],
                        counter: [null, [Validators.max(9999999999)]]
                    }
                ),
                self.schemaService.getDefinitionStructure()
            ]),
            webHooks: [[]],
            preHooks: [[]],
            workflowHooks: self.fb.group({
                postHooks: self.fb.group({
                    submit: [[]],
                    rework: [[]],
                    discard: [[]],
                    approve: [[]],
                    reject: [[]]
                })
            }),
            tags: self.fb.array([]),
            versionValidity: self.fb.group({
                validityType: ['count', [Validators.required]],
                validityValue: [-1]
            }),
            disableInsights: [false],
            headers: [],
            enableSearchIndex: '',
            ingestionPoints: [],
            connectors: connectorForm
        });

        self.versionConfig = {
            type: 'count',
            value: '-1',
        };
        self.nameChange = new EventEmitter();
        self.breadcrumbPaths = [];
        self.roleData = {};
    }

    ngOnInit() {
        const self = this;
        self.ngbToolTipConfig.container = 'body';
        self.app = self.commonService.app._id;
        self.commonService.activeComponent = this;
        self.commonService.apiCalls.componentLoading = false;
        self.form.get('enableSearchIndex').patchValue(self.commonService.userDetails['enableSearchIndex']);
        self.form.get('definition').setValidators([sameName]);
        // self.form.get(['definition', 0]).setValidators([counterPaddingValidator]);
        self.breadcrumbPaths.push({
            active: false,
            label: 'Data Services',
            url: '/app/' + self.commonService.app._id + '/sm'
        });
        this.commonService.changeBreadcrumb(this.breadcrumbPaths)
        self.enableEdit(false);
        self.route.params.subscribe(param => {
            if (param.id) {
                self.appService.purgeServiceId = param.id;
                if (self.appService.editServiceId) {
                    self.editServiceId = self.appService.editServiceId;
                    self.appService.editServiceId = null;
                } else {
                    self.edit.status = false;
                }
                self.commonService.apiCalls.componentLoading = true;
                self.edit.id = param.id;
                // self.form.get(['definition', 0, 'counter'])
                //     .setAsyncValidators([counterValidator(self.commonService, self.edit.id)]);
                self.fillDetails(param.id);
            } else {
                self.enableEdit(true);
                self.edit.id = null;
                self.breadcrumbPaths.push({
                    active: true,
                    label: 'New Data Service'
                });
                this.commonService.changeBreadcrumb(this.breadcrumbPaths)
                if (self.commonService.app.serviceVersionValidity) {
                    self.form.get('versionValidity.validityType').patchValue(self.commonService.app.serviceVersionValidity.validityType);
                    self.form.get('versionValidity.validityValue').patchValue(self.commonService.app.serviceVersionValidity.validityValue);
                    self.setVersionConfig();
                }
            }
            if (self.appService.cloneServiceId) {
                self.cloneServiceId = self.appService.cloneServiceId;
                self.appService.cloneServiceId = null;
                self.fillDetails(self.cloneServiceId);
            }
        });
        self.appService.detectPermissionChange.subscribe(data => {
            self.roleChange = data;
        });
        self.form.controls.name.valueChanges.subscribe(val => {
            if (!self.edit.id && val) {
                self.form.controls.api.patchValue('/' + _.camelCase(val));
                self.form.get(['definition', 0, 'prefix']).patchValue(_.toUpper(_.camelCase(val.substring(0, 3))));
                self.form.get(['definition', 0, 'counter']).patchValue(1001);
                self.nameChange.emit(val);
            }
            self.action.message = null;
        });

        self.clickTimeout = setTimeout(() => {
            self.clickCount = 0;
        }, 5000);
        self.subscriptions['sessionExpired'] = self.commonService.sessionExpired.subscribe(() => {
            self.form.markAsPristine();
        });
        self.subscriptions['ctrlSKey'] = self.shortcutService.ctrlSKey.subscribe((event: KeyboardEvent) => {
            if (self.edit.status) {
                self.checkAndSave();
            }
        });
        self.subscriptions['userLoggedOut'] = self.commonService.userLoggedOut.subscribe(res => {
            self.form.markAsPristine();
        });
        self.subscriptions['altKey'] = self.shortcutService.altKey.subscribe((event: KeyboardEvent) => {
            if (event.altKey && event.key === '1' && self.hasPermissionForTab('D')) {
                event.preventDefault();
                self.activeTab = 0;
            }
            if (event.altKey && event.key === '2' && self.hasPermissionForTab('I')) {
                event.preventDefault();
                self.activeTab = 1;
            }
            if (event.altKey && event.key === '3' && self.hasPermissionForTab('E')) {
                event.preventDefault();
                self.activeTab = 2;
            }
            if (event.altKey && event.key === '4' && self.hasPermissionForTab('R')) {
                event.preventDefault();
                self.activeTab = 4;
            }
            if (event.altKey && event.key === '5' && self.hasPermissionForTab('S')) {
                event.preventDefault();
                self.activeTab = 3;
            }
            if (event.altKey && event.key === '6' && self.hasPermissionForTab('A')) {
                event.preventDefault();
                if (self.edit.id && self.edit.status) {
                    self.activeTab = 5;
                }
            }
        });
        // this.getConnectors();

        this.getAvailableConnectors();
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
        if (self.deleteModalTemplateRef) {
            self.deleteModalTemplateRef.close();
        }
    }

    ngAfterViewChecked() {
        const self = this;
        self.cd.detectChanges();
    }

    ngAfterViewInit() {
        const self = this;
        if (self.schemaName) {
            self.schemaName.nativeElement.focus();
        }
    }

    generateData() {
        this.exampleJSON = this.schemaValuePipe.transform(this.form.get('definition').value);
        this.exampleSchema = this.schemaStructurePipe.transform(this.form.value);
    }

    fetchPermissions(id) {
        const self = this;
        // const options = { 
        //     filter: { entity: id }
        // };
        if (self.serviceObj.role) {
            self.roleData = self.serviceObj.role;
            self.oldRoleData = self.appService.cloneObject(self.serviceObj.role);
        }
        else {
            self.roleData.roles = self.appService.getDefaultRoles();
            self.oldRoleData = self.appService.cloneObject(self.roleData);
        }
        // if (self.serviceObj.role) {
        //     self.roleData = self.serviceObj.role;
        //     self.oldRoleData = self.appService.cloneObject(self.serviceObj.role);
        // } else {
        //     self.subscriptions['fetchPermissions'] = self.commonService.get('user', '/role', options).subscribe(res => {
        //         self.serviceObj.role = res[0];
        //         self.roleData = res[0];
        //         self.oldRoleData = self.appService.cloneObject(self.role);
        //     }, err => {
        //         self.commonService.errorToast(err, 'Unable to fetch permissions');
        //     });
        // }
    }

    get stateModelIfEnabled() {
        const self = this;
        if (self.form.get(['stateModel', 'enabled']).value) {
            this.schemaService.stateModel=self.form.get(['stateModel', 'attribute'])
            return self.form.get(['stateModel', 'attribute'])
        }
        else {
            return false;
        }
    }

    deleteStateModel(condition) {
        const self = this;
        if (condition) {
            self.form.get(['stateModel', 'enabled']).patchValue(false);
            self.form.get(['stateModel', 'attribute']).patchValue('');
            self.form.get(['stateModel', 'initialStates']).patchValue([]);
            self.form.get(['stateModel', 'states']).patchValue({});
        }
    }

    viewStateModel(condition) {
        const self = this;
        if (condition) {
            self.activeTab = 2;
            self.experienceSideNavActiveTab = 0;
        }
    }

    toggleSchemaType(schemaFree: boolean) {
        const self = this;
        if (!this.edit || !this.edit.status) {
            return false;
        }
        if (schemaFree) {
            self.toggleSchemaModal = {
                title: 'Enable Schema Free',
                message: 'Allows you to use Appcenter as a repository for unstructured data storage.',
                info: '(Enabling schema free will remove all the Validations)'
            };
        } else {
            self.toggleSchemaModal = {
                title: 'Enabling Schema Designer',
                message: 'Define data in collection, existing data will be maintained but might not be accessible. New documents will require validations',
                info: ''
            };
        }
        if (self.schemaToggleTemplateRef) {
            self.schemaToggleTemplateRef.close(false);
        }
        self.schemaToggleTemplateRef = self.commonService.modal(self.schemaToggleTemplate);
        self.schemaToggleTemplateRef.result.then((response) => {
            if (response) {
                if (self.form && self.form.get('schemaFree')) {
                    if (schemaFree) {
                        self.schemaFreeConfiguration();
                    }

                    self.form.get('schemaFree').patchValue(schemaFree);
                }
            }
        }, dismiss => { });

    }

    schemaFreeConfiguration() {
        const self = this;

        // reset state model
        self.form.get('stateModel').patchValue({
            'enabled': false,
            'attribute': '',
            'initialStates': [],
            'states': {}
        });

        // reset personalize 
        (self.form.get('wizard.steps') as UntypedFormArray).clear();
        (self.form.get('wizard.usedFields') as UntypedFormArray).clear();
        self.form.get('wizard.selectedStep').patchValue([0]);

        // remove all attributes 
        (self.form.controls.definition as UntypedFormArray).clear();

        // reset maker checker 
        (self.form.get('workflowConfig.makerCheckers') as UntypedFormArray).clear()
        self.form.get('workflowConfig.enabled').patchValue(false);

        // reset workflow hooks
        (self.form.get(['workflowHooks', 'postHooks']) as UntypedFormGroup).reset({
            submit: [],
            rework: [],
            discard: [],
            approve: [],
            reject: []
        });

        // remove conditions
        if (self.roleData && self.roleData.roles) {
            self.roleData.roles.forEach(role => {
                role.rule = [];
            });
        }

        const tempDef = JSON.parse(JSON.stringify(self.serviceObj));
        tempDef.definition = self.schemaService.generateStructure(tempDef.definition);
        (self.form.controls.definition as UntypedFormArray).push(self.fb.group({
            key: ['_id'],
            type: ['id'],
            prefix: [null],
            suffix: [null],
            padding: [null],
            counter: [null],
            properties: self.schemaService.getPropertiesStructure(tempDef.definition.find(d => d.key === '_id'))
        }));

        if (self.form.get(['definition', 0])) {
            self.form.get(['definition', 0]).patchValue(tempDef.definition.find(d => d.key === '_id'));
        }
    }

    get isSchemaFree() {
        const self = this;
        if (self.form && self.form.get('schemaFree')) {
            return self.form.get('schemaFree').value;
        }
        return false;
    }

    save(deploy?: boolean) {
        const self = this;
        if (self.form.get('schemaFree').value) {
            self.form.get('connectors').get('file').setValue({})
        }
        const value = self.form.getRawValue();
        self.action.loading = true;
        self.action.message = null;
        let response: Observable<any>;
        let payload;
        if (self.hasAnyTabPermission) {
            payload = self.schemaStructurePipe.transform(value);
            if (!self.roleData || !self.roleData.roles || self.roleData.roles.length === 0) {
                self.roleData.roles = self.appService.getDefaultRoles();
            }
            const definition = self.appService.patchDataKey(self.fb.array(self.definitions).value);
            const roleIds = self.roleData.roles.map(e => e.id);
            if (!self.roleData.fields) {
                self.roleData.fields = {};
            }
            if (definition) {
                self.roleData.fields = self.appService.getDefaultFields(roleIds, definition, self.roleData.fields);
            } else {
                self.roleData.fields = self.appService.getDefaultFields(roleIds, [
                    {
                        key: '_id',
                        type: 'String'
                    }
                ], self.roleData.fields);
            }
            payload.role = self.roleData;
            payload.definition.forEach(def => {
                if (def['type'] && def['type'] === 'Relation') {
                    const temp = payload.role.fields[def.key];
                    payload.role.fields[def.key] = {};
                    payload.role.fields[def.key]._id = temp;
                }
            });
        } else {
            payload = value;
        }
        payload.app = self.commonService.app._id;
        if (!self.canEditService) {
            delete payload.name;
            delete payload.description;
        }
        delete payload.port;
        delete payload.tags;
        delete payload.allowedFileTypes;
        if (!self.hasPermissionForTab('D')) {
            delete payload.attributeList;
            delete payload.definition;
        }
        if (!self.hasPermissionForTab('R') && !self.hasPermissionForTab('D')) {
            delete payload.role;
        }
        if (!self.hasPermissionForTab('E')) {
            delete payload.wizard;
            delete payload.stateModel;
        }
        if (!this.hasPermissionForTab('S')) {
            delete payload.api;
            delete payload.versionValidity;
            delete payload.headers;
            delete payload.enableSearchIndex;
            delete payload.permanentDeleteData;
            delete payload.disableInsights;
        }
        if (!this.hasPermissionForTab('I')) {
            delete payload.webHooks;
            delete payload.preHooks;
            delete payload.workflowHooks;
        }
        if (payload.definition) {
            self.appService.addKeyForDataStructure(payload.definition, 'camelCase');
        }

        self.showLazyLoader = true;
        if (self.edit.id) {
            response = self.commonService.put('serviceManager', `/${this.commonService.app._id}/service/` + self.edit.id, payload);
        } else {
            response = self.commonService.post('serviceManager', `/${this.commonService.app._id}/service`, payload);
        }
        response.subscribe(res => {
            self.showLazyLoader = false;
            self.action.loading = false;
            self.roleChange = false;
            if (deploy) {
                self.deploy(res);
            } else {
                self.ts.success('Saved ' + payload.name + '.');
                self.form.markAsPristine();
                self.router.navigate(['/app/', self.commonService.app._id, 'sm']);
            }
        },
            err => {
                self.showLazyLoader = false;
                self.action.loading = false;
                self.enableEdit(true);
                self.commonService.errorToast(err, 'Oops, something went wrong. Please try again later');
            });
    }

    checkAndSave() {
        const self = this;

        self.save();
    }

    checkSaveAndDeploy() {
        const self = this;
        if (!self.isSchemaFree && self.form.get(['definition', 0, 'counter']).dirty && self.edit.id) {
            const payload = self.schemaStructurePipe.transform(self.form.value);
            self.commonService.get('serviceManager', `/${this.commonService.app._id}/service/utils/idCount/${this.edit.id}`, { filter: { app: this.commonService.app._id } }).subscribe(res => {
                if (payload.definition.find(d => d.key === '_id').counter <= res) {
                    self.commonService.errorToast(
                        { status: 400 }, 'Invalid value for counter because the current counter value is  ' + res);
                    self.enableEdit(true);
                    return;
                } else {
                    self.save(true);
                }
            }, err => {
                self.commonService.errorToast(err, 'Unable to get the count.');
            });
        } else {
            self.save(true);
        }
    }

    deploy(payload: any) {
        const self = this;
        self.showLazyLoader = true;
        self.commonService.put('serviceManager', `/${this.commonService.app._id}/service/utils/${payload._id}/deploy`, { app: this.commonService.app._id }).subscribe(res => {
            self.showLazyLoader = false;
            self.action.loading = false;
            self.roleChange = false;
            self.ts.success('Saved ' + payload.name + ' and deployment process has started.');
            self.form.markAsPristine();
            self.router.navigate(['/app/', self.commonService.app._id, 'sm']);
        },
            err => {
                self.showLazyLoader = false;
                self.action.loading = false;
                self.enableEdit(true);
                self.commonService.errorToast(err, 'Oops, something went wrong. Please try again later');
            });
    }

    addGroup(place?: string) {
        const self = this;
        if (place && self.schemaService.selectedFieldId) {
            self.schemaService.addAttribute.emit(place);
        } else {
            const tempArr = self.form.controls.definition as UntypedFormArray;
            const temp = self.schemaService.getDefinitionStructure({ _newField: true });
            tempArr.push(temp);

        }
    }

    resetBuilder() {
        const self = this;
        self.deleteModal.title = 'Delete all attributes ';
        self.deleteModal.message = 'Are you sure you want to delete all attributes in this data service?'
            + ' This action cannot be undone.';
        self.deleteModal.showButtons = true;
        self.deleteModalTemplateRef = self.commonService.modal(self.deleteModalTemplate);
        self.deleteModalTemplateRef.result.then((close) => {
            if (close) {
                (self.form.controls.definition as UntypedFormArray).clear();
                const tempDef = JSON.parse(JSON.stringify(self.serviceObj));
                tempDef.definition = self.schemaService.generateStructure(tempDef.definition);

                (self.form.controls.definition as UntypedFormArray).push(self.fb.group({
                    key: ['_id'],
                    type: ['id'],
                    prefix: [null],
                    suffix: [null],
                    padding: [null],
                    counter: [null],
                    properties: self.schemaService.getPropertiesStructure(tempDef.definition.find(d => d.key === '_id'))
                }));

                if (self.form.get(['definition', 0])) {
                    self.form.get(['definition', 0]).patchValue(tempDef.definition.find(d => d.key === '_id'));
                }

            }
        }, dismiss => { });
    }

    cancel() {
        const self = this;
        self.schemaService.activeProperty.emit(null);
        if (self.form.dirty || self.roleChange) {
            self.deleteModal.title = 'Cancel';
            self.deleteModal.message = 'Are you sure you want to cancel all the unsaved changes' +
                ' to this data service? This action cannot be undone.';
            self.deleteModal.showButtons = true;
            self.deleteModalTemplateRef = self.commonService.modal(self.deleteModalTemplate);
            self.deleteModalTemplateRef.result.then((close) => {
                if (close) {
                    self.form.markAsPristine();
                    if (self.edit.id) {
                        if (self.editServiceId) {
                            self.router.navigate(['/app/', self.commonService.app._id, 'sm']);
                        } else {
                            self.roleChange = false;
                            self.edit.status = false;
                            self.breadcrumbPaths.pop();
                            this.commonService.changeBreadcrumb(this.breadcrumbPaths)
                            self.fillDetails(self.edit.id);
                            this.activeTab = 0;
                        }
                    } else {
                        self.router.navigate(['/app/', self.commonService.app._id, 'sm']);
                    }
                }
            }, dismiss => { });
        } else {
            if (self.edit.id) {
                if (self.editServiceId) {
                    self.router.navigate(['/app/', self.commonService.app._id, 'sm']);
                } else {
                    if (self.edit.status) {
                        self.edit.status = false;
                        this.activeTab = 0;
                    } else {
                        self.router.navigate(['/app/', self.commonService.app._id, 'sm']);
                    }
                }
            } else {
                self.router.navigate(['/app/', self.commonService.app._id, 'sm']);
            }
        }
    }

    setVersionConfig() {
        const self = this;
        self.versionConfig.type = self.form.get('versionValidity.validityType').value;
        const validityValue = self.form.get('versionValidity.validityValue').value.toString();
        if (+validityValue.split(' ')[0] > 0) {
            const defaultIndex = self.defaultVersionValues.findIndex(e => {
                if (e === validityValue) {
                    return e;
                }
            });
            if (!(defaultIndex > -1)) {
                self.versionConfig.value = 'custom';
                self.versionConfig.customValue = validityValue.split(' ')[0];
                self.versionConfig.customValueSuffix = validityValue.split(' ')[1];
                self.versionConfig.isCustomValue = true;
            } else {
                self.versionConfig.value = validityValue;
            }
        } else {
            self.versionConfig.value = validityValue;
        }
    }

    fillDetails(id) {
        const self = this;
        (self.form.get('definition') as UntypedFormArray).clear();
        self.edit.loading = true;
        self.subscriptions['getservice'] = self.commonService.get('serviceManager', `/${this.commonService.app._id}/service/` + id + '?draft=true', { filter: { app: this.commonService.app._id } })
            .subscribe(res => {
                self.commonService.apiCalls.componentLoading = false;
                self.schemaService.initialState(res);
                res.definition = self.schemaService.patchType(res.definition);
                self.serviceObj = res;
                self.commonService.serviceData = res;
                if (self.editServiceId || self.cloneServiceId) {
                    self.enableEdit(true);
                }
                self.nameChange.emit(res.name);
                if (res.schemaFree) {
                    this.schemaFreeConfiguration()
                }
                // self.serviceObj['docapi'] = `${environment.url.doc}/?q=/api/a/sm/service/${self.serviceObj._id}/swagger/${self.serviceObj.app}${self.serviceObj.api}`;
                self.serviceObj['docapi'] = `${environment.url.doc}/?q=/api/a/sm/${self.serviceObj.app}/service/utils/${self.serviceObj._id}/swagger/${self.serviceObj.app}${self.serviceObj.api}`;

                self.edit.loading = false;
                const temp = JSON.parse(JSON.stringify(res));
                delete temp.wizard;
                self.version = res.version;
                temp.definition = self.schemaService.generateStructure(temp.definition);
                self.form.patchValue(temp);
                self.fillMakerChecker(res);

                if (!self.form.get(['definition', 0])) {
                    (self.form.get(['definition']) as UntypedFormArray).push(self.fb.group({
                        key: ['_id'],
                        type: ['id'],
                        prefix: [null],
                        suffix: [null],
                        padding: [null],
                        counter: [null, [Validators.max(9999999999)]],
                        properties: self.schemaService.getPropertiesStructure(temp.definition.find(d => d.key === '_id'))
                    }));
                }
                if (self.form.get(['definition', 0])) {
                    self.form.get(['definition', 0]).patchValue(temp.definition.find(d => d.key === '_id'));
                }

                temp.definition.filter(def => def.key !== '_id').forEach(def => {
                    const tempDef = self.schemaService.getDefinitionStructure(self.appService.cloneObject(def));
                    tempDef.get('properties.name').patchValue(def.properties.name);
                    (self.form.get('definition') as UntypedFormArray).push(tempDef);
                });

                temp.tags.forEach(tag => {
                    (self.form.get('tags') as UntypedFormArray).push(new UntypedFormControl(tag));
                });
                if (res.wizard && res.wizard.length > 0) {
                    res.wizard.forEach((step, i) => {
                        (self.form.get('wizard.steps') as UntypedFormArray).push(self.fb.group({
                            name: [null, [Validators.required, maxLenValidator(40)]],
                            fields: self.fb.array([]),
                            actions: self.fb.array([])
                        }));
                        for (const action of step.actions) {
                            const actionHookForm = self.fb.group({
                                name: [action.name, Validators.required],
                                url: [action.url, [Validators.required, Validators.pattern(/^http(s)?:(.*)\/?(.*)/)]],
                                errorMessage: [action.errorMessage],
                                label: [action.label],
                                type: [action.type],
                                hookId: [action.hookId]
                            });
                            (((self.form.get('wizard.steps') as UntypedFormArray)
                                .at(+i) as UntypedFormGroup).get('actions') as UntypedFormArray).push(actionHookForm);
                        }
                        for (const field of step.fields) {
                            (self.form.get('definition') as UntypedFormArray).controls.forEach(e => {
                                if (!e.get('_id')) {
                                    if (e.value.key === field) {
                                        (self.form.get('wizard.usedFields') as UntypedFormArray).push(e);
                                        (self.form.get(['wizard', 'steps', +i, 'fields']) as UntypedFormArray).push(e);

                                    }
                                } else {
                                    if ('_id' === field) {
                                        const temp2 = self.schemaService.getDefinitionStructure({
                                            key: '_id',
                                            properties: {
                                                name: e.value._id.properties.name,
                                                readonly: e.value._id.properties.readonly,
                                            }
                                        });
                                        (self.form.get('wizard.usedFields') as UntypedFormArray).push(temp2);
                                        (self.form.get(['wizard', 'steps', +i, 'fields']) as UntypedFormArray).push(temp2);

                                    }
                                }
                            });
                        }
                        self.form.get(['wizard', 'steps', +i, 'name']).patchValue(step.name);
                    });
                }
                self.setVersionConfig();
                let serviceName = self.form.get('name').value;
                if (self.editServiceId) {
                    serviceName += ' (Edit)';
                }
                self.breadcrumbPaths.push({
                    active: true,
                    label: serviceName
                });
                this.commonService.changeBreadcrumb(this.breadcrumbPaths)
                if (self.cloneServiceId) {
                    const name = self.form.get('name').value;
                    self.form.get('name').patchValue(name + ' Copy');
                    self.form.controls.api.patchValue('/' + _.camelCase(name + ' Copy'));
                    self.form.get('versionValidity').patchValue({ validityType: 'count', validityValue: -1 });
                }
                self.fetchPermissions(id);
            }, err => {
                self.commonService.errorToast(err, 'Unable to fetch details, please try again later');
            });
    }

    fillMakerChecker(res) {
        const self = this;
        if (res.workflowConfig && res.workflowConfig.makerCheckers.length > 0) {
            res.workflowConfig.makerCheckers.forEach(makerChecker => {
                let makerCheckerFormArray = (self.form.get(['workflowConfig', 'makerCheckers']) as UntypedFormArray);
                let makerCheckerFormGrp = self.fb.group({
                    steps: self.fb.array([])
                });
                makerChecker.steps.forEach(step => {
                    (makerCheckerFormGrp.get('steps') as UntypedFormArray).push(self.fb.group({
                        id: [step.id],
                        name: step.name,
                        approvals: step.approvals
                    }))

                });
                makerCheckerFormArray.push(makerCheckerFormGrp);
            });
        }
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

    get changesDone() {
        const self = this;
        return self.form.dirty;
    }

    get changesDoneInConfiguration() {
        const self = this;
        const flag = self.form.get('name').dirty ||
            self.form.get('description').dirty ||
            self.form.get('permanentDeleteData').dirty ||
            self.form.get('disableInsights').dirty ||
            self.form.get('api').dirty ||
            self.form.get('tags').dirty ||
            self.form.get('headers').dirty ||
            self.form.get('versionValidity').dirty || (
                self.form.get(['definition', 0]) &&
                self.form.get(['definition', 0]).dirty
            );
        return flag;
    }

    get errorInConfiguration() {
        const self = this;
        const flag = self.form.get('name').invalid ||
            self.form.get('description').invalid ||
            self.form.get('permanentDeleteData').invalid ||
            self.form.get('disableInsights').invalid ||
            self.form.get('api').invalid ||
            self.form.get('tags').invalid ||
            self.form.get('headers').invalid ||
            self.form.get('versionValidity').invalid || (
                self.form.get(['definition', 0]) &&
                self.form.get(['definition', 0]).invalid
            );
        return flag;
    }

    get changesDoneInDesign() {
        const self = this;
        return (self.form.get('definition') as UntypedFormArray).dirty;
    }

    get errorInDesign() {
        const self = this;
        const arr = (self.form.get('definition') as UntypedFormArray).controls.filter(c => c.get('_id') ? false : true).map(c => c.invalid);
        if (arr.length > 0) {
            return Math.max.apply(null, arr);
        }
        return false;
    }

    get changesDoneInIntegration() {
        const self = this;
        if (self.integrationComponent) {
            return self.integrationComponent.changesDone();
        }
        return false;
    }

    get errorInIntegration() {
        const self = this;
        if (self.integrationComponent) {
            return self.integrationComponent.invalidForm();
        }
        return false;
    }

    get changesDoneInExperience() {
        const self = this;
        return self.form.get('wizard').dirty;
    }

    get errorInExperience() {
        const self = this;
        return self.form.get('wizard').invalid;
    }

    get changesDoneInRoles() {
        const self = this;
        return JSON.stringify(self.oldRoleData) !== JSON.stringify(self.role);
    }

    get errorInRoles() {
        const self = this;
        if (!self.roleData || !self.roleData.roles || !self.roleData.roles.length) {
            return false;
        }
        let notValid = (self.roleData.roles as any[]).some(element => !element.name);
        return notValid || !self.ruleBlocksValid;
    }

    get ruleBlocksValid() {
        const self = this;
        let isValid = true;
        let count = 0;
        if (Object.keys(self.blockInvalidRole).length > 0) {
            Object.keys(self.blockInvalidRole).forEach(key => {
                if (self.blockInvalidRole[key]) {
                    count++;
                }
            });
            if (count > 0) {
                isValid = false;
            } else {
                isValid = true;
            }
        }
        return isValid;
    }

    get isValidSchema() {
        const self = this;
        if (!self.form.valid) {
            return false;
        }
        if (!self.isSchemaFree && (self.form.get('definition') as UntypedFormArray).length < 2) {
            return false;
        }
        if (self.errorInRoles) {
            return false;
        }

        return true;
    }

    get canSchemaBeSaved() {
        if (!this.isSchemaFree && this.hasSameNameError(this.definitions)) {
            return false;
        }
        if (!this.isSchemaFree && this.form.hasError('invalidDynamicFilter')) {
            return false;
        }
        if (!this.isSchemaFree && (this.form.get('definition') as UntypedFormArray).length < 2) {
            return false;
        }
        return true;
    }

    get definitions() {
        const self = this;
        return (self.form.get('definition') as UntypedFormArray).controls;
    }

    hasSameNameError(definition: any[]) {
        let flag = false;
        if (definition) {
            definition.forEach(item => {
                if (item.hasError('sameName')) {
                    flag = true;
                } else if (item.get('definition')) {
                    flag = this.hasSameNameError((item.get('definition') as UntypedFormArray).controls);
                }
            });
        }
        return flag;
    }

    populateWH(data) {
        const self = this;
        let wh = self.form.get('webHooks').value;
        if (!wh) {
            wh = [];
        }
        data.forEach(e => wh.push(e));
    }

    populatePH(data) {
        const self = this;
        let ph = self.form.get('preHooks').value;
        if (!ph) {
            ph = [];
        }
        data.forEach(e => ph.push(e));
    }

    showHiddenMenu() {
        const self = this;
        if (self.clickCount > 9) {
            return;
        }
        self.clickCount++;
        if (self.clickCount > 9) {
            clearTimeout(self.clickTimeout);
        }
    }

    canDeactivate(): Promise<boolean> | boolean {
        const self = this;
        if (self.changesDone || self.roleChange) {
            return new Promise((resolve, reject) => {
                self.pageChangeModalTemplateRef = self.commonService.modal(this.pageChangeModalTemplate);
                self.pageChangeModalTemplateRef.result.then(close => {
                    resolve(close);
                }, dismiss => {
                    resolve(false);
                });
            });
        }
        return true;
    }

    hasPermission(type: string, entity?: string) {
        const self = this;
        return self.commonService.hasPermission(type, entity);
    }

    hasPermissionStartsWith(type: string, entity?: string) {
        const self = this;
        return self.commonService.hasPermissionStartsWith(type, entity);
    }

    hasPermissionForTab(type: string) {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        }
        const list = self.commonService.getEntityPermissions('SM');
        let inAllPermission = false;
        let inListPermission = false;
        if (self.edit.status) {
            inAllPermission = self.commonService.hasPermissionStartsWith('PMDS' + type);
            inListPermission = Boolean(list.find(e => e.id.substr(0, 5) === 'PMDS' + type));
        } else {
            inAllPermission = self.commonService.hasPermissionStartsWith('PMDS' + type)
                || self.commonService.hasPermissionStartsWith('PVDS' + type);
            inListPermission = Boolean(list.find(e => e.id.substr(0, 5) === 'PMDS' + type))
                || Boolean(list.find(e => e.id.substr(0, 5) === 'PVDS' + type));
        }
        if (list.length === 0 && inAllPermission) {
            return true;
        } else if (list.length > 0 && inListPermission) {
            return true;
        } else {
            return false;
        }
    }

    enableEdit(flag) {
        const self = this;
        self.edit.status = flag;
        if (self.hasPermissionForTab('D')) {
            self.activeTab = 0;
        } else if (self.hasPermissionForTab('I')) {
            self.activeTab = 1;
        } else if (self.hasPermissionForTab('E')) {
            self.activeTab = 2;
        } else if (self.hasPermissionForTab('S')) {
            self.activeTab = 3;
        } else if (self.hasPermissionForTab('R')) {
            self.activeTab = 4;
        } else if (self.hasPermissionForTab('A')) {
            self.activeTab = 5;
        }
    }

    // getConnectors() {
    //     let connectorList = []
    //     if (this.subscriptions?.['getConnectors']) {
    //         this.subscriptions['getConnectors'].unsubscribe();
    //     }
    //     this.subscriptions['getConnectors'] = this.commonService.get('user', `/${this.commonService.app._id}/connector/utils/count`)
    //         .pipe(switchMap((ev: any) => {
    //             return this.commonService.get('user', `/${this.commonService.app._id}/connector`, { count: ev, select: 'name,type,_id' });
    //         }))
    //         .subscribe(res => {
    //             this.appService.connectorsList = res;
    //         }, err => {
    //             this.commonService.errorToast(err, 'We are unable to fetch records, please try again later');
    //         });

    // }

    getAvailableConnectors() {
        this.subscriptions['getAvailableConnectors'] = this.commonService.get('user', `/${this.commonService.app._id}/connector/utils/availableConnectors`).subscribe(res => {
            this.appService.storageTypes = res;
        }, err => {

            this.commonService.errorToast(err, 'Unable to fetch user groups, please try again later');
        });
    }
    get idFieldId() {
        const self = this;
        return self.schemaService.idFieldId;
    }

    get selectedFieldId() {
        const self = this;
        return self.schemaService.selectedFieldId;
    }

    get hasWritePermission() {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        }
        const list2 = self.commonService.getEntityPermissions('SM');
        return Boolean(list2.find(e => e.id.startsWith('PMDS')
            && e.id !== 'PMDSBC'
            && e.id !== 'PMDSBD'
            && e.id !== 'PMDSPD'
            && e.id !== 'PMDSPS'));
    }

    get canSaveAndDeploy() {
        const self = this;
        if (self.commonService.userDetails.isSuperAdmin) {
            return true;
        }
        else if (self.commonService.isAppAdmin && !self.commonService.userDetails.verifyDeploymentUser) {
            return true;
        }
        else if (self.commonService.userDetails.verifyDeploymentUser && self.commonService.userDetails._id === self.serviceObj._metadata.lastUpdatedBy) {
            return false;
        } else {
            if (self.hasPermission('PMDSPD', 'SM')) {
                const list2 = self.commonService.getEntityPermissions('SM');
                return Boolean(list2.find(e => e.id.startsWith('PMDS')
                    && e.id !== 'PMDSBD'
                    && e.id !== 'PMDSBC'
                    && e.id !== 'PMDSPD'
                    && e.id !== 'PMDSPS'));
            }
        }
    }

    get canEditService() {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        } else {
            if (self.hasPermission('PMDSBU', 'SM')) {
                return true;
            }
            else {
                return false;
            }
        }
    }

    get hasAnyTabPermission() {
        const self = this;
        if (self.hasPermissionForTab('D') || self.hasPermissionForTab('I') || self.hasPermissionForTab('E') ||
            self.hasPermissionForTab('R') ||
            self.hasPermissionForTab('S') || self.hasPermissionForTab('A')) {
            return true;
        } else {
            return false;
        }
    }

    copyJSON(json: any) {
        const self = this;
        self.ts.info('Copied to clipboard');
        self.appService.copyToClipboard(JSON.stringify(json, null, 4));
    }

    toPrettyJSON(json: any) {
        const self = this;
        return self.prettyJsonPipe.transform(json);
    }

    get role() {
        const self = this;
        return self.roleData;
    }

    set role(data) {
        const self = this;
        self.roleData = data;
    }
    get editable() {
        const self = this;
        if (self.edit && self.edit.status) {
            return true;
        }
        return false;
    }

    onOldRoleReset(data) {
        this.oldRoleData = this.appService.cloneObject(data);
    }
}
