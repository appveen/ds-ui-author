import {
    Component, OnInit, Input, OnDestroy, ViewChildren,
    QueryList, Renderer2, ElementRef, ViewChild, AfterViewInit,
    TemplateRef
} from '@angular/core';
import { FormGroup, FormArray, Validators, FormBuilder } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import * as uuid from 'uuid/v1';

import { SchemaBuilderService } from 'src/app/home/schema-utils/schema-builder.service';
import { CommonService } from 'src/app/utils/services/common.service';
import { maxLenValidator } from 'src/app/home/custom-validators/min-max-validator';
import { DeleteModalConfig } from 'src/app/utils/interfaces/schemaBuilder';

@Component({
    selector: 'odp-wizards',
    templateUrl: './wizards.component.html',
    styleUrls: ['./wizards.component.scss']
})
export class WizardsComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChildren('stepsEle') stepsEle: QueryList<any>;
    @ViewChild('allStepsDropdown', { static: false }) allStepsDropdown: ElementRef;
    @ViewChild('expHookModal', { static: false }) expHookModal: TemplateRef<HTMLElement>;
    @ViewChild('deleteModalTemplate', { static: false }) deleteModalTemplate: TemplateRef<HTMLElement>;
    @ViewChild('sbName', { static: false }) sbName: ElementRef;
    @ViewChild('tabName', { static: false }) tabName: ElementRef;
    @Input() form: FormGroup;
    @Input() level: number;
    @Input() edit: any;
    deleteModalTemplateRef: NgbModalRef;
    expHookModalRef: NgbModalRef;
    sameNameErr: boolean;
    types: Array<any> = [];
    subscriptions: any;
    deleteModal: DeleteModalConfig;
    showStepsDropdown: boolean;
    activeTab: number;
    actionHookForm: FormGroup;
    triggeredHookValidation: boolean;
    verifyUrl: {
        status: boolean;
        loading: boolean;
    };
    collapse: boolean;
    actionTypes: Array<any> = [];
    remainingFields: Array<any> = [];
    seletedStep: any;
    tempSteps: Array<any> = [];
    stepLevel = 5;
    dragEntered: boolean;
    dragStarted: boolean;
    index = 3;
    formArrLen = 0;
    constructor(
        private commonService: CommonService,
        private schemaService: SchemaBuilderService,
        private fb: FormBuilder,
        private ts: ToastrService,
        private renderer: Renderer2) {
        const self = this;
        self.subscriptions = {};
        self.activeTab = 1;
        self.deleteModal = {
            title: 'Delete record(s)',
            message: 'Are you sure you want to delete record(s)?',
            falseButton: 'No',
            trueButton: 'Yes',
            showButtons: true
        };
        self.actionHookForm = self.fb.group({
            name: ['', [Validators.required, Validators.maxLength(40)]],
            url: [null, [Validators.required, Validators.pattern(/^http(s)?:(.*)\/?(.*)/)]],
            errorMessage: [null],
            label: [null],
            type: ['success'],
            hookId: [null]
        });
        self.verifyUrl = {
            status: false,
            loading: false
        };
        self.triggeredHookValidation = false;
        self.actionTypes = [
            { name: 'Type 1', value: 'success' },
            { name: 'Type 2', value: 'warning' },
            { name: 'Type 3', value: 'danger' }];
        self.sameNameErr = false;
    }

    ngOnInit() {
        const self = this;
        self.remainingFields = self.getRemainingFields();
        self.types = self.schemaService.getSchemaTypes();
        if (self.tabName) {
            self.tabName.nativeElement.focus();
        }
    }

    get sbNameErr() {
        const self = this;
        return ((self.stepNameAsFormCtrl && (self.stepNameAsFormCtrl.dirty || self.stepNameAsFormCtrl.touched) && self.stepNameAsFormCtrl.hasError('required')) ||
            (self.stepNameAsFormCtrl && self.stepNameAsFormCtrl.dirty && self.sameNameErr));
    }

    ngOnDestroy() {
        const self = this;
        Object.keys(self.subscriptions).forEach(key => {
            self.subscriptions[key].unsubscribe();
        });
        if (self.deleteModalTemplateRef) {
            self.deleteModalTemplateRef.close();
        }
        if (self.expHookModalRef) {
            self.expHookModalRef.close();
        }
    }

    ngAfterViewInit() {
        const self = this;
        if (self.tabName) {
            self.tabName.nativeElement.focus();
        }
    }

    get isSchemaFree() {
        const self = this;
        if (self.form && self.form.get('schemaFree')) {
            return self.form.get('schemaFree').value;
        }
        return false;
    }

    toggleTooltip(tooltip, param: string) {
        if (tooltip.isOpen()) {
            tooltip.close();
        } else {
            tooltip.open({ param });
        }
    }

    addStepAfter() {
        const self = this;
        const i = (self.form.get('wizard.steps') as FormArray).controls.length - 1;
        (self.form.get('wizard.steps') as FormArray).insert(i + 1, self.fb.group({
            name: [null, [Validators.required, maxLenValidator(40)]],
            fields: self.fb.array([]),
            actions: self.fb.array([])
        }));
        self.form.get('wizard').markAsDirty();
        self.form.markAsDirty();
        self.form.get('wizard.selectedStep').patchValue(i + 1);
        setTimeout(() => {
            if (document.getElementById('step-' + i)) {
                document.getElementById('step-' + i).scrollIntoView({ block: 'end' });
            }
        }, 100);
        if (self.tabName) {
            self.tabName.nativeElement.focus();
        }
    }

    addToStep(field, index) {
        const self = this;
        const selectedStep = self.form.get('wizard.selectedStep').value;
        (self.form.get(['wizard', 'steps', selectedStep, 'fields']) as FormArray).push(field);
        // (<FormArray>(<FormGroup>(<FormArray>self.form.get('wizard.steps'))
        //     .at(self.form.get('wizard.selectedStep').value)).get('fields')).push(field);
        (self.form.get('wizard.usedFields') as FormArray).push(field);
        self.form.get('wizard').markAsDirty();
        self.form.markAsDirty();
        self.remainingFields = self.getRemainingFields();
    }

    get allActions() {
        const self = this;
        let temp = self.form.get('wizard.steps').value.map(e => e.actions);
        temp = Array.prototype.concat.apply([], temp);
        return temp.filter((e, i, a) => {
            if (a.findIndex(t => {
                if (t && t.name) {
                    return t.name === e.name;
                }
            }) === i) {
                return true;
            }
        }).map(e => {
            if (!e.hookId) {
                e.hookId = uuid();
            }
            return e;
        });
    }

    get selectedStepActions() {
        const self = this;
        const stepIndex = self.stepIndex;
        return self.form.get('wizard.steps').value[stepIndex - 1].actions;
    }

    selectStep(index) {
        const self = this;
        self.form.get('wizard.selectedStep').patchValue(index);
        self.showStepsDropdown = false;
        setTimeout(() => {
            if (document.getElementById('step-' + index)) {
                document.getElementById('step-' + index).scrollIntoView({ block: 'end' });
            }
        }, 100);
    }

    getSteps(index?) {

        const self = this;
        const temp = self.tempSteps;
        self.tempSteps = [];
        const stepsLength = (self.form.get('wizard.steps') as FormArray).length;
        if (!index) {
            if (stepsLength < this.stepLevel) {
                for (let i = 0; i < stepsLength; i++) {
                    self.tempSteps.push(i);
                }
            } else {
                for (let i = 0; i < this.stepLevel; i++) {
                    self.tempSteps.push(i);
                }
            }
        } else {
            if (index < this.stepLevel) {
                for (let i = 0; i <= index; i++) {
                    self.tempSteps.push(i);
                }

            } else {
                for (let i = index - (this.stepLevel - 1); i <= index; i++) {
                    self.tempSteps.push(i);
                }
            }
        }


    }

    setTouched() {
        const self = this;
        const selectedStep = self.form.get('wizard.selectedStep').value;
        (self.form.get(['wizard', 'steps', selectedStep, 'name'])).markAsTouched();
    }


    get stepName() {
        const self = this;
        const selectedStep = self.form.get('wizard.selectedStep').value;
        return (self.form.get(['wizard', 'steps', selectedStep, 'name']) as FormArray).value;
    }


    set stepName(val) {
        const self = this;
        const selectedStep = self.form.get('wizard.selectedStep').value;
        if (val) {
            (self.form.get(['wizard', 'steps', selectedStep, 'name'])).setValue(val);
            (self.form.get(['wizard', 'steps', selectedStep, 'name'])).markAsDirty();
            (self.form.get(['wizard', 'steps', selectedStep, 'name'])).markAsTouched();

        } else {
            (self.form.get(['wizard', 'steps', selectedStep, 'name'])).setValue(null);
            (self.form.get(['wizard', 'steps', selectedStep, 'name'])).markAsDirty();
            (self.form.get(['wizard', 'steps', selectedStep, 'name'])).markAsTouched();

        }
        const expSteps = self.form.get('wizard.steps').value;
        const stepsName = expSteps.map(e => e.name);
        if (stepsName.length > 1) {
            self.sameNameErr = stepsName.filter(e => e === val).length > 1;
        }
    }

    get stepIndex() {
        const self = this;
        const formArr = (self.form.get(['wizard', 'steps']) as FormArray).controls;
        const selectedStep = self.form.get('wizard.selectedStep').value;
        const fArrVal = (self.form.get(['wizard', 'steps', selectedStep, 'name']) as FormArray).value;
        return formArr.findIndex(e => e.value.name === fArrVal) + 1;
    }

    get stepNameAsFormCtrl() {
        const self = this;
        const selectedStep = self.form.get('wizard.selectedStep').value;
        return (self.form.get(['wizard', 'steps', selectedStep, 'name']) as FormArray);
    }

    removeStep() {
        const self = this;
        const selectedStep = self.form.get('wizard.selectedStep').value;
        if ((self.form.get('wizard.steps') as FormArray).controls.length === 0) {
            return;
        }
        self.deleteModal.title = 'Delete step';
        self.deleteModal.message = 'Are you sure you want to delete this step?';
        self.deleteModalTemplateRef = self.commonService.modal(self.deleteModalTemplate);
        self.deleteModalTemplateRef.result.then((close) => {
            if (close) {
                const temp = (self.form.get(['wizard', 'steps', selectedStep]) as FormGroup);
                if (temp) {
                    (temp.get('fields') as FormArray).controls.forEach((control, i) => {
                        self.removeFromUsed((temp.get('fields') as FormArray).at(+i));
                    });
                }
                (self.form.get('wizard.steps') as FormArray).removeAt(selectedStep);
                self.form.get('wizard').markAsDirty();
                self.form.markAsDirty();
                if (selectedStep !== 0) {
                    self.form.get('wizard.selectedStep').patchValue(selectedStep - 1);
                } else {
                    self.form.get('wizard.selectedStep').patchValue(0);
                }
            }
        }, (dismiss) => { });
    }

    removeHook(hookName, idx) {
        const self = this;
        const selectedStep = self.form.get('wizard.selectedStep').value;
        if ((self.form.get('wizard.steps') as FormArray).controls.length === 0) {
            return;
        }
        self.deleteModal.title = 'Delete hook';
        self.deleteModal.message = 'Are you sure you want to delete hook ' + hookName + ' ?';
        const formArr = self.form.get(['wizard', 'steps', selectedStep, 'actions']) as FormArray;

        self.deleteModalTemplateRef = self.commonService.modal(self.deleteModalTemplate);
        self.deleteModalTemplateRef.result.then((close) => {
            if (close) {
                formArr.removeAt(idx);
                self.form.get('wizard').markAsDirty();
            }
        }, (dismiss) => { });
    }

    removeFromStep(index) {
        const self = this;
        const selectedStep = self.form.get('wizard.selectedStep').value;
        const temp = (self.form.get(['wizard', 'steps', selectedStep, 'fields']) as FormArray).at(index);
        self.removeFromUsed(temp);
        (self.form.get(['wizard', 'steps', selectedStep, 'fields']) as FormArray).removeAt(index);
        self.form.get('wizard').markAsDirty();
        self.form.markAsDirty();
        self.remainingFields = self.getRemainingFields();
    }

    removeFromUsed(field) {
        const self = this;
        const i = (self.form.get('wizard.usedFields') as FormArray).controls.findIndex(e => {
            if (e.value.key === field.value.key) {
                return true;
            }
        });
        if (i > -1) {
            (self.form.get('wizard.usedFields') as FormArray).removeAt(i);
        }
    }

    moveUp(index) {
        const self = this;
        if (index === 0) {
            return;
        }
        const temp = self.selectedStepFields.splice(index, 1);
        self.selectedStepFields.splice(index - 1, 0, temp[0]);
    }

    moveDown(index) {
        const self = this;
        if (index === self.selectedStepFields.length - 1) {
            return;
        }
        const temp = self.selectedStepFields.splice(index, 1);
        self.selectedStepFields.splice(index + 1, 0, temp[0]);
    }

    get definitions() {
        const self = this;
        return (self.form.get('definition') as FormArray).controls;
    }

    get steps() {
        const self = this;
        return (self.form.get('wizard.steps') as FormArray).controls;
    }

    get selectedStepFields() {
        const self = this;
        const selectedStep = self.form.get('wizard.selectedStep').value;
        if ((self.form.get('wizard.steps') as FormArray).length > 0 && self.form.get('wizard.selectedStep').value !== null) {
            return (self.form.get(['wizard', 'steps', selectedStep, 'fields']) as FormArray).controls;
        }
        return [];
    }

    getRemainingFields() {
        const self = this;
        let temp = [];
        if ((self.form.get('wizard.usedFields') as FormArray).controls.length === 0) {
            temp = self.definitions.slice();
            self.formArrLen = 0;
        } else {
            self.formArrLen = (self.form.get('wizard.usedFields') as FormArray).controls.length;
            self.definitions.forEach(e => {
                const index = (self.form.get('wizard.usedFields') as FormArray).controls.findIndex(f => f.value.key === e.value.key);
                if (e.get('key').value === '_id') {
                    if (index === -1) {
                        temp.push(self.schemaService.getDefinitionStructure({
                            key: '_id',
                            type: 'id',
                            properties: {
                                name: self.definitions.find(fg => fg.value.key === '_id').value.properties.name
                            }
                        }));
                    }
                } else {
                    if (index === -1) {
                        temp.push(e);
                    }
                }
            });
        }
        return temp;
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

    getSelectedTypeClass(form) {
        const self = this;
        return self.getTypeClass(form.get('type').value);
    }

    getSelectedType(form) {
        const self = this;
        return self.getTypeLabel(form.get('type').value);
    }

    getTypeClass(type) {
        const self = this;
        const temp = self.types.find(e => e.value === type);
        if (temp) {
            return temp.class;
        } else {
            return 'dsi-text';
        }
    }

    getTypeLabel(type) {
        const self = this;
        const temp = self.types.find(e => e.value === type);
        if (temp) {
            return temp.label;
        } else {
            return 'Text';
        }
    }

    getCollectionType(form) {
        const self = this;
        if (form.get(['definition', 0, 'type'])) {
            return self.getTypeLabel(form.get(['definition', 0, 'type']).value);
        }
        return null;
    }

    getCollectionTypeClass(form) {
        const self = this;
        if (form.get(['definition', 0, 'type'])) {
            return self.getTypeClass(form.get(['definition', 0, 'type']).value);
        }
        return null;
    }

    getIdField(form) {
        const self = this;
        if (form && form.get('key')) {
            return Boolean(form.get('key').value === '_id');
        }
        return false;
    }

    showAllStepsDropdown(event) {
        const self = this;
        self.renderer.setStyle(self.allStepsDropdown.nativeElement, 'display', 'block');
        self.allStepsDropdown.nativeElement.focus();

    }

    hideAllStepsDropdown(event) {
        const self = this;
        self.renderer.setStyle(self.allStepsDropdown.nativeElement, 'display', 'none');
    }

    activeUrl(url) {
        const self = this;
        self.verifyUrl.loading = true;
        self.commonService.get('serviceManager', `/${this.commonService.app._id}/service/utils/verifyHook?url=` + url, { filter: { app: this.commonService.app._id } }).subscribe(res => {
            self.verifyUrl.loading = false;
            self.verifyUrl.status = true;
            self.triggeredHookValidation = false;
        }, error => {
            self.verifyUrl.status = false;
            self.verifyUrl.loading = false;
            self.triggeredHookValidation = true;
        });
    }

    addHook() {
        const self = this;
        const selectedStep = self.form.get('wizard.selectedStep').value;
        const step = (self.form.get(['wizard', 'steps', selectedStep]) as FormGroup);
        if (step && !step.value.name) {
            self.ts.warning('Action hook cannot be added to an empty step');
            return;
        }
        self.verifyUrl.status = false;
        self.verifyUrl.loading = false;
        self.triggeredHookValidation = false;
        self.resetHookForm();
        self.expHookModalRef = self.commonService.modal(self.expHookModal,
            { windowClass: 'exp-modal', size: 'lg', centered: true });
        self.expHookModalRef.result.then((close) => {
            if (close && self.actionHookForm.valid) {
                (self.form.get(['wizard', 'steps', selectedStep, 'actions']) as FormArray).push(self.actionHookForm);
                self.form.get('wizard').markAsDirty();
                self.form.markAsDirty();
                self.activeTab = 2;
            } else {
                self.actionHookForm.reset();
            }
        }, dismiss => {
            self.actionHookForm.reset();
        });
    }

    editHook(hook) {
        const self = this;
        const selectedStep = self.form.get('wizard.selectedStep').value;
        self.verifyUrl.status = false;
        self.verifyUrl.loading = false;
        self.triggeredHookValidation = false;
        self.resetHookForm(hook);
        const hId = hook.hookId;
        const actionInStep = self.form.get(['wizard', 'steps', selectedStep, 'actions']).value;
        self.expHookModalRef = self.commonService.modal(self.expHookModal,
            { windowClass: 'exp-modal', size: 'lg', backdrop: 'static', centered: true });
        self.expHookModalRef.result.then((close) => {
            if (close && self.actionHookForm.valid) {
                if (actionInStep.findIndex(e => e.hookId === hId) !== -1) {
                    (self.form.get(['wizard', 'steps', selectedStep, 'actions']) as FormArray)
                        .removeAt(actionInStep.findIndex(e => e.hookId === hId));
                }
                (self.form.get(['wizard', 'steps', selectedStep, 'actions']) as FormArray).push(self.actionHookForm);
                self.form.markAsDirty();
                self.activeTab = 2;
            } else {
                self.resetHookForm();
            }
        }, dismiss => { });
    }

    resetHookForm(hook?) {
        const self = this;
        self.actionHookForm = self.fb.group({
            name: [null, Validators.required],
            url: [null, [Validators.required, Validators.pattern(/^http(s)?:(.*)\/?(.*)/)]],
            errorMessage: [null],
            label: [null],
            type: ['success'],
            hookId: [uuid()]
        });
        if (hook) {
            self.actionHookForm.patchValue(hook);
        }
    }

    isHookAdded(hook) {
        const self = this;
        const hId = hook.hookId;
        const selectedStep = self.form.get('wizard.selectedStep').value;
        const actionInStep = (self.form.get(['wizard', 'steps', selectedStep, 'actions'])).value;
        return actionInStep.findIndex(e => e.hookId === hId) !== -1;
    }

    addHookToStep(hook) {
        const self = this;
        const hId = hook.hookId;
        const selectedStep = self.form.get('wizard.selectedStep').value;
        const actionInStep = (self.form.get(['wizard', 'steps', selectedStep, 'actions'])).value;
        if (actionInStep.findIndex(e => e.hookId === hId) !== -1) {
            self.ts.warning(hook.name + ' is already added in current step');
            return;
        } else {
            self.resetHookForm(hook);
            (self.form.get(['wizard', 'steps', selectedStep, 'actions']) as FormArray).push(self.actionHookForm);
            self.form.get('wizard').markAsDirty();
            self.form.markAsDirty();
            self.activeTab = 2;
            self.ts.success(hook.name + ' is added successfully');
        }

    }

    uniqHookName() {
        const self = this;
        if (self.edit.status) {
            const hookId = self.actionHookForm.get('hookId').value;
            const hookName = self.actionHookForm.get('name').value;
            const hookIndex = self.allActions.findIndex(e => e.name === hookName);
            if (hookIndex >= 0 && hookId != self.allActions[hookIndex].hookId) {
                self.actionHookForm.get('name').setErrors({ duplicateName: true });
            }
        }
    }

    get hookNameErr() {
        const self = this;
        return (self.actionHookForm.get('name').touched || self.actionHookForm.get('name').dirty)
            && ((self.actionHookForm.get('name').hasError('duplicateName')) ||
                self.actionHookForm.get('name').hasError('required'));
    }

    get hookUrlErr() {
        const self = this;
        return (self.actionHookForm.get('url').touched || self.actionHookForm.get('url').dirty) &&
            (self.actionHookForm.get('url').hasError('pattern') || self.actionHookForm.get('url').hasError('required'));
    }

    dragStartEvent(event: DragEvent, element) {
        const self = this;
        event.dataTransfer.effectAllowed = 'copyLink';
        event.dataTransfer.setDragImage(element, 0, 0);
        event.dataTransfer.setData('text', self.index + '');
        self.dragStarted = true;
    }

    dropEvent(event: DragEvent) {
        const self = this;
        this.dragEntered = false;
        const dragIndex = parseInt(event.dataTransfer.getData('text'), 10);
        const dragField = self.selectedStepFields.splice(dragIndex, 1)[0];
        self.selectedStepFields.splice(self.index + 1, 0, dragField);
    }

    dragOverEvent(event: DragEvent) {
        event.preventDefault();
    }

    dragEnterEvent(event: DragEvent) {
        this.dragEntered = true;
    }

    dragLeaveEvent(event: DragEvent) {
        this.dragEntered = false;
    }

    setDragIndex(index) {
        this.index = index;
    }



}
