import { Component, OnInit, Input, ViewChildren, ViewChild, QueryList, OnDestroy, TemplateRef } from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { NgbTooltip, NgbTooltipConfig, NgbModalRef, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/utils/services/common.service';
import * as _ from 'lodash';

import { SchemaValuePipe } from 'src/app/home/schema-utils/schema-value.pipe';
import { AppService } from 'src/app/utils/services/app.service';
import { DeleteModalConfig } from 'src/app/utils/interfaces/schemaBuilder';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';


@Component({
    selector: 'odp-integration',
    templateUrl: './integration.component.html',
    styleUrls: ['./integration.component.scss']
})
export class IntegrationComponent implements OnInit, OnDestroy {

    @ViewChild('deleteModalTemplate', { static: false }) deleteModalTemplate: TemplateRef<HTMLElement>;
    @ViewChild('tooltip', { static: false }) tooltip: NgbTooltip;
    @Input() form: UntypedFormGroup;
    @Input() edit: any;
    deleteModalTemplateRef: NgbModalRef;
    deleteModal: DeleteModalConfig;
    hookForm: UntypedFormGroup;
    previewHookFormat: boolean;
    hooks: {
        hookTitle?: string,
        hookshortName?: string,
        hookType?: string
        hookIndex?: number
        hookPath?: string;
    };
    triggeredHookValidation: boolean;
    verifyUrl: {
        status: boolean;
        loading: boolean;
    };
    htmlContent: string;
    active: number;
    searching: boolean;
    name: string;
    showPreviewWindow: boolean;
    showHookWindow: boolean;
    constructor(
        private commonService: CommonService,
        private fb: UntypedFormBuilder,
        private ngbToolTipConfig: NgbTooltipConfig,
        private appService: AppService) {
        this.deleteModal = {
            title: 'Delete record(s)',
            message: 'Are you sure you want to delete self recordOa(s)?',
            falseButton: 'No',
            trueButton: 'Yes',
            showButtons: true
        };
        this.hookForm = this.fb.group({
            name: [null, Validators.required],
            url: [null, [Validators.required, Validators.pattern(/^http(s)?:(.*)\/?(.*)/)]],
            failMessage: '',
            refId: [null],
            type: ['external', [Validators.required]],
            _func: []
        });
        this.previewHookFormat = false;
        this.hooks = {};
        this.hooks.hookTitle = 'Pre hook';
        this.hooks.hookshortName = 'pre';
        this.hooks.hookType = 'preHook';
        this.hooks.hookPath = 'preHooks';
        this.hooks.hookIndex = -1;
        this.verifyUrl = {
            status: false,
            loading: false
        };
        this.triggeredHookValidation = false;
        this.active = 1;
    }

    ngOnInit() {
        this.ngbToolTipConfig.container = 'body';
        this.hookForm.get('type').valueChanges.subscribe(val => {
            if (val === 'function') {
                this.active = 2;
                this.hookForm.get('url').disable();
                this.hookForm.get('_func').patchValue(this.hookForm.value);
            } else {
                this.active = 1;
                this.hookForm.get('url').enable();
            }
        });
    }

    onTabChange(event) {
        this.hookForm.reset({ type: event == 1 ? 'external' : 'function' });
        if (event == 2) {
            this.hookForm.get('url').disable();
        } else {
            this.hookForm.get('url').enable();
        }
        this.active = event;
    }

    formatter = (result: any) => result.name;

    searchFunction = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.searching = true),
            switchMap(term => {
                return this.commonService.get('partnerManager', `/${this.commonService.app._id}/faas`, {
                    filter: {
                        name: '/' + term + '/',
                        status: 'Active'
                    },
                    count: -1,
                    select: 'name url'
                });
            }),
            tap(() => this.searching = false)
        )

    selectFunction(event) {
        this.hookForm.patchValue(event.item);
        this.hookForm.get('refId').patchValue(event.item._id);
    }

    selectHook(hookName) {
        this.hooks.hookType = hookName;
        if (this.hooks.hookType == 'preHook') {
            this.hooks.hookTitle = 'Pre hook';
            this.hooks.hookshortName = 'pre';
            this.hooks.hookPath = 'preHooks';
        } else if (this.hooks.hookType == 'postHook') {
            this.hooks.hookTitle = 'Post hook';
            this.hooks.hookshortName = 'post';
            this.hooks.hookPath = 'webHooks';
        } else if (this.hooks.hookType == 'submitHook') {
            this.hooks.hookTitle = 'Submit hook';
            this.hooks.hookshortName = 'submit';
            this.hooks.hookPath = 'workflowHooks.postHooks.submit';
        } else if (this.hooks.hookType == 'approveHook') {
            this.hooks.hookTitle = 'Approve hook';
            this.hooks.hookshortName = 'approve';
            this.hooks.hookPath = 'workflowHooks.postHooks.approve';
        } else if (this.hooks.hookType == 'rejectHook') {
            this.hooks.hookTitle = 'Reject hook';
            this.hooks.hookshortName = 'reject';
            this.hooks.hookPath = 'workflowHooks.postHooks.reject';
        } else if (this.hooks.hookType == 'reviewHook') {
            this.hooks.hookTitle = 'Rework hook';
            this.hooks.hookshortName = 'rework';
            this.hooks.hookPath = 'workflowHooks.postHooks.rework';
        } else if (this.hooks.hookType == 'discardHook') {
            this.hooks.hookTitle = 'Discard hook';
            this.hooks.hookshortName = 'discard';
            this.hooks.hookPath = 'workflowHooks.postHooks.discard';
        }
        this.previewHookFormat = false;
    }

    get hookErr() {
        return this.hookForm.get('name').dirty && this.hookForm.get('name') && this.hookForm.hasError('duplicateName');
    }

    get hookUrlErr() {
        return this.hookForm.get('url').dirty && this.hookForm.get('url') && this.hookForm.get('url').hasError('pattern');
    }

    newHook(index?: number) {
        if (index > -1) {
            this.hooks.hookIndex = index;
            this.hookForm.patchValue(this.hookList[index]);
        } else {
            this.hooks.hookIndex = -1;
        }
        this.verifyUrl.status = false;
        this.verifyUrl.loading = false;
        this.previewHookFormat = false;
        this.triggeredHookValidation = false;
        this.showHookWindow = true;
    }

    triggerHookSave() {
        if (this.hookForm.valid) {
            this.verifyUrl.status = false;
            let hooks;
            this.form.get(this.hooks.hookPath).markAsTouched();
            this.form.get(this.hooks.hookPath).markAsDirty();
            hooks = this.form.get(this.hooks.hookPath).value;
            if (!hooks) {
                hooks = [];
            }
            const temp = this.hookForm.getRawValue();
            delete temp._func;
            if (this.hooks.hookIndex > -1) {
                hooks.splice(this.hooks.hookIndex, 1, temp);
            } else {
                hooks.push(temp);
            }
            this.form.get(this.hooks.hookPath).patchValue(hooks);
            this.form.get(this.hooks.hookPath).markAsTouched();
            this.form.get(this.hooks.hookPath).markAsDirty();
            this.form.get(this.hooks.hookPath).updateValueAndValidity();
            this.hooks.hookIndex = -1;
        }
        this.cancelHookSave();
    }

    cancelHookSave() {
        this.hookForm.reset({ type: 'external' });
        this.active = 1;
        this.showHookWindow = false;
    }

    previewHook() {
        this.prettyPrint();
        this.showPreviewWindow = true;
    }

    changesDone() {
        if (!this.form || !this.hooks) {
            return false;
        }
        const changeInPreHooks = (this.form.get('preHooks') && this.form.get('preHooks').touched && this.form.get('preHooks').dirty);
        const changeInPostHooks = (this.form.get('postHooks') && this.form.get('postHooks').touched && this.form.get('postHooks').dirty);
        const changeInWfHooks = (this.form.get('workflowHooks.postHooks')
            && this.form.get('workflowHooks.postHooks').touched
            && this.form.get('workflowHooks.postHooks').dirty);
        return changeInPreHooks || changeInPostHooks || changeInWfHooks;
    }

    invalidForm() {
        if (!this.form || !this.hooks) {
            return false;
        }
        const errorInPreHooks = (this.form.get('preHooks') && this.form.get('preHooks').invalid);
        const errorInPostHooks = (this.form.get('postHooks') && this.form.get('postHooks').invalid);
        const errorInWfHooks = (this.form.get('workflowHooks.postHooks') && this.form.get('workflowHooks.postHooks').invalid);
        return errorInPreHooks || errorInPostHooks || errorInWfHooks;
    }


    uniqueHook() {
        let duplicateHookName;
        if (this.hooks.hookIndex > -1) {
            const tempValue = this.appService.cloneObject(this.form.get(this.hooks.hookPath).value);
            tempValue.splice(this.hooks.hookIndex, 1);
            duplicateHookName = tempValue.find(e => e.name === this.hookForm.get('name').value);
        } else {
            duplicateHookName = this.form.get(this.hooks.hookPath).value.find(e => e.name === this.hookForm.get('name').value);
        }
        if (duplicateHookName) {
            this.hookForm.setErrors({
                duplicateName: true
            });
        } else if (!duplicateHookName) {
            this.hookForm.setErrors(null);
        }
    }

    removeHook(index: number) {
        let hooks;
        hooks = this.form.get(this.hooks.hookPath).value;
        if (!hooks) {
            hooks = [];
        }
        const temp = (this.form.get(this.hooks.hookPath).value);
        this.deleteModal.title = 'Delete ' + temp[index].name;
        this.deleteModal.message = 'Are you sure you want to delete ' + temp[index].name + '?';
        this.deleteModal.showButtons = true;
        this.deleteModalTemplateRef = this.commonService.modal(this.deleteModalTemplate);
        this.deleteModalTemplateRef.result.then(close => {
            if (close) {
                temp.splice(index, 1);
                this.form.get(this.hooks.hookPath).patchValue(temp);
                this.form.get(this.hooks.hookPath).markAsTouched();
                this.form.get(this.hooks.hookPath).markAsDirty();
                this.form.markAsDirty();
            }
        }, dismiss => { });
    }

    activeUrl(url) {
        this.verifyUrl.loading = true;
        this.commonService.get('serviceManager', `/${this.commonService.app._id}/service/utils/verifyHook?url=` + url, { filter: { app: this.commonService.app._id } }).subscribe(res => {
            this.verifyUrl.loading = false;
            this.verifyUrl.status = true;
            this.triggeredHookValidation = false;
        }, error => {
            this.verifyUrl.status = false;
            this.verifyUrl.loading = false;
            this.triggeredHookValidation = true;
        });
    }

    closeTooltip() {
        if (this.tooltip && this.tooltip.isOpen) {
            this.tooltip.close();
        }
    }

    prettyPrint() {
        const jsonStructure = {
            operation: 'POST'
        };
        if (this.hooks.hookType == 'postHook') {
            jsonStructure['data'] = {};
            jsonStructure['data']['old'] = new SchemaValuePipe().transform(this.form.getRawValue().definition);
            jsonStructure['data']['new'] = new SchemaValuePipe().transform(this.form.getRawValue().definition);
            this.htmlContent = JSON.stringify(jsonStructure, null, 4);
        } else {
            jsonStructure['data'] = new SchemaValuePipe().transform(this.form.getRawValue().definition);
            this.htmlContent = JSON.stringify(jsonStructure, null, 4);
        }
    }

    copyFormat() {
        const copyText = document.getElementById('hookFormat') as HTMLInputElement;
        const textArea = document.createElement('textarea');
        textArea.textContent = JSON.stringify(JSON.parse(copyText.innerText), null, 4);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        setTimeout(() => {
            this.tooltip.close();
        }, 1500);
    }

    ngOnDestroy() {
        if (this.deleteModalTemplateRef) {
            this.deleteModalTemplateRef.close();
        }
    }

    hasPermission(type: string, entity?: string) {
        return this.commonService.hasPermission(type, entity);
    }

    hasPermissionStartsWith(type: string, entity?: string) {
        return this.commonService.hasPermissionStartsWith(type, entity);
    }

    canEdit() {
        if (this.hasPermission('PMDSI', 'SM')) {
            return true;
        }
        return false;
    }

    canView() {
        if (this.hasPermission('PMDSI', 'SM') || this.hasPermission('PVDSI', 'SM')) {
            return true;
        }
        return false;
    }

    get isSchemaFree() {
        const self = this;
        if (self.form && self.form.get('schemaFree')) {
            return self.form.get('schemaFree').value;
        }
        return false;
    }

    get id() {
        return this.edit._id;
    }

    get hookList() {
        if (this.hooks.hookType == 'preHook') {
            return this.preHook;
        } else if (this.hooks.hookType == 'postHook') {
            return this.postHooks;
        } else if (this.hooks.hookType == 'submitHook') {
            return this.submitHooks;
        } else if (this.hooks.hookType == 'approveHook') {
            return this.approveHooks;
        } else if (this.hooks.hookType == 'rejectHook') {
            return this.rejectHooks;
        } else if (this.hooks.hookType == 'reviewHook') {
            return this.reviewHooks;
        } else if (this.hooks.hookType == 'discardHook') {
            return this.discardHooks;
        } else {
            return [];
        }
    }

    get postHooks() {
        if (this.form.get('webHooks')) {
            return (this.form.get('webHooks').value) || [];
        }
        return [];
    }

    get preHook() {
        if (this.form.get('preHooks')) {
            return (this.form.get('preHooks').value);
        }
        return [];
    }

    get approveHooks() {
        if (this.form.get('workflowHooks.postHooks.approve')) {
            return (this.form.get('workflowHooks.postHooks.approve').value);
        }
        return [];
    }

    get rejectHooks() {
        if (this.form.get('workflowHooks.postHooks.reject')) {
            return (this.form.get('workflowHooks.postHooks.reject').value);
        }
        return [];
    }

    get reviewHooks() {
        if (this.form.get('workflowHooks.postHooks.rework')) {
            return (this.form.get('workflowHooks.postHooks.rework').value);
        }
        return [];
    }

    get discardHooks() {
        if (this.form.get('workflowHooks.postHooks.discard')) {
            return (this.form.get('workflowHooks.postHooks.discard').value);
        }
        return [];
    }

    get submitHooks() {
        if (this.form.get('workflowHooks.postHooks.submit')) {
            return (this.form.get('workflowHooks.postHooks.submit').value);
        }
        return [];
    }
    get editable() {
        if (this.edit && this.edit.status) {
            return true;
        }
        return false;
    }
}
