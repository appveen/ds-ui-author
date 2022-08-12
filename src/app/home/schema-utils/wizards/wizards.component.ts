import { Component, OnInit, Input, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormArray, Validators, FormBuilder } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { CommonService } from 'src/app/utils/services/common.service';
import { maxLenValidator } from 'src/app/home/custom-validators/min-max-validator';
import { DeleteModalConfig } from 'src/app/utils/interfaces/schemaBuilder';

@Component({
    selector: 'odp-wizards',
    templateUrl: './wizards.component.html',
    styleUrls: ['./wizards.component.scss']
})
export class WizardsComponent implements OnInit, OnDestroy {


    @ViewChild('deleteModalTemplate', { static: false }) deleteModalTemplate: TemplateRef<HTMLElement>;
    @Input() form: FormGroup;
    @Input() edit: any;
    deleteModalTemplateRef: NgbModalRef;
    deleteModal: DeleteModalConfig;
    subscriptions: any;
    activeTab: number;
    showStepsWindow: boolean;
    constructor(
        private commonService: CommonService,
        private fb: FormBuilder) {
        this.subscriptions = {};
        this.activeTab = 1;
        this.deleteModal = {
            title: 'Delete record(s)',
            message: 'Are you sure you want to delete record(s)?',
            falseButton: 'No',
            trueButton: 'Yes',
            showButtons: true
        };
        this.showStepsWindow = false;
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        Object.keys(this.subscriptions).forEach(key => {
            this.subscriptions[key].unsubscribe();
        });
        if (this.deleteModalTemplateRef) {
            this.deleteModalTemplateRef.close();
        }
    }

    addStep() {
        this.showStepsWindow = true;
        const i = (this.form.get('wizard.steps') as FormArray).controls.length - 1;
        (this.form.get('wizard.steps') as FormArray).insert(i + 1, this.fb.group({
            name: [null, [Validators.required, maxLenValidator(40)]],
            fields: this.fb.array([]),
            actions: this.fb.array([])
        }));
        this.form.get('wizard').markAsDirty();
        this.form.markAsDirty();
        this.form.get('wizard.selectedStep').patchValue(i + 1);
        this.selectedStepIndex = i + 1;
    }

    removeStep() {
        const selectedStep = this.form.get('wizard.selectedStep').value;
        if ((this.form.get('wizard.steps') as FormArray).controls.length === 0) {
            return;
        }
        this.deleteModal.title = 'Delete Step';
        this.deleteModal.message = 'Are you sure you want to delete this step?';
        this.deleteModalTemplateRef = this.commonService.modal(this.deleteModalTemplate);
        this.deleteModalTemplateRef.result.then((close) => {
            if (close) {
                const temp = (this.form.get(['wizard', 'steps', selectedStep]) as FormGroup);
                if (temp) {
                    (temp.get('fields') as FormArray).controls.forEach((control, i) => {
                        this.removeFromUsed((temp.get('fields') as FormArray).at(+i));
                    });
                }
                (this.form.get('wizard.steps') as FormArray).removeAt(selectedStep);
                this.form.get('wizard').markAsDirty();
                this.form.markAsDirty();
                if (selectedStep !== 0) {
                    this.form.get('wizard.selectedStep').patchValue(selectedStep - 1);
                } else {
                    this.form.get('wizard.selectedStep').patchValue(0);
                }
            }
        }, (dismiss) => { });
    }

    removeStepAt(index: number) {
        if ((this.form.get('wizard.steps') as FormArray).controls.length === 0) {
            return;
        }
        this.deleteModal.title = 'Delete Step';
        this.deleteModal.message = 'Are you sure you want to delete this step?';
        this.deleteModalTemplateRef = this.commonService.modal(this.deleteModalTemplate);
        this.deleteModalTemplateRef.result.then((close) => {
            if (close) {
                const formArray = (this.form.get(['wizard', 'steps']) as FormArray);
                const temp = formArray.at(index);
                if (temp) {
                    (temp.get('fields') as FormArray).controls.forEach((control, i) => {
                        this.removeFromUsed((temp.get('fields') as FormArray).at(+i));
                    });
                }
                if (formArray && formArray.length > 0) {
                    formArray.removeAt(index);
                }
                this.form.get('wizard').markAsDirty();
                this.form.markAsDirty();
                this.selectedStepIndex = 0;
            }
        }, (dismiss) => { });
    }

    removeHook(hookName, idx) {
        const selectedStep = this.form.get('wizard.selectedStep').value;
        if ((this.form.get('wizard.steps') as FormArray).controls.length === 0) {
            return;
        }
        this.deleteModal.title = 'Delete hook';
        this.deleteModal.message = 'Are you sure you want to delete hook ' + hookName + ' ?';
        const formArr = this.form.get(['wizard', 'steps', selectedStep, 'actions']) as FormArray;

        this.deleteModalTemplateRef = this.commonService.modal(this.deleteModalTemplate);
        this.deleteModalTemplateRef.result.then((close) => {
            if (close) {
                formArr.removeAt(idx);
                this.form.get('wizard').markAsDirty();
            }
        }, (dismiss) => { });
    }

    removeFromUsed(field) {
        const i = (this.form.get('wizard.usedFields') as FormArray).controls.findIndex(e => {
            if (e.value.key === field.value.key) {
                return true;
            }
        });
        if (i > -1) {
            (this.form.get('wizard.usedFields') as FormArray).removeAt(i);
        }
    }

    get isSchemaFree() {
        if (this.form && this.form.get('schemaFree')) {
            return this.form.get('schemaFree').value;
        }
        return false;
    }

    get steps() {
        return (this.form.get('wizard.steps') as FormArray).controls;
    }

    get selectedStepIndex() {
        return this.form ? this.form.get('wizard.selectedStep').value : 0;
    }

    set selectedStepIndex(val) {
        this.form ? this.form.get('wizard.selectedStep').patchValue(val) : null
    }
}
