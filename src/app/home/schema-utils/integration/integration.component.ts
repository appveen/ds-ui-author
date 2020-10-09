import { Component, OnInit, Input, ViewChildren, ViewChild, QueryList, OnDestroy, TemplateRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NgbTooltip, NgbTooltipConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/utils/services/common.service';
import * as _ from 'lodash';

import { SchemaValuePipe } from 'src/app/home/schema-utils/schema-value.pipe';
import { AppService } from 'src/app/utils/services/app.service';
import { DeleteModalConfig } from 'src/app/utils/interfaces/schemaBuilder';


@Component({
    selector: 'odp-integration',
    templateUrl: './integration.component.html',
    styleUrls: ['./integration.component.scss']
})
export class IntegrationComponent implements OnInit, OnDestroy {

    @ViewChild('deleteModalTemplate', { static: false }) deleteModalTemplate: TemplateRef<HTMLElement>;
    @ViewChild('hookModalTemplate', { static: false }) hookModalTemplate: TemplateRef<HTMLElement>;
    @ViewChild('tooltip', { static: false }) tooltip: NgbTooltip;
    @Input() form: FormGroup;
    @Input() edit: any;
    hookModalTemplateRef: NgbModalRef;
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

    constructor(
        private commonService: CommonService,
        private fb: FormBuilder,
        private ngbToolTipConfig: NgbTooltipConfig,
        private appService: AppService) {
        const self = this;
        self.deleteModal = {
            title: 'Delete record(s)',
            message: 'Are you sure you want to delete self recordOa(s)?',
            falseButton: 'No',
            trueButton: 'Yes',
            showButtons: true
        };
        self.hookForm = self.fb.group({
            name: [null, Validators.required],
            url: [null, [Validators.required, Validators.pattern(/^http(s)?:(.*)\/?(.*)/)]],
            failMessage: ''
        });
        self.hooks = {};
        self.hooks.preHook = true;
        self.hooks.postHook = false;
        self.previewHookFormat = false;
        self.hooks.approveHook = false;
        self.hooks.rejectHook = false;
        self.hooks.sendForReviewHook = false;
        self.hooks.discardHook = false;
        self.hooks.submitHook = false;
        self.hooks.hookTitle = 'Pre hook';
        self.hooks.hookshortName = 'pre';
        self.hooks.hookType = 'preHooks';
        self.verifyUrl = {
            status: false,
            loading: false
        };
        self.triggeredHookValidation = false;
    }

    ngOnInit() {
        const self = this;
        self.ngbToolTipConfig.container = 'body';
    }

    selectHook(hookName) {
        const self = this;
        Object.keys(self.hooks).forEach(e => {
            if (e === hookName) {
                self.hooks[e] = true;
            } else {
                self.hooks[e] = false;
            }
        });
        if (self.hooks.preHook) {
            self.hooks.hookTitle = 'Pre hook';
            self.hooks.hookshortName = 'pre';
            self.hooks.hookType = 'preHooks';
        } else if (self.hooks.postHook) {
            self.hooks.hookTitle = 'Post hook';
            self.hooks.hookshortName = 'post';
            self.hooks.hookType = 'webHooks';
        } else if (self.hooks.approveHook) {
            self.hooks.hookTitle = 'Approve hook';
            self.hooks.hookshortName = 'approve';
            self.hooks.hookType = 'approve';
        } else if (self.hooks.rejectHook) {
            self.hooks.hookTitle = 'Reject hook';
            self.hooks.hookshortName = 'reject';
            self.hooks.hookType = 'reject';
        } else if (self.hooks.sendForReviewHook) {
            self.hooks.hookTitle = 'Send for Review hook';
            self.hooks.hookshortName = 'Send for Review';
            self.hooks.hookType = 'rework';
        } else if (self.hooks.discardHook) {
            self.hooks.hookTitle = 'Discard hook';
            self.hooks.hookshortName = 'discard';
            self.hooks.hookType = 'discard';
        } else if (self.hooks.submitHook) {
            self.hooks.hookTitle = 'Submit hook';
            self.hooks.hookshortName = 'submit';
            self.hooks.hookType = 'submit';
        }
        self.previewHookFormat = false;
    }

    get hookErr() {
        const self = this;
        return self.hookForm.get('name').dirty && self.hookForm.get('name') && self.hookForm.hasError('duplicateName');
    }

    get hookUrlErr() {
        const self = this;
        return self.hookForm.get('url').dirty && self.hookForm.get('url') && self.hookForm.get('url').hasError('pattern');
    }

    newHook(index?) {
        const self = this;
        if (index > -1) {
            self.editIndex = index;
        }
        self.verifyUrl.status = false;
        self.verifyUrl.loading = false;
        self.previewHookFormat = false;
        self.triggeredHookValidation = false;
        if (self.hooks.preHook && index !== undefined) {
            self.hooks.postHook = false;
            self.hookForm.patchValue(self.form.get('preHooks').value[index]);
        } else if (self.hooks.postHook && index !== undefined) {
            self.hooks.preHook = false;
            self.hookForm.patchValue(self.form.get('webHooks').value[index]);
        } else if (self.hooks.approveHook && index !== undefined) {
            self.hooks.preHook = false;
            self.hookForm.patchValue(self.form.get('workflowHooks.postHooks.approve').value[index]);
        } else if (self.hooks.rejectHook && index !== undefined) {
            self.hooks.preHook = false;
            self.hooks.hookType = 'reject';
            self.hookForm.patchValue(self.form.get('workflowHooks.postHooks.reject').value[index]);
        } else if (self.hooks.sendForReviewHook && index !== undefined) {
            self.hooks.preHook = false;
            self.hookForm.patchValue(self.form.get('workflowHooks.postHooks.rework').value[index]);
        } else if (self.hooks.discardHook && index !== undefined) {
            self.hooks.preHook = false;
            self.hookForm.patchValue(self.form.get('workflowHooks.postHooks.discard').value[index]);
        } else if (self.hooks.submitHook && index !== undefined) {
            self.hooks.preHook = false;
            self.hookForm.patchValue(self.form.get('workflowHooks.postHooks.submit').value[index]);
        }

        self.hookModalTemplateRef = self.commonService.modal(self.hookModalTemplate, { windowClass: 'preHook-modal' });
        self.hookModalTemplateRef.result.then((close) => {
            if (close && self.hookForm.valid) {
                let hookpath;
                if (self.hooks.preHook || self.hooks.postHook) {
                    hookpath = self.hooks.hookType;
                } else {
                    hookpath = 'workflowHooks.' + 'postHooks.' + self.hooks.hookType;
                }
                if (index || index === 0) {
                    (self.form.get(hookpath).value).splice(index, 1);
                }
                self.addHook();
            } else {
                self.hookForm.reset();
            }
        }, dismiss => {
            self.hookForm.reset();
        });
    }

    changesDone() {
        const self = this;
        return self.hookForm.touched && self.hookForm.dirty;
    }

    invalidForm() {
        const self = this;
        return self.hookForm.invalid;
    }

    addHook() {
        const self = this;
        self.verifyUrl.status = false;
        let hooks;
        let hookpath;
        if (self.hooks.preHook || self.hooks.postHook) {
            hookpath = self.hooks.hookType;
        } else {
            hookpath = 'workflowHooks.' + 'postHooks.' + self.hooks.hookType;
        }
        hooks = self.form.get(hookpath).value;
        if (!hooks) {
            hooks = [];
        }
        hooks.push(self.hookForm.value);
        self.form.get(hookpath).patchValue(hooks);
        self.editIndex = -1;
        self.hookForm.reset();
        self.form.markAsDirty();
    }


    uniqueHook() {
        const self = this;
        if (self.hooks.preHook || self.hooks.postHook) {
            let hookpath;
            let duplicateHookName;
            if (self.hooks.preHook || self.hooks.postHook) {
                hookpath = self.hooks.hookType;
            } else {
                hookpath = 'workflowHooks.' + 'postHooks.' + self.hooks.hookType;
            }
            if (self.editIndex > -1) {
                const tempValue = self.appService.cloneObject(self.form.get(hookpath).value);
                tempValue.splice(self.editIndex, 1);
                duplicateHookName = tempValue.find(e => e.name === self.hookForm.get('name').value);
            } else {
                duplicateHookName = self.form.get(hookpath).value.find(e => e.name === self.hookForm.get('name').value);
            }
            if (duplicateHookName) {
                self.hookForm.setErrors({
                    duplicateName: true
                });
            } else if (!duplicateHookName) {
                self.hookForm.setErrors(null);
            }
        }
    }

    removeHook(index) {
        const self = this;
        let hooks;
        let hookpath;
        if (self.hooks.preHook || self.hooks.postHook) {
            hookpath = self.hooks.hookType;
        } else {
            hookpath = 'workflowHooks.' + 'postHooks.' + self.hooks.hookType;
        }
        hooks = self.form.get(hookpath).value;
        if (!hooks) {
            hooks = [];
        }
        const temp = (self.form.get(hookpath).value);
        self.deleteModal.title = 'Delete ' + temp[index].name;
        self.deleteModal.message = 'Are you sure you want to delete ' + temp[index].name + '?';
        self.deleteModal.showButtons = true;
        self.deleteModalTemplateRef = self.commonService.modal(self.deleteModalTemplate);
        self.deleteModalTemplateRef.result.then(close => {
            if (close) {
                if (self.hooks.postHook || self.hooks.preHook) {
                    (self.form.get(self.hooks.hookType).value).splice(index, 1);
                } else {
                    (self.form.get(['workflowHooks', 'postHooks', self.hooks.hookType]).value).splice(index, 1);
                }
                self.form.markAsDirty();
            }
        }, dismiss => { });
    }

    activeUrl(url) {
        const self = this;
        self.verifyUrl.loading = true;
        self.commonService.get('serviceManager', '/service/verifyHook?url=' + url, null).subscribe(res => {
            self.verifyUrl.loading = false;
            self.verifyUrl.status = true;
            self.triggeredHookValidation = false;
        }, error => {
            self.verifyUrl.status = false;
            self.verifyUrl.loading = false;
            self.triggeredHookValidation = true;
        });
    }

    closeTooltip() {
        const self = this;
        if (self.tooltip && self.tooltip.isOpen) {
            self.tooltip.close();
        }
    }

    prettyPrint() {
        const self = this;
        const jsonStructure = {
            operation: 'POST'
        };
        if (self.hooks.postHook) {
            jsonStructure['data'] = {};
            jsonStructure['data']['old'] = new SchemaValuePipe().transform(self.form.getRawValue().definition);
            jsonStructure['data']['new'] = new SchemaValuePipe().transform(self.form.getRawValue().definition);
            self.htmlContent = JSON.stringify(jsonStructure, null, 4);
        } else {
            jsonStructure['data'] = new SchemaValuePipe().transform(self.form.getRawValue().definition);
            self.htmlContent = JSON.stringify(jsonStructure, null, 4);
        }
    }

    copyFormat(tooltip) {
        const self = this;
        const copyText = document.getElementById('hookFormat') as HTMLInputElement;
        const textArea = document.createElement('textarea');
        textArea.textContent = JSON.stringify(JSON.parse(copyText.innerText), null, 4);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        setTimeout(() => {
            tooltip.close();
        }, 1500);
    }

    ngOnDestroy() {
        const self = this;
        if (self.deleteModalTemplateRef) {
            self.deleteModalTemplateRef.close();
        }
        if (self.hookModalTemplateRef) {
            self.hookModalTemplateRef.close();
        }
    }

    hasPermission(type: string, entity?: string) {
        const self = this;
        return self.commonService.hasPermission(type, entity);
    }

    hasPermissionStartsWith(type: string, entity?: string) {
        const self = this;
        return self.commonService.hasPermissionStartsWith(type, entity);
    }

    canEdit(type: string) {
        const self = this;
        if (self.hasPermission('PMDSI' + type, 'SM') || self.hasPermission('PMDSI' + type, 'SM_' + self.id)) {
            return true;
        }
        return false;
    }

    canView(type: string) {
        const self = this;
        if (self.hasPermission('PMDSI' + type, 'SM') || self.hasPermission('PMDSI' + type, 'SM_' + self.id)
            || self.hasPermission('PVDSI' + type, 'SM') || self.hasPermission('PVDSI' + type, 'SM_' + self.id)) {
            return true;
        }
        return false;
    }

    get id() {
        const self = this;
        return self.edit._id;
    }

    get webHooks() {
        const self = this;
        if (self.form.get('webHooks')) {
            return (self.form.get('webHooks').value) || [];
        }
        return [];
    }

    get preHook() {
        const self = this;
        if (self.form.get('preHooks')) {
            return (self.form.get('preHooks').value);
        }
        return [];
    }

    get approveHooks() {
        const self = this;
        if (self.form.get('workflowHooks.postHooks.approve')) {
            return (self.form.get('workflowHooks.postHooks.approve').value);
        }
        return [];
    }

    get rejectHooks() {
        const self = this;
        if (self.form.get('workflowHooks.postHooks.reject')) {
            return (self.form.get('workflowHooks.postHooks.reject').value);
        }
        return [];
    }

    get sendForReviewHooks() {
        const self = this;
        if (self.form.get('workflowHooks.postHooks.rework')) {
            return (self.form.get('workflowHooks.postHooks.rework').value);
        }
        return [];
    }

    get discardHooks() {
        const self = this;
        if (self.form.get('workflowHooks.postHooks.discard')) {
            return (self.form.get('workflowHooks.postHooks.discard').value);
        }
        return [];
    }

    get submitHooks() {
        const self = this;
        if (self.form.get('workflowHooks.postHooks.submit')) {
            return (self.form.get('workflowHooks.postHooks.submit').value);
        }
        return [];
    }
}
