import { Component, OnInit, Input, ViewChildren, ViewChild, QueryList, OnDestroy, TemplateRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
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
    @ViewChild('hookModalTemplate', { static: false }) hookModalTemplate: TemplateRef<HTMLElement>;
    @ViewChild('hookPreviewTemplate', { static: false }) hookPreviewTemplate: TemplateRef<HTMLElement>;
    @ViewChild('tooltip', { static: false }) tooltip: NgbTooltip;
    @Input() form: FormGroup;
    @Input() edit: any;
    hookModalTemplateRef: NgbModalRef;
    hookPreviewTemplateRef: NgbModalRef;
    deleteModalTemplateRef: NgbModalRef;
    deleteModal: DeleteModalConfig;
    hookForm: FormGroup;
    previewHookFormat: boolean;
    hooks: {
        preHook?: boolean,
        postHook?: boolean,
        approveHook?: boolean,
        rejectHook?: boolean,
        sendForReviewHook?: boolean,
        discardHook?: boolean,
        submitHook?: boolean,
        hookTitle?: string,
        hookshortName?: string,
        hookType?: string
    };
    editIndex = -1;
    triggeredHookValidation: boolean;
    verifyUrl: {
        status: boolean;
        loading: boolean;
    };
    htmlContent: string;
    active: number;
    searching: boolean;
    name: string;
    constructor(
        private commonService: CommonService,
        private fb: FormBuilder,
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
        this.hooks = {};
        this.hooks.preHook = true;
        this.hooks.postHook = false;
        this.previewHookFormat = false;
        this.hooks.approveHook = false;
        this.hooks.rejectHook = false;
        this.hooks.sendForReviewHook = false;
        this.hooks.discardHook = false;
        this.hooks.submitHook = false;
        this.hooks.hookTitle = 'Pre hook';
        this.hooks.hookshortName = 'pre';
        this.hooks.hookType = 'preHooks';
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
        this.hookForm.reset({ type: event === 1 ? 'external' : 'function' });
        if (event === 2) {
            this.hookForm.get('url').disable();
        } else {
            this.hookForm.get('url').enable();
        }
    }

    formatter = (result: any) => result.name;

    searchFunction = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.searching = true),
            switchMap(term => {
                return this.commonService.get('partnerManager', '/faas', {
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
        Object.keys(this.hooks).forEach(e => {
            if (e === hookName) {
                this.hooks[e] = true;
            } else {
                this.hooks[e] = false;
            }
        });
        if (this.hooks.preHook) {
            this.hooks.hookTitle = 'Pre hook';
            this.hooks.hookshortName = 'pre';
            this.hooks.hookType = 'preHooks';
        } else if (this.hooks.postHook) {
            this.hooks.hookTitle = 'Post hook';
            this.hooks.hookshortName = 'post';
            this.hooks.hookType = 'webHooks';
        } else if (this.hooks.approveHook) {
            this.hooks.hookTitle = 'Approve hook';
            this.hooks.hookshortName = 'approve';
            this.hooks.hookType = 'approve';
        } else if (this.hooks.rejectHook) {
            this.hooks.hookTitle = 'Reject hook';
            this.hooks.hookshortName = 'reject';
            this.hooks.hookType = 'reject';
        } else if (this.hooks.sendForReviewHook) {
            this.hooks.hookTitle = 'Rework hook';
            this.hooks.hookshortName = 'rework';
            this.hooks.hookType = 'rework';
        } else if (this.hooks.discardHook) {
            this.hooks.hookTitle = 'Discard hook';
            this.hooks.hookshortName = 'discard';
            this.hooks.hookType = 'discard';
        } else if (this.hooks.submitHook) {
            this.hooks.hookTitle = 'Submit hook';
            this.hooks.hookshortName = 'submit';
            this.hooks.hookType = 'submit';
        }
        this.previewHookFormat = false;
    }

    get hookErr() {
        return this.hookForm.get('name').dirty && this.hookForm.get('name') && this.hookForm.hasError('duplicateName');
    }

    get hookUrlErr() {
        return this.hookForm.get('url').dirty && this.hookForm.get('url') && this.hookForm.get('url').hasError('pattern');
    }

    newHook(index?) {
        if (index > -1) {
            this.editIndex = index;
        }
        this.verifyUrl.status = false;
        this.verifyUrl.loading = false;
        this.previewHookFormat = false;
        this.triggeredHookValidation = false;
        if (this.hooks.preHook && index !== undefined) {
            this.hooks.postHook = false;
            this.hookForm.patchValue(this.form.get('preHooks').value[index]);
        } else if (this.hooks.postHook && index !== undefined) {
            this.hooks.preHook = false;
            this.hookForm.patchValue(this.form.get('webHooks').value[index]);
        } else if (this.hooks.approveHook && index !== undefined) {
            this.hooks.preHook = false;
            this.hookForm.patchValue(this.form.get('workflowHooks.postHooks.approve').value[index]);
        } else if (this.hooks.rejectHook && index !== undefined) {
            this.hooks.preHook = false;
            this.hooks.hookType = 'reject';
            this.hookForm.patchValue(this.form.get('workflowHooks.postHooks.reject').value[index]);
        } else if (this.hooks.sendForReviewHook && index !== undefined) {
            this.hooks.preHook = false;
            this.hookForm.patchValue(this.form.get('workflowHooks.postHooks.rework').value[index]);
        } else if (this.hooks.discardHook && index !== undefined) {
            this.hooks.preHook = false;
            this.hookForm.patchValue(this.form.get('workflowHooks.postHooks.discard').value[index]);
        } else if (this.hooks.submitHook && index !== undefined) {
            this.hooks.preHook = false;
            this.hookForm.patchValue(this.form.get('workflowHooks.postHooks.submit').value[index]);
        }

        this.hookModalTemplateRef = this.commonService.modal(this.hookModalTemplate, { windowClass: 'preHook-modal' });
        this.hookModalTemplateRef.result.then((close) => {
            if (close && this.hookForm.valid) {
                let hookpath;
                if (this.hooks.preHook || this.hooks.postHook) {
                    hookpath = this.hooks.hookType;
                } else {
                    hookpath = 'workflowHooks.' + 'postHooks.' + this.hooks.hookType;
                }
                if (index || index === 0) {
                    (this.form.get(hookpath).value).splice(index, 1);
                }
                this.addHook();

            } else {
                this.hookForm.reset({ type: 'external' });
                this.active = 1;
            }
            this.editIndex = -1;
        }, dismiss => {
            this.hookForm.reset({ type: 'external' });
            this.active = 1;
            this.editIndex = -1;
        });
    }

    previewHook() {
        this.prettyPrint();
        this.hookPreviewTemplateRef = this.commonService.modal(this.hookPreviewTemplate, { windowClass: 'preHook-preview-modal' });
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

    addHook() {
        this.verifyUrl.status = false;
        let hooks;
        let hookpath;
        if (this.hooks.preHook || this.hooks.postHook) {
            hookpath = this.hooks.hookType;
        } else {
            hookpath = 'workflowHooks.postHooks.' + this.hooks.hookType;
            this.form.get('workflowHooks.postHooks').markAsTouched();
            this.form.get('workflowHooks.postHooks').markAsDirty();
        }
        hooks = this.form.get(hookpath).value;
        if (!hooks) {
            hooks = [];
        }
        const temp = this.hookForm.getRawValue();
        delete temp._func;
        hooks.push(temp);
        this.form.get(hookpath).patchValue(hooks);
        this.form.get(hookpath).markAsTouched();
        this.form.get(hookpath).markAsDirty();
        this.form.get(hookpath).updateValueAndValidity();
        this.editIndex = -1;
        this.hookForm.reset({ type: 'external' });
        this.active = 1;
    }


    uniqueHook() {
        if (this.hooks.preHook || this.hooks.postHook) {
            let hookpath;
            let duplicateHookName;
            if (this.hooks.preHook || this.hooks.postHook) {
                hookpath = this.hooks.hookType;
            } else {
                hookpath = 'workflowHooks.' + 'postHooks.' + this.hooks.hookType;
            }
            if (this.editIndex > -1) {
                const tempValue = this.appService.cloneObject(this.form.get(hookpath).value);
                tempValue.splice(this.editIndex, 1);
                duplicateHookName = tempValue.find(e => e.name === this.hookForm.get('name').value);
            } else {
                duplicateHookName = this.form.get(hookpath).value.find(e => e.name === this.hookForm.get('name').value);
            }
            if (duplicateHookName) {
                this.hookForm.setErrors({
                    duplicateName: true
                });
            } else if (!duplicateHookName) {
                this.hookForm.setErrors(null);
            }
        }
    }

    removeHook(index) {
        let hooks;
        let hookpath;
        if (this.hooks.preHook || this.hooks.postHook) {
            hookpath = this.hooks.hookType;
        } else {
            hookpath = 'workflowHooks.' + 'postHooks.' + this.hooks.hookType;
        }
        hooks = this.form.get(hookpath).value;
        if (!hooks) {
            hooks = [];
        }
        const temp = (this.form.get(hookpath).value);
        this.deleteModal.title = 'Delete ' + temp[index].name;
        this.deleteModal.message = 'Are you sure you want to delete ' + temp[index].name + '?';
        this.deleteModal.showButtons = true;
        this.deleteModalTemplateRef = this.commonService.modal(this.deleteModalTemplate);
        this.deleteModalTemplateRef.result.then(close => {
            if (close) {
                if (this.hooks.postHook || this.hooks.preHook) {
                    (this.form.get(this.hooks.hookType).value).splice(index, 1);
                    this.form.get(this.hooks.hookType).markAsTouched();
                    this.form.get(this.hooks.hookType).markAsDirty();
                } else {
                    (this.form.get(['workflowHooks', 'postHooks', this.hooks.hookType]).value).splice(index, 1);
                    this.form.get(['workflowHooks', 'postHooks', this.hooks.hookType]).markAsTouched();
                    this.form.get(['workflowHooks', 'postHooks', this.hooks.hookType]).markAsDirty();
                }
                this.form.markAsDirty();
            }
        }, dismiss => { });
    }

    activeUrl(url) {
        this.verifyUrl.loading = true;
        this.commonService.get('serviceManager', '/service/verifyHook?url=' + url, null).subscribe(res => {
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
        if (this.hooks.postHook) {
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
        if (this.hookModalTemplateRef) {
            this.hookModalTemplateRef.close();
        }
        if (this.hookPreviewTemplateRef) {
            this.hookPreviewTemplateRef.close();
        }

    }

    hasPermission(type: string, entity?: string) {
        return this.commonService.hasPermission(type, entity);
    }

    hasPermissionStartsWith(type: string, entity?: string) {
        return this.commonService.hasPermissionStartsWith(type, entity);
    }

    canEdit(type: string) {
        if (this.hasPermission('PMDSI' + type, 'SM') || this.hasPermission('PMDSI' + type, 'SM_' + this.id)) {
            return true;
        }
        return false;
    }

    canView(type: string) {
        if (this.hasPermission('PMDSI' + type, 'SM') || this.hasPermission('PMDSI' + type, 'SM_' + this.id)
            || this.hasPermission('PVDSI' + type, 'SM') || this.hasPermission('PVDSI' + type, 'SM_' + this.id)) {
            return true;
        }
        return false;
    }

    get id() {
        return this.edit._id;
    }

    get webHooks() {
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

    get sendForReviewHooks() {
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
